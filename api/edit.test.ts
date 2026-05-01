// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    anthropicComplete: vi.fn(async (): Promise<string> => {
      anthropicMock.callCount += 1;
      const next = anthropicMock.responses.shift();
      if (!next) throw new Error("Test misconfigured: no staged response");
      if (next.kind === "throw") {
        const Klass = (await import("./anthropic")).AnthropicHttpError;
        throw new Klass(next.status, next.message);
      }
      return next.text;
    }),
    anthropicStreamText: vi.fn(),
  };
});

import { handleEdit } from "./edit";
import { signJwt } from "./jwt";
import type { AccessCode, JwtPayload, EditResponse } from "./types";
import { JWT_TTL_SECONDS, KEY_PREFIX, TIER_CONFIG } from "./types";
import type { Env } from "./env";
import { asKv, MockKv } from "./test/kv-mock";

const SECRET = "test-secret-256-bit-or-thereabouts-for-hs256";

const VALID_SLICE = `# TITLE: slice
# TIME: 4/4
# RESOLUTION: 96
# VOICES: LH, RH, V, Vc
1, 1, -, I, -, (C2:f:24), (C4,E4,G4:mf:12), (G4:mf:96), (C3:mp:48)
95R |
`;

const INVALID_SLICE = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 1, -, -, -, (C4:mf:200) |
`;

const CURRENT_SCORE = `# TITLE: Test
# TIME: 4/4
# RESOLUTION: 96
# VOICES: LH, RH, V, Vc
1, 1, -, I, -, (C2:f:96), (C4:mp:96), (G4:mp:96), (C3:mp:96) |
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

async function makeToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: "speedrun-test",
    tier: "reviewer",
    jti: "00000000-0000-4000-8000-000000000000",
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  };
  return signJwt(payload, SECRET);
}

function makePost(token: string, body: unknown): Request {
  return new Request("https://example.com/api/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
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

describe("POST /api/edit", () => {
  it("returns the validated slice + echoes selection on success", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    anthropicMock.responses = [{ kind: "ok", text: VALID_SLICE }];
    const token = await makeToken();
    const resp = await handleEdit(
      makePost(token, {
        voice_id: "V",
        bar_start: 1,
        bar_end: 1,
        edit_prompt: "Make it pensive",
        current_score: CURRENT_SCORE,
      }),
      env,
    );
    expect(resp.status).toBe(200);
    expect(resp.headers.get("X-Refreshed-Token")).not.toBeNull();
    const body = (await resp.json()) as EditResponse;
    expect(body.slice).toBe(VALID_SLICE);
    expect(body.voice_id).toBe("V");
    expect(body.bar_start).toBe(1);
    expect(body.bar_end).toBe(1);
  });

  it("rejects malformed body with 400", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleEdit(
      makePost(token, { voice_id: "V" }),
      env,
    );
    expect(resp.status).toBe(400);
  });

  it("retries on validation failure and succeeds on the second attempt", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    anthropicMock.responses = [
      { kind: "ok", text: INVALID_SLICE },
      { kind: "ok", text: VALID_SLICE },
    ];
    const token = await makeToken();
    const resp = await handleEdit(
      makePost(token, {
        voice_id: "V",
        bar_start: 1,
        bar_end: 1,
        edit_prompt: "Test",
        current_score: CURRENT_SCORE,
      }),
      env,
    );
    expect(resp.status).toBe(200);
    expect(anthropicMock.callCount).toBe(2);
  });

  it("returns 503 + edit_failed after 3 failed attempts", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    anthropicMock.responses = [
      { kind: "ok", text: INVALID_SLICE },
      { kind: "ok", text: INVALID_SLICE },
      { kind: "ok", text: INVALID_SLICE },
    ];
    const token = await makeToken();
    const resp = await handleEdit(
      makePost(token, {
        voice_id: "V",
        bar_start: 1,
        bar_end: 1,
        edit_prompt: "Test",
        current_score: CURRENT_SCORE,
      }),
      env,
    );
    expect(resp.status).toBe(503);
    const body = (await resp.json()) as { error: string };
    expect(body.error).toBe("edit_failed");
    expect(anthropicMock.callCount).toBe(3);
  });

  it("ignores killswitch (edits are cheap by spec)", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    kv.set(KEY_PREFIX.killswitch, "1");
    anthropicMock.responses = [{ kind: "ok", text: VALID_SLICE }];
    const token = await makeToken();
    const resp = await handleEdit(
      makePost(token, {
        voice_id: "V",
        bar_start: 1,
        bar_end: 1,
        edit_prompt: "Test",
        current_score: CURRENT_SCORE,
      }),
      env,
    );
    expect(resp.status).toBe(200);
  });
});
