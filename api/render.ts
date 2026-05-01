// POST /api/render — Performer v0 proxy + R2 cache.
//
// Body: { musicdsl, template, voice_assignments?, voices_to_render? }
// Response: { master_url, stems: [{voice_id, url}], cached }
//
// The cache key is a SHA-256 of the canonicalised inputs:
//   sha256(musicdsl + "\n#TEMPLATE:" + template + "\n#ASSIGN:" + json(assignments))
// On a cache hit the Worker serves WAVs from R2 directly (signed/proxied
// URLs) and never touches Performer v0. On a miss the Worker proxies to
// Performer v0, writes the returned WAVs to R2, and returns those URLs.
//
// voices_to_render is the scoped-edit hatch: if the frontend already has
// a master rendered for the bulk of the score and the user only edited
// one voice, we re-render that voice alone and pull every other voice
// from cache. If the cache misses for any of the unspecified voices, we
// fall back to a full render.
//
// R2 binding is OPTIONAL in Phase 8b — when env.RENDER_CACHE is unbound
// the endpoint proxies every call. Phase 9 wires the production binding.
//
// Quota: this counts against generations_used (per Phase 7 gate). On a
// cache hit we DO NOT increment — that's the spec contract: "subsequent
// renders of the same hash are free". To honour that without redesigning
// the gate, we acquire the gate-pass first (which increments), and on
// cache hit we issue a counter rollback.

import { json } from "./http";
import {
  gateWriteEndpoint,
  refreshHeader,
  type WriteGatePass,
} from "./middleware";
import {
  TEMPLATE_VOICE_ASSIGNMENTS,
  type EnsembleTemplate,
  type RenderRequest,
  type RenderResponse,
  type RenderStem,
} from "./types";
import type { AccessCode } from "./types";
import { KEY_PREFIX } from "./types";
import type { Env } from "./env";

const DEFAULT_PERFORMER_URL = "http://localhost:8000";
const PERFORMER_TIMEOUT_MS = 90_000;

interface PerformerStem {
  voice_id: string;
  audio_url: string;
}
interface PerformerResponse {
  master_url: string;
  stems: PerformerStem[];
}

export async function handleRender(
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
    useInflight: false,
  });
  if (gate instanceof Response) return gate;

  const refresh = refreshHeader(gate.ctx.refreshedToken);
  try {
    const cacheKey = await cacheKeyFor(
      body.musicdsl,
      body.template,
      body.voice_assignments ?? TEMPLATE_VOICE_ASSIGNMENTS[body.template],
    );

    if (env.RENDER_CACHE) {
      const cached = await loadFromCache(env.RENDER_CACHE, cacheKey, body);
      if (cached) {
        // Free re-render: refund the generation we just incremented.
        await rollbackGeneration(env, gate);
        return json(cached, 200, refresh);
      }
    }

    const performerUrl = env.PERFORMER_V0_URL || DEFAULT_PERFORMER_URL;
    const performerResp = await callPerformer(performerUrl, body);

    let response: RenderResponse;
    if (env.RENDER_CACHE) {
      response = await writeToCacheAndBuildResponse(
        env.RENDER_CACHE,
        cacheKey,
        performerResp,
      );
    } else {
      // No cache binding — return the Performer URLs directly. Useful
      // for local dev where the Worker proxies straight through.
      response = {
        master_url: performerResp.master_url,
        stems: performerResp.stems.map((s) => ({
          voice_id: s.voice_id,
          url: s.audio_url,
        })),
        cached: false,
      };
    }
    return json(response, 200, refresh);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return json(
      { error: "render_failed", detail: message },
      502,
      refresh,
    );
  } finally {
    await gate.release();
  }
}

async function parseBody(
  request: Request,
): Promise<RenderRequest | Response> {
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
    typeof obj.template !== "string" ||
    !(obj.template in TEMPLATE_VOICE_ASSIGNMENTS)
  ) {
    return json({ error: "template is required and must be a known one" }, 400);
  }
  const out: RenderRequest = {
    musicdsl: obj.musicdsl,
    template: obj.template as EnsembleTemplate,
  };
  if (
    obj.voice_assignments &&
    typeof obj.voice_assignments === "object" &&
    !Array.isArray(obj.voice_assignments)
  ) {
    out.voice_assignments = obj.voice_assignments as Record<string, string>;
  }
  if (Array.isArray(obj.voices_to_render)) {
    const filtered = obj.voices_to_render.filter(
      (v): v is string => typeof v === "string" && v.length > 0,
    );
    if (filtered.length > 0) out.voices_to_render = filtered;
  }
  return out;
}

