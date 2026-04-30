// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { handleGenerate } from "./generate";
import { handleEdit } from "./edit";
import { handleRender } from "./render";
import { handleCritique } from "./critique";
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
    generations_used: 0,
    edits_used: 0,
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

function makePost(token: string | null, path: string): Request {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return new Request(`https://example.com${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify({}),
  });
}

let kv: MockKv;
let env: Env;

beforeEach(() => {
  kv = new MockKv();
  env = { WAVELODY_CODES: asKv(kv), WAVELODY_JWT_SECRET: SECRET };
});

describe("write endpoints — common gate behaviour", () => {
  it("rejects unauthenticated calls with 401", async () => {
    for (const handler of [
      handleGenerate,
      handleEdit,
      handleRender,
      handleCritique,
    ]) {
      const resp = await handler(makePost(null, "/api/x"), env);
      expect(resp.status).toBe(401);
    }
  });
});

describe("POST /api/generate", () => {
  it("returns 501 + increments generations_used + emits refresh header", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleGenerate(makePost(token, "/api/generate"), env);
    expect(resp.status).toBe(501);
    expect(resp.headers.get("X-Refreshed-Token")).not.toBeNull();
    const stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.generations_used).toBe(1);
    expect(stored.edits_used).toBe(0);
  });

  it("returns 503 when the killswitch is active", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    kv.set(KEY_PREFIX.killswitch, "1");
    const token = await makeToken();
    const resp = await handleGenerate(makePost(token, "/api/generate"), env);
    expect(resp.status).toBe(503);
    const body = (await resp.json()) as { error: string };
    expect(body.error).toMatch(/demo paused/i);
    // Killswitch must short-circuit before any counter increment.
    const stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.generations_used).toBe(0);
  });

  it("returns 429 when the generation quota is exhausted", async () => {
    const code = makeAccessCode({
      generations_used: TIER_CONFIG.reviewer.generations_max,
    });
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleGenerate(makePost(token, "/api/generate"), env);
    expect(resp.status).toBe(429);
    const body = (await resp.json()) as { error: string };
    expect(body.error).toMatch(/quota exceeded/i);
  });

  it("returns 429 when an inflight generation already exists for the code", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    // Simulate an in-progress generation by writing the inflight key.
    kv.set(
      KEY_PREFIX.inflight + code.code,
      String(Date.now() + 60_000),
    );
    const token = await makeToken();
    const resp = await handleGenerate(makePost(token, "/api/generate"), env);
    expect(resp.status).toBe(429);
    const body = (await resp.json()) as { error: string };
    expect(body.error).toMatch(/already in progress/i);
  });

  it("releases the inflight lock after the request completes", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    await handleGenerate(makePost(token, "/api/generate"), env);
    expect(kv.raw().has(KEY_PREFIX.inflight + code.code)).toBe(false);
    // A second call should now succeed (still under quota).
    const resp2 = await handleGenerate(makePost(token, "/api/generate"), env);
    expect(resp2.status).toBe(501);
  });
});

describe("POST /api/edit", () => {
  it("returns 501 + increments edits_used (not generations_used)", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleEdit(makePost(token, "/api/edit"), env);
    expect(resp.status).toBe(501);
    const stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.edits_used).toBe(1);
    expect(stored.generations_used).toBe(0);
  });

  it("ignores the killswitch (edits are cheap, killswitch protects RunPod)", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    kv.set(KEY_PREFIX.killswitch, "1");
    const token = await makeToken();
    const resp = await handleEdit(makePost(token, "/api/edit"), env);
    expect(resp.status).toBe(501);
  });
});

describe("POST /api/render", () => {
  it("counts against generations_used per spec", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleRender(makePost(token, "/api/render"), env);
    expect(resp.status).toBe(501);
    const stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.generations_used).toBe(1);
  });

  it("returns 503 when the killswitch is active", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    kv.set(KEY_PREFIX.killswitch, "1");
    const token = await makeToken();
    const resp = await handleRender(makePost(token, "/api/render"), env);
    expect(resp.status).toBe(503);
  });
});

describe("POST /api/critique", () => {
  it("increments both counters per spec", async () => {
    const code = makeAccessCode({ generations_used: 2, edits_used: 3 });
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleCritique(makePost(token, "/api/critique"), env);
    expect(resp.status).toBe(501);
    const stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.generations_used).toBe(3);
    expect(stored.edits_used).toBe(4);
  });
});
