// @vitest-environment node
import { beforeEach, describe, expect, it } from "vitest";
import { handleAuth } from "./auth";
import { decodeJwtUnsafe } from "./jwt";
import type { AccessCode } from "./types";
import { KEY_PREFIX, TIER_CONFIG } from "./types";
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

function makePost(body: unknown): Request {
  return new Request("https://example.com/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
});

describe("POST /api/auth", () => {
  it("issues a JWT + session for a valid code", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const resp = await handleAuth(makePost({ code: code.code }), env);
    expect(resp.status).toBe(200);
    const body = (await resp.json()) as {
      token: string;
      session: { code: string; tier: string; label: string };
    };
    expect(body.session.code).toBe(code.code);
    expect(body.session.tier).toBe("reviewer");
    expect(body.session.label).toBe("Andrew Chen");
    // Counters are stripped from the session payload per spec.
    expect((body.session as Record<string, unknown>).generations_used).toBeUndefined();
    expect((body.session as Record<string, unknown>).edits_used).toBeUndefined();
    const decoded = decodeJwtUnsafe(body.token);
    expect(decoded?.sub).toBe(code.code);
    expect(decoded?.tier).toBe("reviewer");
  });

  it("rejects unknown code with 401", async () => {
    const resp = await handleAuth(makePost({ code: "speedrun-nobody" }), env);
    expect(resp.status).toBe(401);
  });

  it("rejects empty code with 400", async () => {
    const resp = await handleAuth(makePost({ code: "" }), env);
    expect(resp.status).toBe(400);
  });

  it("rejects malformed code format with 400", async () => {
    const resp = await handleAuth(
      makePost({ code: "has spaces and !!!" }),
      env,
    );
    expect(resp.status).toBe(400);
  });

  it("rejects revoked code with 401", async () => {
    const code = makeAccessCode({ revoked: true });
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const resp = await handleAuth(makePost({ code: code.code }), env);
    expect(resp.status).toBe(401);
    expect((await resp.json()) as { error: string }).toMatchObject({
      error: "Code revoked",
    });
  });

  it("issues a JWT for the built-in dev-network-owner code without KV seed", async () => {
    const resp = await handleAuth(
      makePost({ code: "dev-network-owner" }),
      env,
    );
    expect(resp.status).toBe(200);
    const body = (await resp.json()) as {
      token: string;
      session: { code: string; tier: string; label: string };
    };
    expect(body.session.code).toBe("dev-network-owner");
    expect(body.session.tier).toBe("reviewer");
    // The auth handler should have materialised the code into KV so quota
    // tracking and revoke checks work on subsequent middleware reads.
    const stored = kv.raw().get(KEY_PREFIX.code + "dev-network-owner");
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored as string) as AccessCode;
    expect(parsed.label).toBe("Dev Network Owner");
    expect(parsed.revoked).toBe(false);
  });

  it("accepts the built-in code case-insensitively", async () => {
    const resp = await handleAuth(
      makePost({ code: "DEV-Network-Owner" }),
      env,
    );
    expect(resp.status).toBe(200);
  });

  it("touches last_seen_at on success", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const before = Date.now();
    await handleAuth(makePost({ code: code.code }), env);
    const stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.last_seen_at).not.toBeNull();
    expect(Date.parse(stored.last_seen_at as string)).toBeGreaterThanOrEqual(
      before,
    );
  });
});
