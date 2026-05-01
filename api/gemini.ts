// Tiny Gemini API client for /api/critique. Multimodal: we pass the prompt
// + MusicDSL + rendered WAV (inline-base64) and ask for structured JSON.
//
// Endpoint:
//   POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=API_KEY
//
// Response shape we care about:
//   { candidates: [ { content: { parts: [ { text: "..." } ] } } ] }
//
// We rely on responseMimeType: "application/json" + responseSchema to coerce
// the model into structured output. The Worker does a JSON.parse on the
// returned text and returns a typed CritiqueResponse.

import type { CritiqueResponse, CritiqueSuggestion } from "./types";

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_MODEL = "gemini-2.5-flash";

const CRITIQUE_SYSTEM = `You are a music critic. Given a user prompt, the
MusicDSL score that was composed for it, and the rendered WAV audio,
identify 3-5 specific musical issues. Focus on issues a careful listener
would notice on the first hearing — voice leading, rhythmic placement,
balance, harmonic surprise, dynamic shape — not subjective taste.

For each issue produce:
  - location: a natural-language pointer to where in the piece, e.g.
    "bar 3 beat 49, voice V" or "bars 5-7, all voices".
  - issue: one sentence describing what is wrong.
  - suggested_fix: one sentence describing a concrete change. Where the
    fix can be expressed as a MusicDSL diff, write it inline in
    backticks; otherwise prose is fine.

Return STRICT JSON. No markdown, no commentary outside the JSON.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    suggestions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          location: { type: "STRING" },
          issue: { type: "STRING" },
          suggested_fix: { type: "STRING" },
        },
        required: ["location", "issue", "suggested_fix"],
      },
    },
  },
  required: ["suggestions"],
} as const;

export class GeminiHttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "GeminiHttpError";
  }
}

export async function geminiCritique(
  apiKey: string,
  args: {
    musicdsl: string;
    masterWavUrl: string;
    originalPrompt: string;
  },
): Promise<CritiqueResponse> {
  const audioBase64 = await fetchWavBase64(args.masterWavUrl);

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
    apiKey,
  )}`;

  const body = {
    systemInstruction: {
      parts: [{ text: CRITIQUE_SYSTEM }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              `Original prompt: ${args.originalPrompt}`,
              "",
              "MusicDSL score:",
              "<score>",
              args.musicdsl,
              "</score>",
              "",
              "Rendered WAV is attached. Critique the rendered audio.",
            ].join("\n"),
          },
          {
            inline_data: {
              mime_type: "audio/wav",
              data: audioBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const detail = await readGeminiError(resp);
    throw new GeminiHttpError(resp.status, detail);
  }
  const parsed = (await resp.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = parsed.candidates?.[0]?.content?.parts
    ?.map((p) => p.text ?? "")
    .join("");
  if (!text) {
    throw new GeminiHttpError(502, "Gemini returned no candidate text");
  }
  return parseSuggestions(text);
}

function parseSuggestions(text: string): CritiqueResponse {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiHttpError(
      502,
      `Gemini returned non-JSON output: ${text.slice(0, 200)}`,
    );
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !Array.isArray((parsed as { suggestions?: unknown }).suggestions)
  ) {
    throw new GeminiHttpError(
      502,
      "Gemini output missing suggestions array",
    );
  }
  const raw = (parsed as { suggestions: unknown[] }).suggestions;
  const suggestions: CritiqueSuggestion[] = [];
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as Record<string, unknown>).location === "string" &&
      typeof (item as Record<string, unknown>).issue === "string" &&
      typeof (item as Record<string, unknown>).suggested_fix === "string"
    ) {
      suggestions.push({
        location: (item as { location: string }).location,
        issue: (item as { issue: string }).issue,
        suggested_fix: (item as { suggested_fix: string }).suggested_fix,
      });
    }
  }
  return { suggestions };
}

async function fetchWavBase64(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new GeminiHttpError(
      502,
      `Failed to fetch master WAV for critique: ${resp.status}`,
    );
  }
  const buf = await resp.arrayBuffer();
  return arrayBufferToBase64(buf);
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  // Workers have btoa but not Buffer; chunked conversion to avoid stack
  // pressure on large WAVs (a 30 s 16-bit/44.1 kHz mono is ~2.6 MB which
  // String.fromCharCode.apply chokes on otherwise).
  const bytes = new Uint8Array(buf);
  let binary = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK)),
    );
  }
  return btoa(binary);
}

async function readGeminiError(resp: Response): Promise<string> {
  try {
    const body = (await resp.json()) as {
      error?: { message?: string };
    };
    return body.error?.message ?? `HTTP ${resp.status}`;
  } catch {
    return `HTTP ${resp.status}`;
  }
}
