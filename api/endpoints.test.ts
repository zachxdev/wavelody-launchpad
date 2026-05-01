// @vitest-environment node
//
// Cross-cutting smoke tests for the four authenticated write endpoints.
// Per-endpoint behaviour (request shape, retry, cache, etc.) lives in:
//   api/generate.test.ts
//   api/edit.test.ts
//   api/render.test.ts
//   api/critique.test.ts
//
// What stays here is the small set of invariants that all four endpoints
// must hold: method gating and auth gating before any external service
// touches them.

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./anthropic", () => ({
  AnthropicHttpError: class extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  },
  anthropicComplete: vi.fn(),
  anthropicStreamText: vi.fn(),
}));
vi.mock("./gemini", () => ({
  GeminiHttpError: class extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  },
  geminiCritique: vi.fn(),
}));

import { handleGenerate } from "./generate";
import { handleEdit } from "./edit";
import { handleRender } from "./render";
import { handleCritique } from "./critique";
import type { Env } from "./env";
import { asKv, MockKv } from "./test/kv-mock";

const SECRET = "test-secret-256-bit-or-thereabouts-for-hs256";

let kv: MockKv;
let env: Env;

beforeEach(() => {
  kv = new MockKv();
  env = {
    WAVELODY_CODES: asKv(kv),
    WAVELODY_JWT_SECRET: SECRET,
    ANTHROPIC_API_KEY: "test-anthropic-key",
    GEMINI_API_KEY: "test-gemini-key",
  };
});

// Each handler validates its body before authenticating (so a malformed
// body returns 400 even with a bad token). The auth-rejection probe must
// therefore send a body that would otherwise pass validation, isolating
// the auth check as the failing gate.
const HANDLERS: Array<{
  name: string;
  fn: (req: Request, env: Env) => Promise<Response>;
  validBody: Record<string, unknown>;
}> = [
  {
    name: "/api/generate",
    fn: handleGenerate,
    validBody: { prompt: "Test", template: "piano_trio" },
  },
  {
    name: "/api/edit",
    fn: handleEdit,
    validBody: {
      voice_id: "V",
      bar_start: 1,
      bar_end: 1,
      edit_prompt: "Test",
      current_score: "# TIME: 4/4\n# RESOLUTION: 96\n# VOICES: V\n1, 1, -, -, -, (C4:mf:96) |\n",
    },
  },
  {
    name: "/api/render",
    fn: handleRender,
    validBody: {
      musicdsl: "# TIME: 4/4\n# VOICES: V\n",
      template: "piano_trio",
    },
  },
  {
    name: "/api/critique",
    fn: handleCritique,
    validBody: {
      musicdsl: "# TEMPO: 96\n",
      master_wav_url: "https://r2.example/render/abc/master.wav",
      original_prompt: "Test",
    },
  },
];

describe("write endpoints — common gate behaviour", () => {
  it.each(HANDLERS)(
    "$name rejects unauthenticated calls with 401",
    async ({ fn, validBody }) => {
      const req = new Request("https://example.com/api/x", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validBody),
      });
      const resp = await fn(req, env);
      expect(resp.status).toBe(401);
    },
  );

  it.each(HANDLERS)("$name rejects non-POST methods with 405", async ({ fn }) => {
    const req = new Request("https://example.com/api/x", { method: "GET" });
    const resp = await fn(req, env);
    expect(resp.status).toBe(405);
  });
});
