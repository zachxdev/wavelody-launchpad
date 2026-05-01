// POST /api/generate — Claude composition.
//
// The Phase 7 stub already enforced auth → killswitch → inflight →
// generation-quota. Phase 8b replaces the stub body with a real Claude
// call wrapped in a server-side validation gate (per Engine Readiness
// Gate v1.1: 3 attempts total before declaring the prompt unworkable).
//
// Response shape: text/event-stream. Events:
//   attempt    — {attempt: 1|2|3}
//   chunk      — {text: <fragment>} — one per Anthropic text delta
//   validation — {attempt, valid: false, errors: [...]}
//   complete   — {musicdsl: <full validated text>}  (terminal, success)
//   error      — {error: "composition_failed", retry_after_seconds: 5,
//                 errors: [...]}                    (terminal, failure)
//
// Why SSE-with-events instead of just streaming raw text: the frontend
// needs to distinguish "the model is producing text" from "we're retrying
// after a validation failure" from "we gave up". The richer event vocab
// gives the prompt-dock UI room to show meaningful progress.

import { json } from "./http";
import { gateWriteEndpoint, refreshHeader } from "./middleware";
import { anthropicStreamText, AnthropicHttpError } from "./anthropic";
import {
  buildComposeSystem,
  DEFAULT_CLAUDE_MODEL,
} from "./system-prompts";
import { validateMusicDsl } from "./validate-musicdsl";
import {
  DEFAULT_TEMPLATE,
  PROMPT_MAX_CHARS,
  type EnsembleTemplate,
  type GenerateRequest,
} from "./types";
import type { Env } from "./env";

const MAX_ATTEMPTS = 3;
const COMPOSE_MAX_TOKENS = 8000;

export async function handleGenerate(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const body = await parseBody(request);
  if (body instanceof Response) return body;

  const gate = await gateWriteEndpoint(request, env, {
    kind: "generation",
    checkKillswitchFlag: true,
    useInflight: true,
  });
  if (gate instanceof Response) return gate;

  const refresh = refreshHeader(gate.ctx.refreshedToken);
  const stream = composeStream(env, body, gate.release);

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      // Cloudflare strips this on its own when serving SSE, but it's safe
      // belt-and-braces for any intermediate proxy.
      "X-Accel-Buffering": "no",
      ...refresh,
    },
  });
}

async function parseBody(
  request: Request,
): Promise<GenerateRequest | Response> {
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
  if (typeof obj.prompt !== "string" || obj.prompt.trim().length === 0) {
    return json({ error: "prompt is required" }, 400);
  }
  if (obj.prompt.length > PROMPT_MAX_CHARS) {
    return json(
      {
        error: `prompt exceeds ${PROMPT_MAX_CHARS} chars`,
        detail: `length=${obj.prompt.length}`,
      },
      400,
    );
  }
  const template = (obj.template as EnsembleTemplate | undefined) ??
    DEFAULT_TEMPLATE;
  return { prompt: obj.prompt.trim(), template };
}

function composeStream(
  env: Env,
  req: GenerateRequest,
  release: () => Promise<void>,
): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  const model = env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL;
  const system = buildComposeSystem(req.template ?? DEFAULT_TEMPLATE);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>): void => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(enc.encode(payload));
      };

      let lastErrors: string[] = [];
      try {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
          send("attempt", { attempt });
          let text: string;
          try {
            text = await anthropicStreamText(
              env.ANTHROPIC_API_KEY,
              {
                model,
                max_tokens: COMPOSE_MAX_TOKENS,
                system,
                messages: [{ role: "user", content: req.prompt }],
                temperature: 0.7,
              },
              (chunk) => send("chunk", { text: chunk }),
            );
          } catch (e: unknown) {
            const status =
              e instanceof AnthropicHttpError ? e.status : 500;
            const message = e instanceof Error ? e.message : String(e);
            lastErrors = [`Anthropic ${status}: ${message}`];
            send("validation", {
              attempt,
              valid: false,
              errors: lastErrors,
            });
            continue;
          }

          const validation = validateMusicDsl(text);
          if (validation.valid) {
            send("complete", { musicdsl: text });
            return;
          }
          lastErrors = validation.errors;
          send("validation", {
            attempt,
            valid: false,
            errors: validation.errors,
          });
        }

        send("error", {
          error: "composition_failed",
          retry_after_seconds: 5,
          errors: lastErrors,
        });
      } finally {
        await release();
        controller.close();
      }
    },
  });
}
