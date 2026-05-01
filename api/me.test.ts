// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { handleMe } from "./me";
import { signJwt } from "./jwt";
import type { AccessCode, JwtPayload } from "./types";
import { JWT_TTL_SECONDS, KEY_PREFIX, TIER_CONFIG } from "./types";
import type { Env } from "./env";
import { asKv, MockKv } from "./test/kv-mock";

const SECRET = "test-secret-256-bit-or-thereabouts-for-hs256";

function makeAccessCode(overrides: Partial<AccessCode> = {}): AccessCode {
  const tierCfg = TIER_CONFIG.reviewer;
  const now = new Date();
  return {
    code: "speedrun-andrew-c",
    tier: "reviewer",
    label: "Andrew Chen",
    generations_used: 3,
    edits_used: 7,
    generations_max: tierCfg.generations_max,
    edits_max: tierCfg.edits_max,
    created_at: now.toISOString(),
    expires_at: new Date(
      now.getTime() + tierCfg.expires_days * 86_400_000,
    ).toISOString(),
    revoked: false,
    last_seen_at: null,
    ...overrides,
  };
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

function makeGet(token: string | null): Request {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return new Request("https://example.com/api/me", { method: "GET", headers });
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

describe("GET /api/me", () => {
  it("returns the current quota state and a refreshed token header", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleMe(makeGet(token), env);
    expect(resp.status).toBe(200);
    const refreshed = resp.headers.get("X-Refreshed-Token");
    expect(refreshed?.split(".").length).toBe(3);

    const body = (await resp.json()) as Record<string, unknown>;
    expect(body.code).toBe(code.code);
    expect(body.generations_used).toBe(3);
    expect(body.edits_used).toBe(7);
    expect(body.generations_max).toBe(TIER_CONFIG.reviewer.generations_max);
  });

  it("rejects missing token with 401", async () => {
    const resp = await handleMe(makeGet(null), env);
    expect(resp.status).toBe(401);
  });

  it("rejects POST with 405", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const req = new Request("https://example.com/api/me", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const resp = await handleMe(req, env);
    expect(resp.status).toBe(405);
  });
});
