// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import {
  acquireInflight,
  authenticate,
  AuthError,
  checkAndIncrement,
  checkKillswitch,
  releaseInflight,
} from "./middleware";
import { signJwt } from "./jwt";
import type { AccessCode, JwtPayload } from "./types";
import { JWT_TTL_SECONDS, KEY_PREFIX, TIER_CONFIG } from "./types";
import type { Env } from "./env";
import { asKv, MockKv } from "./test/kv-mock";

const SECRET = "test-secret-256-bit-or-thereabouts-for-hs256";

function makeAccessCode(overrides: Partial<AccessCode> = {}): AccessCode {
  const tierCfg = TIER_CONFIG.reviewer;
  const now = new Date();
  const expires = new Date(
    now.getTime() + tierCfg.expires_days * 86_400_000,
  );
  return {
    code: "speedrun-andrew-c",
    tier: "reviewer",
    label: "Andrew Chen",
    generations_used: 0,
    edits_used: 0,
    generations_max: tierCfg.generations_max,
    edits_max: tierCfg.edits_max,
    created_at: now.toISOString(),
    expires_at: expires.toISOString(),
    revoked: false,
    last_seen_at: null,
    ...overrides,
  };
}

function makeRequest(token: string | null): Request {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return new Request("https://example.com/api/me", { headers });
}

async function makeToken(code = "speedrun-andrew-c"): Promise<string> {
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
});

describe("authenticate", () => {
  it("returns context + refreshed token for a valid JWT and code", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const ctx = await authenticate(makeRequest(token), env);
    expect(ctx.payload.sub).toBe(code.code);
    expect(ctx.code.code).toBe(code.code);
    expect(ctx.refreshedToken.split(".").length).toBe(3);
  });

  it("rejects missing Authorization header (401)", async () => {
    await expect(authenticate(makeRequest(null), env)).rejects.toBeInstanceOf(
      AuthError,
    );
    await expect(authenticate(makeRequest(null), env)).rejects.toMatchObject({
      status: 401,
    });
  });

  it("rejects revoked code (401)", async () => {
    const code = makeAccessCode({ revoked: true });
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    await expect(authenticate(makeRequest(token), env)).rejects.toMatchObject({
      status: 401,
      body: { error: "Code revoked" },
    });
  });

  it("rejects expired AccessCode (401)", async () => {
    const code = makeAccessCode({
      expires_at: new Date(Date.now() - 1000).toISOString(),
    });
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    await expect(authenticate(makeRequest(token), env)).rejects.toMatchObject({
      status: 401,
      body: { error: "Code expired" },
    });
  });
});

describe("checkAndIncrement", () => {
  it("increments generation counter when under quota and persists", async () => {
    const code = makeAccessCode({ generations_used: 5 });
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const updated = await checkAndIncrement(env, code, "generation");
    expect(updated.generations_used).toBe(6);
    expect(updated.edits_used).toBe(0);
    const stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.generations_used).toBe(6);
  });

  it("rejects with 429 when generation quota exhausted", async () => {
    const code = makeAccessCode({
      generations_used: TIER_CONFIG.reviewer.generations_max,
    });
    await expect(
      checkAndIncrement(env, code, "generation"),
    ).rejects.toMatchObject({ status: 429 });
  });

  it("'both' kind increments both counters atomically per call", async () => {
    const code = makeAccessCode({ generations_used: 1, edits_used: 2 });
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const updated = await checkAndIncrement(env, code, "both");
    expect(updated.generations_used).toBe(2);
    expect(updated.edits_used).toBe(3);
  });
});

describe("killswitch", () => {
  it("returns true only when 'killswitch:active' is set to '1'", async () => {
    expect(await checkKillswitch(env)).toBe(false);
    kv.set(KEY_PREFIX.killswitch, "1");
    expect(await checkKillswitch(env)).toBe(true);
    kv.set(KEY_PREFIX.killswitch, "0");
    expect(await checkKillswitch(env)).toBe(false);
  });
});

describe("inflight lock", () => {
  it("acquires once, refuses until released, then re-acquires", async () => {
    const code = "speedrun-andrew-c";
    expect(await acquireInflight(env, code)).toBe(true);
    expect(await acquireInflight(env, code)).toBe(false);
    await releaseInflight(env, code);
    expect(await acquireInflight(env, code)).toBe(true);
  });
});
