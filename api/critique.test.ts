// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const geminiMock = vi.hoisted(() => ({
  next: null as
    | null
    | { kind: "ok"; payload: unknown }
    | { kind: "throw"; status: number; message: string },
  callCount: 0,
}));

vi.mock("./gemini", () => {
  return {
    GeminiHttpError: class GeminiHttpError extends Error {
      constructor(
        public status: number,
        message: string,
      ) {
        super(message);
        this.name = "GeminiHttpError";
      }
    },
    geminiCritique: vi.fn(async (): Promise<unknown> => {
      geminiMock.callCount += 1;
      const next = geminiMock.next;
      geminiMock.next = null;
      if (!next) throw new Error("Test misconfigured: no staged response");
      if (next.kind === "throw") {
        const Klass = (await import("./gemini")).GeminiHttpError;
        throw new Klass(next.status, next.message);
      }
      return next.payload;
    }),
  };
});

import { handleCritique } from "./critique";
import { signJwt } from "./jwt";
import type {
  AccessCode,
  JwtPayload,
  CritiqueResponse,
} from "./types";
import { JWT_TTL_SECONDS, KEY_PREFIX, TIER_CONFIG } from "./types";
import type { Env } from "./env";
import { asKv, MockKv } from "./test/kv-mock";

const SECRET = "test-secret-256-bit-or-thereabouts-for-hs256";

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
  return new Request("https://example.com/api/critique", {
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
  geminiMock.next = null;
  geminiMock.callCount = 0;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/critique", () => {
  it("returns the typed suggestion list on success", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    geminiMock.next = {
      kind: "ok",
      payload: {
        suggestions: [
          {
            location: "bar 3 beat 49 voice V",
            issue: "Voice leading skips a step.",
            suggested_fix: "`(B4:mp:24)` → `(A4:mp:24)`.",
          },
          {
            location: "bars 5-7 all voices",
            issue: "Dynamic plateau without arc.",
            suggested_fix: "Crescendo from mp to f over the three bars.",
          },
        ],
      },
    };
    const token = await makeToken();
    const resp = await handleCritique(
      makePost(token, {
        musicdsl: "# TEMPO: 96\n",
        master_wav_url: "https://r2.example/render/abc/master.wav",
        original_prompt: "Pensive A-minor",
      }),
      env,
    );
    expect(resp.status).toBe(200);
    const body = (await resp.json()) as CritiqueResponse;
    expect(body.suggestions).toHaveLength(2);
    expect(body.suggestions[0].location).toMatch(/bar 3/);
  });

  it("rejects malformed body with 400 before calling Gemini", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleCritique(
      makePost(token, { musicdsl: "x" }),
      env,
    );
    expect(resp.status).toBe(400);
    expect(geminiMock.callCount).toBe(0);
  });

  it("returns 502 critique_failed on a Gemini upstream error", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    geminiMock.next = { kind: "throw", status: 502, message: "Gemini down" };
    const token = await makeToken();
    const resp = await handleCritique(
      makePost(token, {
        musicdsl: "# TEMPO: 96\n",
        master_wav_url: "https://r2.example/render/abc/master.wav",
        original_prompt: "Test",
      }),
      env,
    );
    expect(resp.status).toBe(502);
    const body = (await resp.json()) as { error: string };
    expect(body.error).toBe("critique_failed");
  });

  it("debits both quotas (generation + edit) on success", async () => {
    const code = makeAccessCode({ generations_used: 2, edits_used: 3 });
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    geminiMock.next = { kind: "ok", payload: { suggestions: [] } };
    const token = await makeToken();
    await handleCritique(
      makePost(token, {
        musicdsl: "# TEMPO: 96\n",
        master_wav_url: "https://r2.example/render/abc/master.wav",
        original_prompt: "Test",
      }),
      env,
    );
    const stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.generations_used).toBe(3);
    expect(stored.edits_used).toBe(4);
  });
});
