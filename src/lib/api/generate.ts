// Frontend client for POST /api/generate. The endpoint streams SSE; this
// client reads the stream, dispatches each typed event to caller
// callbacks, and resolves with the final assembled MusicDSL string when
// the stream emits a `complete` event (or rejects on `error`).
//
// SSE format (server-side authoritative — see api/generate.ts):
//   event: attempt    data: {"attempt": 1|2|3}
//   event: chunk      data: {"text": "<fragment>"}
//   event: validation data: {"attempt": N, "valid": false, "errors": [...]}
//   event: complete   data: {"musicdsl": "<full>"}
//   event: error      data: {"error": "composition_failed", retry_after_seconds: 5, errors: [...]}

import {
  ApiError,
  absorbRefreshedToken,
  requireSession,
} from "./common";
import type { EnsembleTemplate } from "../../../api/types";

export interface GenerateCallbacks {
  onAttempt?: (attempt: number) => void;
  onChunk?: (textFragment: string) => void;
  onValidationFailure?: (attempt: number, errors: string[]) => void;
}

export interface GenerateResult {
  musicdsl: string;
}

export interface GenerateInput {
  prompt: string;
  template?: EnsembleTemplate;
}

export async function postGenerate(
  input: GenerateInput,
  callbacks: GenerateCallbacks = {},
  signal?: AbortSignal,
): Promise<GenerateResult> {
  const session = requireSession();
  const resp = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify(input),
    signal,
  });
  absorbRefreshedToken(resp);

  if (!resp.ok || !resp.body) {
    let body: { error: string } & Record<string, unknown>;
    try {
      body = (await resp.json()) as { error: string } & Record<string, unknown>;
    } catch {
      body = { error: `HTTP ${resp.status}` };
    }
    throw new ApiError(resp.status, body);
  }

  return consumeSse(resp.body, callbacks);
}

async function consumeSse(
  body: ReadableStream<Uint8Array>,
  callbacks: GenerateCallbacks,
): Promise<GenerateResult> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n\n")) !== -1) {
      const event = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const result = handleEvent(event, callbacks);
      if (result) return result;
    }
  }
  // Stream ended without `complete` or `error`. Treat as a transport
  // error — the server promises one of the two terminal events.
  throw new ApiError(502, {
    error: "stream_ended_without_terminal_event",
  });
}

// Returns a GenerateResult only on terminal `complete`. Throws on
// terminal `error`. Returns null otherwise (and reaches into the
// callbacks for non-terminal events).
function handleEvent(
  event: string,
  cb: GenerateCallbacks,
): GenerateResult | null {
  let name = "message";
  let dataStr = "";
  for (const line of event.split("\n")) {
    if (line.startsWith("event:")) name = line.slice(6).trim();
    else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
  }
  if (!dataStr) return null;
  let data: unknown;
  try {
    data = JSON.parse(dataStr);
  } catch {
    return null;
  }
  switch (name) {
    case "attempt": {
      const d = data as { attempt?: number };
      if (typeof d.attempt === "number") cb.onAttempt?.(d.attempt);
      return null;
    }
    case "chunk": {
      const d = data as { text?: string };
      if (typeof d.text === "string") cb.onChunk?.(d.text);
      return null;
    }
    case "validation": {
      const d = data as { attempt?: number; errors?: string[] };
      cb.onValidationFailure?.(d.attempt ?? 0, d.errors ?? []);
      return null;
    }
    case "complete": {
      const d = data as { musicdsl?: string };
      if (typeof d.musicdsl === "string") return { musicdsl: d.musicdsl };
      return null;
    }
    case "error": {
      throw new ApiError(503, data as { error: string });
    }
    default:
      return null;
  }
}
