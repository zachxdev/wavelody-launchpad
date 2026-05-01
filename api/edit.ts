// POST /api/edit — Claude scoped edit.
//
// Body: { voice_id, bar_start, bar_end, edit_prompt, current_score }
// Response: { slice, bar_start, bar_end, voice_id }
//
// The frontend already holds the parsed AST; the slice we return is a
// MusicDSL fragment covering the requested bars. The merge — pulling out
// the changed voice's cells and substituting them into the AST — happens
// client-side because that's where the selection UI lives.
//
// Edits run non-streaming. Slices are short (1-4 bars) so the model
// response arrives in <3 s with default settings; the SSE machinery isn't
// worth the complexity for this path. We do still apply the same 3-attempt
// validation gate as /generate.

import { json } from "./http";
import { gateWriteEndpoint, refreshHeader } from "./middleware";
import { anthropicComplete, AnthropicHttpError } from "./anthropic";
import {
  buildEditSystem,
  DEFAULT_CLAUDE_MODEL,
} from "./system-prompts";
import { validateMusicDsl } from "./validate-musicdsl";
import {
  DEFAULT_TEMPLATE,
  PROMPT_MAX_CHARS,
  type EditRequest,
  type EditResponse,
  type EnsembleTemplate,
} from "./types";
import type { Env } from "./env";

const MAX_ATTEMPTS = 3;
const EDIT_MAX_TOKENS = 4000;

export async function handleEdit(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const body = await parseBody(request);
  if (body instanceof Response) return body;

  const gate = await gateWriteEndpoint(request, env, {
    kind: "edit",
    checkKillswitchFlag: false,
    useInflight: false,
  });
  if (gate instanceof Response) return gate;

  const refresh = refreshHeader(gate.ctx.refreshedToken);
  const model = env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL;
  const template = inferTemplate(body.current_score);
  const system = buildEditSystem(
    template,
    body.current_score,
    body.voice_id,
    body.bar_start,
    body.bar_end,
  );

  const userMsg = `Edit voice ${body.voice_id} bars ${body.bar_start}-${body.bar_end}: ${body.edit_prompt}`;

  let lastErrors: string[] = [];
  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      let text: string;
      try {
        text = await anthropicComplete(env.ANTHROPIC_API_KEY, {
          model,
          max_tokens: EDIT_MAX_TOKENS,
          system,
          messages: [{ role: "user", content: userMsg }],
          temperature: 0.6,
        });
      } catch (e: unknown) {
        const status = e instanceof AnthropicHttpError ? e.status : 500;
        const message = e instanceof Error ? e.message : String(e);
        lastErrors = [`Anthropic ${status}: ${message}`];
        continue;
      }

      const validation = validateMusicDsl(text);
      if (validation.valid) {
        const response: EditResponse = {
          slice: text,
          bar_start: body.bar_start,
          bar_end: body.bar_end,
          voice_id: body.voice_id,
        };
        return json(response, 200, refresh);
      }
      lastErrors = validation.errors;
    }

    return json(
      {
        error: "edit_failed",
        retry_after_seconds: 5,
        errors: lastErrors,
      },
      503,
      refresh,
    );
  } finally {
    await gate.release();
  }
}

async function parseBody(
  request: Request,
): Promise<EditRequest | Response> {
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
  if (typeof obj.voice_id !== "string" || obj.voice_id.length === 0) {
    return json({ error: "voice_id is required" }, 400);
  }
  if (
    typeof obj.bar_start !== "number" ||
    !Number.isInteger(obj.bar_start) ||
    obj.bar_start < 1
  ) {
    return json({ error: "bar_start must be a positive integer" }, 400);
  }
  if (
    typeof obj.bar_end !== "number" ||
    !Number.isInteger(obj.bar_end) ||
    obj.bar_end < obj.bar_start
  ) {
    return json({ error: "bar_end must be >= bar_start" }, 400);
  }
  if (
    typeof obj.edit_prompt !== "string" ||
    obj.edit_prompt.trim().length === 0
  ) {
    return json({ error: "edit_prompt is required" }, 400);
  }
  if (obj.edit_prompt.length > PROMPT_MAX_CHARS) {
    return json({ error: `edit_prompt exceeds ${PROMPT_MAX_CHARS} chars` }, 400);
  }
  if (
    typeof obj.current_score !== "string" ||
    obj.current_score.length === 0
  ) {
    return json({ error: "current_score is required" }, 400);
  }
  return {
    voice_id: obj.voice_id,
    bar_start: obj.bar_start,
    bar_end: obj.bar_end,
    edit_prompt: obj.edit_prompt.trim(),
    current_score: obj.current_score,
  };
}

// Cheap heuristic: pick the ensemble template from the score's voice list.
// Pure inspection of the header — no parsing required.
function inferTemplate(score: string): EnsembleTemplate {
  const m = /^# VOICES:\s*(.+)$/m.exec(score);
  if (!m) return DEFAULT_TEMPLATE;
  const voices = m[1]
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  if (
    voices.includes("V1") &&
    voices.includes("V2") &&
    voices.includes("VA") &&
    voices.includes("VC")
  ) {
    return "string_quartet";
  }
  return DEFAULT_TEMPLATE;
}
