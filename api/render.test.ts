// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleRender, cacheKeyFor } from "./render";
import { signJwt } from "./jwt";
import type {
  AccessCode,
  JwtPayload,
  RenderRequest,
  RenderResponse,
} from "./types";
import { JWT_TTL_SECONDS, KEY_PREFIX, TIER_CONFIG } from "./types";
import type { Env } from "./env";
import { asKv, MockKv } from "./test/kv-mock";
import { asR2, MockR2 } from "./test/r2-mock";

const SECRET = "test-secret-256-bit-or-thereabouts-for-hs256";

const VALID_MUSICDSL = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: LH, RH, V, Vc
1, 1, -, I, -, (C2:f:96), (C4:mp:96), (G4:mp:96), (C3:mp:96) |
`;

function makeAccessCode(overrides: Partial<AccessCode> = {}): AccessCode {
  const cfg = TIER_CONFIG.reviewer;
  const now = new Date();
  return {
    code: "speedrun-test",
    tier: "reviewer",
    label: "Test",
    generations_used: 0,
    edits_used: 0,
    generations_max: cfg.generations_max,
    edits_max: cfg.edits_max,
    created_at: now.toISOString(),
    expires_at: new Date(now.getTime() + cfg.expires_days * 86_400_000).toISOString(),
    revoked: false,
    last_seen_at: null,
    ...overrides,
  };
}

async function makeToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: "speedrun-test",
    tier: "reviewer",
    jti: "00000000-0000-4000-8000-000000000000",
    iat: now,
    exp: now + JWT_TTL_SECONDS,
  };
  return signJwt(payload, SECRET);
}

function makePost(token: string, body: RenderRequest): Request {
  return new Request("https://example.com/api/render", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}

let kv: MockKv;
let r2: MockR2;
let env: Env;
// Cloudflare's fetch type has multiple overloads that confuse vi.spyOn's
// generic; loosen to a plain Mock for assertions.
let fetchSpy: ReturnType<typeof vi.fn>;

// Mock global fetch with route-aware responses keyed by URL substring.
let fetchRoutes: Array<{ match: (url: string) => boolean; respond: () => Response }>;

beforeEach(() => {
  kv = new MockKv();
  r2 = new MockR2();
  env = {
    WAVELODY_CODES: asKv(kv),
    WAVELODY_JWT_SECRET: SECRET,
    ANTHROPIC_API_KEY: "test-anthropic-key",
    GEMINI_API_KEY: "test-gemini-key",
    PERFORMER_V0_URL: "http://performer:8000",
    RENDER_CACHE: asR2(r2),
  };
  fetchRoutes = [];
  fetchSpy = vi.fn(
    async (...args: unknown[]): Promise<Response> => {
      const input = args[0];
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : (input as Request).url;
      for (const route of fetchRoutes) {
        if (route.match(url)) return route.respond();
      }
      return new Response(`Unmatched fetch: ${url}`, { status: 599 });
    },
  );
  globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch;
});

const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

function stagePerformerSuccess(): void {
  const wavBytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0]); // "RIFF" + zero
  fetchRoutes.push({
    match: (u) => u.includes("/render"),
    respond: () =>
      new Response(
        JSON.stringify({
          master_url: "http://performer:8000/audio/abc/master.wav",
          stems: [
            { voice_id: "LH", audio_url: "http://performer:8000/audio/abc/lh.wav" },
            { voice_id: "RH", audio_url: "http://performer:8000/audio/abc/rh.wav" },
            { voice_id: "V", audio_url: "http://performer:8000/audio/abc/v.wav" },
            { voice_id: "Vc", audio_url: "http://performer:8000/audio/abc/vc.wav" },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
  });
  fetchRoutes.push({
    match: (u) => u.includes("/audio/"),
    respond: () =>
      new Response(wavBytes, {
        status: 200,
        headers: { "Content-Type": "audio/wav" },
      }),
  });
}

describe("POST /api/render", () => {
  it("rejects malformed body with 400", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    const token = await makeToken();
    const resp = await handleRender(
      makePost(token, { musicdsl: "", template: "piano_trio" }),
      env,
    );
    expect(resp.status).toBe(400);
  });

  it("proxies to Performer + writes WAVs to R2 + returns cached:false on first render", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    stagePerformerSuccess();
    const token = await makeToken();
    const resp = await handleRender(
      makePost(token, { musicdsl: VALID_MUSICDSL, template: "piano_trio" }),
      env,
    );
    expect(resp.status).toBe(200);
    const body = (await resp.json()) as RenderResponse;
    expect(body.cached).toBe(false);
    expect(body.stems).toHaveLength(4);
    expect(body.stems.map((s) => s.voice_id).sort()).toEqual(["LH", "RH", "V", "Vc"]);
    // R2 received master + 4 stems.
    expect(r2.size()).toBe(5);
  });

  it("returns cached:true on a repeat render and refunds the generation counter", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    stagePerformerSuccess();
    const token = await makeToken();

    const first = await handleRender(
      makePost(token, { musicdsl: VALID_MUSICDSL, template: "piano_trio" }),
      env,
    );
    expect(first.status).toBe(200);
    let stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.generations_used).toBe(1);

    // Second call hits the cache.
    const second = await handleRender(
      makePost(token, { musicdsl: VALID_MUSICDSL, template: "piano_trio" }),
      env,
    );
    expect(second.status).toBe(200);
    const body = (await second.json()) as RenderResponse;
    expect(body.cached).toBe(true);
    stored = JSON.parse(
      kv.raw().get(KEY_PREFIX.code + code.code) as string,
    ) as AccessCode;
    expect(stored.generations_used).toBe(1); // refunded the second call
  });

  it("returns 502 when Performer responds with an error", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    fetchRoutes.push({
      match: (u) => u.includes("/render"),
      respond: () => new Response("boom", { status: 500 }),
    });
    const token = await makeToken();
    const resp = await handleRender(
      makePost(token, { musicdsl: VALID_MUSICDSL, template: "piano_trio" }),
      env,
    );
    expect(resp.status).toBe(502);
    const body = (await resp.json()) as { error: string };
    expect(body.error).toBe("render_failed");
  });

  it("returns 503 when killswitch is active without calling Performer", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    kv.set(KEY_PREFIX.killswitch, "1");
    const token = await makeToken();
    const resp = await handleRender(
      makePost(token, { musicdsl: VALID_MUSICDSL, template: "piano_trio" }),
      env,
    );
    expect(resp.status).toBe(503);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("returns Performer URLs directly when RENDER_CACHE is unbound", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    stagePerformerSuccess();
    const noCacheEnv: Env = { ...env, RENDER_CACHE: undefined };
    const token = await makeToken();
    const resp = await handleRender(
      makePost(token, { musicdsl: VALID_MUSICDSL, template: "piano_trio" }),
      noCacheEnv,
    );
    expect(resp.status).toBe(200);
    const body = (await resp.json()) as RenderResponse;
    expect(body.cached).toBe(false);
    expect(body.master_url).toMatch(/performer:8000/);
  });

  it("forwards voices_to_render to Performer for scoped re-renders", async () => {
    const code = makeAccessCode();
    kv.set(KEY_PREFIX.code + code.code, JSON.stringify(code));
    let captured: unknown = null;
    fetchRoutes.push({
      match: (u) => u.includes("/render"),
      respond: () => new Response("captured", { status: 599 }),
    });
    fetchSpy.mockImplementation(async (...args: unknown[]): Promise<Response> => {
      const input = args[0];
      const init = args[1] as RequestInit | undefined;
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/render")) {
        captured = JSON.parse(String(init?.body ?? "null"));
        return new Response("err", { status: 500 });
      }
      return new Response("err", { status: 599 });
    });
    const token = await makeToken();
    await handleRender(
      makePost(token, {
        musicdsl: VALID_MUSICDSL,
        template: "piano_trio",
        voices_to_render: ["V"],
      }),
      env,
    );
    expect(captured).toMatchObject({ voices_to_render: ["V"] });
  });
});

describe("cacheKeyFor", () => {
  it("yields the same hash for equal inputs", async () => {
    const a = await cacheKeyFor(VALID_MUSICDSL, "piano_trio", { LH: "piano_lh" });
    const b = await cacheKeyFor(VALID_MUSICDSL, "piano_trio", { LH: "piano_lh" });
    expect(a).toBe(b);
  });

  it("yields different hashes when inputs differ", async () => {
    const a = await cacheKeyFor(VALID_MUSICDSL, "piano_trio", { LH: "piano_lh" });
    const b = await cacheKeyFor(VALID_MUSICDSL + "\n", "piano_trio", {
      LH: "piano_lh",
    });
    expect(a).not.toBe(b);
  });
});
