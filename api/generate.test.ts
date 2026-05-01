// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the Anthropic client BEFORE importing the handler so the handler
// picks up the mocked module. The mock is reset per-test via the
// __setNext helper so each test can stage its own response sequence.
const anthropicMock = vi.hoisted(() => ({
  responses: [] as Array<
    | { kind: "ok"; text: string }
    | { kind: "throw"; status: number; message: string }
  >,
  callCount: 0,
}));

vi.mock("./anthropic", () => {
  return {
    AnthropicHttpError: class AnthropicHttpError extends Error {
      constructor(
        public status: number,
        message: string,
      ) {
        super(message);
        this.name = "AnthropicHttpError";
      }
    },
    anthropicStreamText: vi.fn(
      async (
        _apiKey: string,
        _req: unknown,
        onChunk: (chunk: string) => void,
      ): Promise<string> => {
        anthropicMock.callCount += 1;
        const next = anthropicMock.responses.shift();
        if (!next) throw new Error("Test misconfigured: no staged response");
        if (next.kind === "throw") {
          const Klass = (await import("./anthropic")).AnthropicHttpError;
          throw new Klass(next.status, next.message);
        }
        // Simulate two streamed fragments per call.
        const half = Math.floor(next.text.length / 2);
        onChunk(next.text.slice(0, half));
        onChunk(next.text.slice(half));
        return next.text;
      },
    ),
    anthropicComplete: vi.fn(),
  };
});

import { handleGenerate } from "./generate";
import { signJwt } from "./jwt";
import type { AccessCode, JwtPayload } from "./types";
import { JWT_TTL_SECONDS, KEY_PREFIX, TIER_CONFIG } from "./types";
import type { Env } from "./env";
import { asKv, MockKv } from "./test/kv-mock";

const SECRET = "test-secret-256-bit-or-thereabouts-for-hs256";

const VALID_SCORE = `# TITLE: Test
# TEMPO: 96
# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 1, -, I, -, (C4:mf:96) |
2, 1, -, V, -, (G4:mf:96) |
`;

const INVALID_SCORE = `# TITLE: Test
# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 200, -, -, -, (C4:mf:1) |
`;

function makeAccessCode(overrides: Partial<AccessCode> = {}): AccessCode {
  const cfg = TIER_CONFIG.reviewer;
  const now = new Date();
  return {
    code: "speedrun-test",
    tier: "reviewer",
    label: "Test",
    generations_used: 0,
    edits_used: 0,
    generations_max: cfg.generations_max,
    edits_max: cfg.edits_max,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + cfg.expires_days * 86_400_000).toISOString(),
    revoked: false,
    last_seen_at: null,
    ...overrides,
  };
}

async function makeToken(code = "speedrun-test"): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: code,
    tier: "reviewer",
    jti: "00000000-0000-4000-8000-000000000000",
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  };
  return signJwt(payload, SECRET);
}

function makePost(token: string, body: unknown): Request {
  return new Request("https://example.com/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

async function readSseEvents(
  resp: Response,
): Promise<Array<{ event: string; data: unknown }>> {
  if (!resp.body) return [];
  const reader = resp.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value);
  }
  const out: Array<{ event: string; data: unknown }> = [];
  for (const chunk of buf.split("\n\n")) {
    if (!chunk.trim()) continue;
    let event = "message";
    let data = "";
    for (const line of chunk.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) data += line.slice(5).trim();
    }
    let parsed: unknown = data;
    try {
      parsed = JSON.parse(data);
    } catch {
      /* keep raw */
    }
    out.push({ event, data: parsed });
  }
  return out;
}

let kv: MockKv;
let env: Env;

