// Shared helpers for the Phase 8b API clients.
//
// Auth: every call grabs the bearer token from the stored ClientSession
// and absorbs the X-Refreshed-Token response header into sessionStorage,
// keeping the 7-day sliding window alive without explicit /api/me polls.
//
// Errors: the API uses standard HTTP statuses + a JSON body of shape
// { error: string, detail?: string, retry_after_seconds?: number }. The
// ApiError thrown here carries the parsed body so UI can surface
// retry-after timing and detail strings.

import { getSession, STORAGE_KEY, type ClientSession } from "@/lib/auth/client";
import type { StoredSession } from "@/lib/auth/client";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error: string } & Record<string, unknown>,
  ) {
    super(body.error || `HTTP ${status}`);
    this.name = "ApiError";
  }
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("No active session");
    this.name = "NotAuthenticatedError";
  }
}

export function requireSession(): ClientSession {
  const s = getSession();
  if (!s) throw new NotAuthenticatedError();
  return s;
}

// Pull the refreshed token out of a Response and persist it back to
// storage. The /api/auth response writes a full StoredSession; subsequent
// calls only emit X-Refreshed-Token, so we reuse the existing
// SessionInfo.
export function absorbRefreshedToken(resp: Response): void {
  const refreshed = resp.headers.get("X-Refreshed-Token");
  if (!refreshed) return;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const stored = JSON.parse(raw) as StoredSession;
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: refreshed, info: stored.info }),
    );
  } catch {
    /* swallow — corruption already caught by getSession() */
  }
}

export async function jsonFetch<T>(
  path: string,
  init: RequestInit & { signal?: AbortSignal } = {},
): Promise<T> {
  const session = requireSession();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${session.token}`);

  const resp = await fetch(path, { ...init, headers });
  absorbRefreshedToken(resp);

  if (!resp.ok) {
    let body: { error: string } & Record<string, unknown>;
    try {
      body = (await resp.json()) as { error: string } & Record<string, unknown>;
    } catch {
      body = { error: `HTTP ${resp.status}` };
    }
    throw new ApiError(resp.status, body);
  }
  return (await resp.json()) as T;
}