async function callPerformer(
  baseUrl: string,
  body: RenderRequest,
): Promise<PerformerResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PERFORMER_TIMEOUT_MS,
  );
  try {
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        musicdsl: body.musicdsl,
        template: body.template,
        voice_assignments:
          body.voice_assignments ??
          TEMPLATE_VOICE_ASSIGNMENTS[body.template],
        voices_to_render: body.voices_to_render,
      }),
      signal: controller.signal,
    });
    if (!resp.ok) {
      const detail = await resp.text().catch(() => `HTTP ${resp.status}`);
      throw new Error(`Performer v0 returned ${resp.status}: ${detail}`);
    }
    return (await resp.json()) as PerformerResponse;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadFromCache(
  bucket: R2Bucket,
  cacheKey: string,
  body: RenderRequest,
): Promise<RenderResponse | null> {
  // We treat the cache as authoritative only when EVERY required asset
  // is present: master + each voice in the template. Partial caches —
  // e.g. the rest of a piece is hot but the user is editing one voice
  // and that voice was never rendered before — still need a Performer
  // call, so we miss back to the proxy path.
  const assignments =
    body.voice_assignments ?? TEMPLATE_VOICE_ASSIGNMENTS[body.template];
  const voices = Object.keys(assignments);

  const masterKey = `${cacheKey}/master.wav`;
  const masterHead = await bucket.head(masterKey);
  if (!masterHead) return null;

  const stems: RenderStem[] = [];
  for (const voice of voices) {
    const stemKey = `${cacheKey}/${voice}.wav`;
    const head = await bucket.head(stemKey);
    if (!head) return null;
    stems.push({ voice_id: voice, url: cacheUrl(stemKey) });
  }

  return {
    master_url: cacheUrl(masterKey),
    stems,
    cached: true,
  };
}

async function writeToCacheAndBuildResponse(
  bucket: R2Bucket,
  cacheKey: string,
  performer: PerformerResponse,
): Promise<RenderResponse> {
  // Pull each WAV from Performer once and write it to R2. The Performer
  // serves on its own GET endpoint; the proxy URL we hand to the
  // browser comes from R2 (or our /render-cache/* passthrough).
  const masterBytes = await fetchBinary(performer.master_url);
  const masterKey = `${cacheKey}/master.wav`;
  await bucket.put(masterKey, masterBytes, {
    httpMetadata: { contentType: "audio/wav" },
  });

  const stems: RenderStem[] = [];
  for (const stem of performer.stems) {
    const stemBytes = await fetchBinary(stem.audio_url);
    const stemKey = `${cacheKey}/${stem.voice_id}.wav`;
    await bucket.put(stemKey, stemBytes, {
      httpMetadata: { contentType: "audio/wav" },
    });
    stems.push({ voice_id: stem.voice_id, url: cacheUrl(stemKey) });
  }

  return {
    master_url: cacheUrl(masterKey),
    stems,
    cached: false,
  };
}

async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch ${url}: ${resp.status}`);
  }
  return resp.arrayBuffer();
}

// URL pattern the frontend uses to fetch cached WAVs through the Worker.
// Phase 9 adds a public R2 bucket with signed URLs; for now the Worker
// itself proxies via /api/render-cache/<key> (not yet implemented — Phase
// 8b dev runs without R2 most of the time). We still emit the URL here
// so callers see a stable shape.
function cacheUrl(key: string): string {
  return `/api/render-cache/${encodeURIComponent(key)}`;
}

export async function cacheKeyFor(
  musicdsl: string,
  template: EnsembleTemplate,
  assignments: Record<string, string>,
): Promise<string> {
  const sortedAssignments = Object.keys(assignments)
    .sort()
    .map((k) => `${k}=${assignments[k]}`)
    .join(",");
  const canonical = `${musicdsl}\n#TEMPLATE:${template}\n#ASSIGN:${sortedAssignments}`;
  const buf = new TextEncoder().encode(canonical);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return `render/${hexEncode(hashBuf)}`;
}

function hexEncode(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

// Decrement generations_used by 1 — used on cache hits to honour the
// "cached re-renders are free" contract. Best-effort: if the read fails
// we silently leave the counter as-is. Keeps the same KV key layout the
// rest of the gate uses.
async function rollbackGeneration(
  env: Env,
  gate: WriteGatePass,
): Promise<void> {
  const codeKey = KEY_PREFIX.code + gate.ctx.code.code;
  const raw = await env.WAVELODY_CODES.get(codeKey);
  if (!raw) return;
  let code: AccessCode;
  try {
    code = JSON.parse(raw) as AccessCode;
  } catch {
    return;
  }
  if (code.generations_used <= 0) return;
  code.generations_used -= 1;
  await env.WAVELODY_CODES.put(codeKey, JSON.stringify(code));
}