beforeEach(() => {
  kv = new MockKv();
  env = {
    WAVELODY_CODES: asKv(kv),
    WAVELODY_JWT_SECRET: SECRET,
    ANTHROPIC_API_KEY: "test-anthropic-key",
    GEMINI_API_KEY: "test-gemini-key",
  };
  anthropicMock.responses = [];
  anthropicMock.callCount = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/generate", () => {
  it("rejects missing prompt with 400", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleGenerate(
      makePost(token, { template: "piano_trio" }),
      env,
    );
    expect(resp.status).toBe(400);
  });

  it("rejects oversized prompt with 400", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const huge = "a".repeat(2000);
    const resp = await handleGenerate(makePost(token, { prompt: huge }), env);
    expect(resp.status).toBe(400);
  });

  it("streams chunks and emits a complete event on first-attempt success", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    anthropicMock.responses = [{ kind: "ok", text: VALID_SCORE }];
    const token = await makeToken();
    const resp = await handleGenerate(
      makePost(token, { prompt: "Pensive A-minor" }),
      env,
    );
    expect(resp.status).toBe(200);
    expect(resp.headers.get("Content-Type")).toMatch(/event-stream/);
    expect(resp.headers.get("X-Refreshed-Token")).not.toBeNull();
    const events = await readSseEvents(resp);
    expect(events.find((e) => e.event === "attempt")).toBeTruthy();
    expect(events.filter((e) => e.event === "chunk").length).toBeGreaterThan(0);
    const complete = events.find((e) => e.event === "complete");
    expect(complete).toBeTruthy();
    expect((complete!.data as { musicdsl: string }).musicdsl).toBe(
      VALID_SCORE,
    );
    expect(anthropicMock.callCount).toBe(1);
  });

  it("retries on validation failure and succeeds on the second attempt", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    anthropicMock.responses = [
      { kind: "ok", text: INVALID_SCORE },
      { kind: "ok", text: VALID_SCORE },
    ];
    const token = await makeToken();
    const resp = await handleGenerate(
      makePost(token, { prompt: "Test" }),
      env,
    );
    const events = await readSseEvents(resp);
    const validations = events.filter((e) => e.event === "validation");
    expect(validations).toHaveLength(1);
    expect((validations[0].data as { valid: boolean }).valid).toBe(false);
    const complete = events.find((e) => e.event === "complete");
    expect(complete).toBeTruthy();
    expect(anthropicMock.callCount).toBe(2);
  });

  it("emits error event after 3 failed attempts", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    anthropicMock.responses = [
      { kind: "ok", text: INVALID_SCORE },
      { kind: "ok", text: INVALID_SCORE },
      { kind: "ok", text: INVALID_SCORE },
    ];
    const token = await makeToken();
    const resp = await handleGenerate(
      makePost(token, { prompt: "Test" }),
      env,
    );
    const events = await readSseEvents(resp);
    const errEvent = events.find((e) => e.event === "error");
    expect(errEvent).toBeTruthy();
    const errData = errEvent!.data as {
      error: string;
      retry_after_seconds: number;
    };
    expect(errData.error).toBe("composition_failed");
    expect(errData.retry_after_seconds).toBe(5);
    expect(anthropicMock.callCount).toBe(3);
  });

  it("treats Anthropic HTTP errors like a failed attempt and retries", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    anthropicMock.responses = [
      { kind: "throw", status: 500, message: "upstream blew up" },
      { kind: "ok", text: VALID_SCORE },
    ];
    const token = await makeToken();
    const resp = await handleGenerate(
      makePost(token, { prompt: "Test" }),
      env,
    );
    const events = await readSseEvents(resp);
    const validation = events.find((e) => e.event === "validation");
    expect(validation).toBeTruthy();
    expect(events.find((e) => e.event === "complete")).toBeTruthy();
    expect(anthropicMock.callCount).toBe(2);
  });

  it("releases the inflight lock after streaming ends", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    anthropicMock.responses = [{ kind: "ok", text: VALID_SCORE }];
    const token = await makeToken();
    const resp = await handleGenerate(
      makePost(token, { prompt: "Test" }),
      env,
    );
    await readSseEvents(resp);
    expect(kv.raw().has(KEY_PREFIX.inflight + code.code)).toBe(false);
  });

  it("rejects unauthenticated calls before invoking Claude", async () => {
    anthropicMock.responses = [{ kind: "ok", text: VALID_SCORE }];
    const resp = await handleGenerate(
      new Request("https://example.com/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Test" }),
      }),
      env,
    );
    expect(resp.status).toBe(401);
    expect(anthropicMock.callCount).toBe(0);
  });
});
