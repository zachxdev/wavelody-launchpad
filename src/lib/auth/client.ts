// Client-side helpers for the access-code auth flow.
//
// postAuth(code) → POST /api/auth, store the result in sessionStorage
// getSession()   → decode the stored JWT, return null if absent / expired
//                  / shaped invalid (signature is NOT verified client-side;
//                  the server is the authority — this just gates rendering)
// clearSession() → wipe the stored token
//
// Storage format under sessionStorage[STORAGE_KEY]:
//   { token: string, info: SessionInfo }

import type { JwtPayload, SessionInfo, Tier } from "../../../api/types";

export const STORAGE_KEY = "wavelody-session";

export interface StoredSession {
  token: string;
  info: SessionInfo;
}

export interface ClientSession {
  token: string;
  payload: JwtPayload;
  info: SessionInfo;
}

export class AuthError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export async function postAuth(code: string): Promise<StoredSession> {
  const resp = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!resp.ok) {
    let message = `Request failed (${resp.status})`;
    try {
      const body = (await resp.json()) as { error?: unknown };
      if (typeof body.error === "string") message = body.error;
    } catch {
      /* swallow — the status code carries the signal */
    }
    throw new AuthError(resp.status, message);
  }

  const data = (await resp.json()) as StoredSession;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function getSession(): ClientSession | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  let stored: StoredSession;
  try {
    stored = JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }

  if (typeof stored?.token !== "string" || !stored.info) return null;

  const payload = decodeJwtUnsafe(stored.token);
  if (!payload) return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return { token: stored.token, payload, info: stored.info };
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

const VALID_TIERS: ReadonlySet<Tier> = new Set<Tier>([
  "reviewer",
  "friend",
  "public",
]);

// Header-payload-signature decode without signature verification. The server
// is the only authority on signature validity; this is for client-side
// expiry / shape gating before redirecting to /app.
function decodeJwtUnsafe(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const obj = JSON.parse(json) as Record<string, unknown>;
    if (
      typeof obj.sub !== "string" ||
      typeof obj.jti !== "string" ||
      typeof obj.iat !== "number" ||
      typeof obj.exp !== "number" ||
      typeof obj.tier !== "string" ||
      !VALID_TIERS.has(obj.tier as Tier)
    ) {
      return null;
    }
    return {
      sub: obj.sub,
      jti: obj.jti,
      iat: obj.iat,
      exp: obj.exp,
      tier: obj.tier as Tier,
    };
  } catch {
    return null;
  }
}
