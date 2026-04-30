// GET /api/me — read-only quota state for the authenticated code.
//
// 200 with QuotaState (SessionInfo + generations_used + edits_used). Used by
// the workspace top bar to show "12 of 20 generations remaining".
// 401 if the bearer JWT is missing / invalid / refers to a missing-or-revoked
//     code.

import { json } from "./http";
import { authenticate, AuthError, refreshHeader } from "./middleware";
import type { QuotaState } from "./types";
import type { Env } from "./env";

export async function handleMe(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  let ctx;
  try {
    ctx = await authenticate(request, env);
  } catch (e: unknown) {
    if (e instanceof AuthError) return json(e.body, e.status);
    throw e;
  }

  const state: QuotaState = {
    code: ctx.code.code,
    tier: ctx.code.tier,
    label: ctx.code.label,
    generations_used: ctx.code.generations_used,
    edits_used: ctx.code.edits_used,
    generations_max: ctx.code.generations_max,
    edits_max: ctx.code.edits_max,
    expires_at: ctx.code.expires_at,
  };

  return json(state, 200, refreshHeader(ctx.refreshedToken));
}
