// POST /api/auth — exchange an access code for a JWT.
//
// 200 with { token, session }:
//   - token: HS256 JWT, 7-day exp, sliding window via X-Refreshed-Token on
//     subsequent authenticated calls.
//   - session: AccessCode minus counters, plus expires_at and tier.
// 400 if the body is malformed or the code is missing/empty.
// 400 if the code doesn't match the format regex.
// 401 if the code isn't in KV (or in the built-in fallback list), or is
// revoked, or its expires_at has passed. Built-in codes are materialised
// into KV on first auth so subsequent middleware reads behave normally.

import { json } from "./http";
import { signJwt } from "./jwt";
import { buildBuiltInAccessCode } from "./builtin-codes";
import type { AccessCode, JwtPayload, SessionInfo, SessionMeta } from "./types";
import {
  ACCESS_CODE_REGEX,
  JWT_TTL_SECONDS,
  KEY_PREFIX,
} from "./types";
import type { Env } from "./env";

export async function handleAuth(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const codeRaw = extractCode(body);
  if (codeRaw === null) {
    return json({ error: "Missing 'code' field" }, 400);
  }
  const code = codeRaw.trim();
  if (!code) return json({ error: "Code cannot be empty" }, 400);
  if (!ACCESS_CODE_REGEX.test(code)) {
    return json({ error: "Invalid code format" }, 400);
  }

  const normalized = code.toLowerCase();
  const stored = await env.WAVELODY_CODES.get(KEY_PREFIX.code + normalized);

  let accessCode: AccessCode;
  if (stored === null) {
    const builtIn = buildBuiltInAccessCode(normalized);
    if (!builtIn) {
      return json({ error: "Code not recognized" }, 401);
    }
    accessCode = builtIn;
  } else {
    try {
      accessCode = JSON.parse(stored) as AccessCode;
    } catch {
      return json({ error: "Corrupted code record" }, 500);
    }
  }

  if (accessCode.revoked) {
    return json({ error: "Code revoked" }, 401);
  }
  if (Date.parse(accessCode.expires_at) < Date.now()) {
    return json({ error: "Code expired" }, 401);
  }

  // Touch last_seen_at — useful intel for partner follow-up per the spec.
  accessCode.last_seen_at = new Date().toISOString();
  await env.WAVELODY_CODES.put(
    KEY_PREFIX.code + accessCode.code,
    JSON.stringify(accessCode),
  );

  const jti = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: accessCode.code,
    tier: accessCode.tier,
    jti,
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  };
  const token = await signJwt(payload, env.WAVELODY_JWT_SECRET);

  const meta: SessionMeta = {
    code: accessCode.code,
    jti,
    created_at: new Date().toISOString(),
    user_agent: request.headers.get("User-Agent"),
  };
  await env.WAVELODY_CODES.put(
    KEY_PREFIX.session + jti,
    JSON.stringify(meta),
    { expirationTtl: JWT_TTL_SECONDS + 86_400 },
  );

  const session: SessionInfo = {
    code: accessCode.code,
    tier: accessCode.tier,
    label: accessCode.label,
    generations_max: accessCode.generations_max,
    edits_max: accessCode.edits_max,
    expires_at: accessCode.expires_at,
  };

  return json({ token, session }, 200);
}

function extractCode(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const v = (body as { code?: unknown }).code;
  return typeof v === "string" ? v : null;
}
