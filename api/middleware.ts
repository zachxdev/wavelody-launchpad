// Middleware for the authenticated endpoints (/api/me, /api/generate,
// /api/edit, /api/render, /api/critique). Verifies the bearer JWT, looks up
// the AccessCode in KV, enforces revoked / expiry / quota rules, and
// re-issues a fresh token on every successful call so the client can keep
// the 7-day sliding window alive.

import { signJwt, verifyJwt } from "./jwt";
import type { AccessCode, JwtPayload } from "./types";
import { JWT_TTL_SECONDS, KEY_PREFIX } from "./types";
import type { Env } from "./env";

export class AuthError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error: string } & Record<string, unknown>,
  ) {
    super(body.error);
    this.name = "AuthError";
  }
}

export type QuotaKind = "generation" | "edit" | "both";

export interface AuthContext {
  payload: JwtPayload;
  code: AccessCode;
  refreshedToken: string;
}

export async function authenticate(
  request: Request,
  env: Env,
): Promise<AuthContext> {
  const header = request.headers.get("Authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    throw new AuthError(401, { error: "Missing Authorization header" });
  }
  const token = header.slice("bearer ".length).trim();

  let payload: JwtPayload;
  try {
    payload = await verifyJwt(token, env.WAVELODY_JWT_SECRET);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Invalid token";
    throw new AuthError(401, { error: msg });
  }

  const raw = await env.WAVELODY_CODES.get(KEY_PREFIX.code + payload.sub);
  if (!raw) throw new AuthError(401, { error: "Code not found" });

  let code: AccessCode;
  try {
    code = JSON.parse(raw) as AccessCode;
  } catch {
    throw new AuthError(500, { error: "Corrupted code record" });
  }

  if (code.revoked) {
    throw new AuthError(401, { error: "Code revoked" });
  }
  if (Date.parse(code.expires_at) < Date.now()) {
    throw new AuthError(401, { error: "Code expired" });
  }

  const now = Math.floor(Date.now() / 1000);
  const refreshedToken = await signJwt(
    {
      sub: payload.sub,
      tier: payload.tier,
      jti: payload.jti,
      iat: now,
      exp: now + JWT_TTL_SECONDS,
    },
    env.WAVELODY_JWT_SECRET,
  );

  return { payload, code, refreshedToken };
}

export async function checkAndIncrement(
  env: Env,
  code: AccessCode,
  kind: QuotaKind,
): Promise<AccessCode> {
  if (kind === "generation" || kind === "both") {
    if (code.generations_used >= code.generations_max) {
      throw new AuthError(429, {
        error: "Generation quota exceeded",
        retry_after_seconds: 0,
        used: code.generations_used,
        max: code.generations_max,
      });
    }
  }
  if (kind === "edit" || kind === "both") {
    if (code.edits_used >= code.edits_max) {
      throw new AuthError(429, {
        error: "Edit quota exceeded",
        retry_after_seconds: 0,
        used: code.edits_used,
        max: code.edits_max,
      });
    }
  }

  // Read-modify-write. KV doesn't ship true CAS — for /generate the
  // inflight lock serialises per-code requests, and on /edit at our scale
  // (≤ 60 edits per code) the worst-case overcount is negligible.
  const updated: AccessCode = {
    ...code,
    last_seen_at: new Date().toISOString(),
  };
  if (kind === "generation" || kind === "both") {
    updated.generations_used += 1;
  }
  if (kind === "edit" || kind === "both") {
    updated.edits_used += 1;
  }
  await env.WAVELODY_CODES.put(
    KEY_PREFIX.code + code.code,
    JSON.stringify(updated),
  );
  return updated;
}

export async function touchLastSeen(
  env: Env,
  code: AccessCode,
): Promise<AccessCode> {
  const updated: AccessCode = {
    ...code,
    last_seen_at: new Date().toISOString(),
  };
  await env.WAVELODY_CODES.put(
    KEY_PREFIX.code + code.code,
    JSON.stringify(updated),
  );
  return updated;
}

export async function checkKillswitch(env: Env): Promise<boolean> {
  const v = await env.WAVELODY_CODES.get(KEY_PREFIX.killswitch);
  return v === "1";
}

const INFLIGHT_TTL_SECONDS = 90;

export async function acquireInflight(
  env: Env,
  code: string,
): Promise<boolean> {
  const key = KEY_PREFIX.inflight + code;
  const existing = await env.WAVELODY_CODES.get(key);
  if (existing) {
    const expiry = Number(existing);
    if (Number.isFinite(expiry) && expiry > Date.now()) return false;
  }
  const expiryMs = Date.now() + INFLIGHT_TTL_SECONDS * 1000;
  await env.WAVELODY_CODES.put(key, String(expiryMs), {
    expirationTtl: INFLIGHT_TTL_SECONDS,
  });
  return true;
}

export async function releaseInflight(
  env: Env,
  code: string,
): Promise<void> {
  await env.WAVELODY_CODES.delete(KEY_PREFIX.inflight + code);
}

export function refreshHeader(token: string): Record<string, string> {
  return { "X-Refreshed-Token": token };
}
