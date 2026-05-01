// POST /api/critique — Gemini 2.5 Flash multimodal call.
//
// Body: { musicdsl, master_wav_url, original_prompt }
// Response: { suggestions: [{ location, issue, suggested_fix }, ...] }
//
// The endpoint counts against BOTH generation and edit quotas — see
// api/critique.ts gate options. Critique is part of the implicit "edit
// pass" that follows every generation, but it can also stand alone, so
// the gate has to debit either pool that's still healthy.

import { json } from "./http";
import { gateWriteEndpoint, refreshHeader } from "./middleware";
import { geminiCritique, GeminiHttpError } from "./gemini";
import {
  PROMPT_MAX_CHARS,
  type CritiqueRequest,
} from "./types";
import type { Env } from "./env";

export async function handleCritique(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const body = await parseBody(request);
  if (body instanceof Response) return body;

  const gate = await gateWriteEndpoint(request, env, {
    kind: "both",
    checkKillswitchFlag: false,
    useInflight: false,
  });
  if (gate instanceof Response) return gate;

  const refresh = refreshHeader(gate.ctx.refreshedToken);
  try {
    const result = await geminiCritique(env.GEMINI_API_KEY, {
      musicdsl: body.musicdsl,
      masterWavUrl: body.master_wav_url,
      originalPrompt: body.original_prompt,
    });
    return json(result, 200, refresh);
  } catch (e: unknown) {
    const status = e instanceof GeminiHttpError ? e.status : 502;
    const message = e instanceof Error ? e.message : String(e);
    return json(
      { error: "critique_failed", detail: message },
      status >= 500 ? 502 : status,
      refresh,
    );
  } finally {
    await gate.release();
  }
}

async function parseBody(
  request: Request,
): Promise<CritiqueRequest | Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!raw || typeof raw !== "object") {
    return json({ error: "Body must be a JSON object" }, 400);
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.musicdsl !== "string" || obj.musicdsl.length === 0) {
    return json({ error: "musicdsl is required" }, 400);
  }
  if (
    typeof obj.master_wav_url !== "string" ||
    obj.master_wav_url.length === 0
  ) {
    return json({ error: "master_wav_url is required" }, 400);
  }
  if (
    typeof obj.original_prompt !== "string" ||
    obj.original_prompt.length === 0
  ) {
    return json({ error: "original_prompt is required" }, 400);
  }
  if (obj.original_prompt.length > PROMPT_MAX_CHARS) {
    return json(
      { error: `original_prompt exceeds ${PROMPT_MAX_CHARS} chars` },
      400,
    );
  }
  return {
    musicdsl: obj.musicdsl,
    master_wav_url: obj.master_wav_url,
    original_prompt: obj.original_prompt,
  };
}
