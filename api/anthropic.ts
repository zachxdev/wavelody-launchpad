// Tiny Anthropic Messages API client. We do NOT pull in @anthropic-ai/sdk —
// the Worker bundle is hot path and the SDK's tree of polyfills (form-data,
// node-fetch shims, retry helpers) adds ~150 KB for features we don't use.
// Raw fetch against api.anthropic.com is fine, well-typed, and lets us hand
// the SSE body straight back to the client without a re-parse.
//
// Endpoint: https://api.anthropic.com/v1/messages
// Headers required: x-api-key, anthropic-version: 2023-06-01,
//                   content-type: application/json
// For prompt caching: anthropic-beta: prompt-caching-2024-07-31
//
// We use streaming (stream: true) so the user sees tokens as they arrive.
// The SSE body is forwarded to the frontend; we ALSO inspect the chunks on
// the server to assemble the final text for validation.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_BETA = "prompt-caching-2024-07-31";

export interface CacheControl {
  type: "ephemeral";
}

export interface SystemBlock {
  type: "text";
  text: string;
  cache_control?: CacheControl;
}

export interface UserMessage {
  role: "user";
  content: string;
}

export interface AnthropicRequest {
  model: string;
  max_tokens: number;
  // Anthropic accepts string OR an array of typed text blocks for system.
  // We always use the array form so we can attach cache_control to the
  // long, stable prefix.
  system: SystemBlock[];
  messages: UserMessage[];
  stream?: boolean;
  temperature?: number;
}

export interface AnthropicError {
  status: number;
  message: string;
}

// Non-streaming completion. Used by /api/edit (small response, no UI
// streaming benefit). Returns the assembled assistant text.
export async function anthropicComplete(
  apiKey: string,
  req: AnthropicRequest,
): Promise<string> {
  const resp = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({ ...req, stream: false }),
  });
  if (!resp.ok) {
    const detail = await readErrorBody(resp);
    throw new AnthropicHttpError(resp.status, detail);
  }
  const body = (await resp.json()) as {
    content?: { type: string; text?: string }[];
  };
  if (!body.content) return "";
  return body.content
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("");
}

// Streaming completion with a per-chunk callback. Each text delta from
// Anthropic's SSE stream is passed to onChunk as it arrives, and the full
// assembled assistant text is returned when the stream ends. The endpoint
// uses this to forward chunks to the browser while still owning the
// assembled text for server-side validation.
export async function anthropicStreamText(
  apiKey: string,
  req: AnthropicRequest,
  onChunk: (chunk: string) => void,
): Promise<string> {
  const resp = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({ ...req, stream: true }),
  });
  if (!resp.ok || !resp.body) {
    const detail = await readErrorBody(resp);
    throw new AnthropicHttpError(resp.status, detail);
  }
  return readSseTextStream(resp.body, onChunk);
}

export class AnthropicHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AnthropicHttpError";
  }
}

function anthropicHeaders(apiKey: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    "anthropic-beta": ANTHROPIC_BETA,
  };
}

async function readErrorBody(resp: Response): Promise<string> {
  try {
    const body = (await resp.json()) as { error?: { message?: string } };
    return body.error?.message ?? `HTTP ${resp.status}`;
  } catch {
    return `HTTP ${resp.status}`;
  }
}

// Walks an Anthropic SSE stream, calls onChunk for every
// content_block_delta.text fragment, and returns the assembled assistant
// text when the stream ends. The stream frames look like:
//   event: content_block_delta\n
//   data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"…"}}\n\n
// We tolerate other event types (message_start, ping, message_stop)
// silently — we only care about the text deltas.
async function readSseTextStream(
  stream: ReadableStream<Uint8Array>,
  onChunk: (chunk: string) => void,
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let assembled = "";

  const handle = (event: string): void => {
    const delta = extractDeltaText(event);
    if (delta.length === 0) return;
    assembled += delta;
    onChunk(delta);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      handle(event);
    }
  }
  if (buffer.length > 0) handle(buffer);
  return assembled;
}

function extractDeltaText(event: string): string {
  let out = "";
  for (const line of event.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice("data:".length).trim();
    if (!data || data === "[DONE]") continue;
    try {
      const parsed = JSON.parse(data) as {
        type?: string;
        delta?: { type?: string; text?: string };
      };
      if (
        parsed.type === "content_block_delta" &&
        parsed.delta?.type === "text_delta" &&
        typeof parsed.delta.text === "string"
      ) {
        out += parsed.delta.text;
      }
    } catch {
      // Malformed event lines are dropped silently — we still get the
      // rest of the stream and the final-text validation will catch it.
    }
  }
  return out;
}
