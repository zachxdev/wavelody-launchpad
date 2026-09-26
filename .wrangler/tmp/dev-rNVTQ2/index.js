var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/http.ts
function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders
    }
  });
}
__name(json, "json");
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "X-Refreshed-Token"
  };
}
__name(corsHeaders, "corsHeaders");
function withCors(response) {
  for (const [k, v] of Object.entries(corsHeaders())) {
    response.headers.set(k, v);
  }
  return response;
}
__name(withCors, "withCors");

// api/jwt.ts
var JwtError = class extends Error {
  constructor(reason, message) {
    super(message);
    this.reason = reason;
    this.name = "JwtError";
  }
  static {
    __name(this, "JwtError");
  }
};
var HEADER = { alg: "HS256", typ: "JWT" };
var ENCODED_HEADER = base64urlEncodeString(JSON.stringify(HEADER));
var VALID_TIERS = /* @__PURE__ */ new Set([
  "reviewer",
  "friend",
  "public"
]);
function base64urlEncodeBytes(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64urlEncodeBytes, "base64urlEncodeBytes");
function base64urlEncodeString(input) {
  return base64urlEncodeBytes(new TextEncoder().encode(input));
}
__name(base64urlEncodeString, "base64urlEncodeString");
function base64urlDecodeBytes(input) {
  const padded = input + "=".repeat((4 - input.length % 4) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}
__name(base64urlDecodeBytes, "base64urlDecodeBytes");
function base64urlDecodeString(input) {
  return new TextDecoder().decode(base64urlDecodeBytes(input));
}
__name(base64urlDecodeString, "base64urlDecodeString");
async function importHmacKey(secret, usage) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}
__name(importHmacKey, "importHmacKey");
async function signJwt(payload, secret) {
  const encPayload = base64urlEncodeString(JSON.stringify(payload));
  const data = `${ENCODED_HEADER}.${encPayload}`;
  const key = await importHmacKey(secret, "sign");
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return `${data}.${base64urlEncodeBytes(new Uint8Array(sig))}`;
}
__name(signJwt, "signJwt");
async function verifyJwt(token, secret, now = Math.floor(Date.now() / 1e3)) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new JwtError("malformed", "Malformed JWT");
  }
  const [encHeader, encPayload, encSig] = parts;
  if (!encHeader || !encPayload || !encSig) {
    throw new JwtError("malformed", "Malformed JWT");
  }
  const key = await importHmacKey(secret, "verify");
  const data = `${encHeader}.${encPayload}`;
  let sigBytes;
  try {
    sigBytes = base64urlDecodeBytes(encSig);
  } catch {
    throw new JwtError("malformed", "Malformed JWT signature");
  }
  const ok = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(data)
  );
  if (!ok) {
    throw new JwtError("signature", "Invalid signature");
  }
  let raw;
  try {
    raw = JSON.parse(base64urlDecodeString(encPayload));
  } catch {
    throw new JwtError("payload", "Invalid payload JSON");
  }
  const payload = parsePayload(raw);
  if (payload.exp < now) {
    throw new JwtError("expired", "Token expired");
  }
  return payload;
}
__name(verifyJwt, "verifyJwt");
function parsePayload(raw) {
  if (!raw || typeof raw !== "object") {
    throw new JwtError("payload", "Invalid payload shape");
  }
  const obj = raw;
  if (typeof obj.sub !== "string" || typeof obj.jti !== "string" || typeof obj.iat !== "number" || typeof obj.exp !== "number" || typeof obj.tier !== "string" || !VALID_TIERS.has(obj.tier)) {
    throw new JwtError("payload", "Invalid payload shape");
  }
  return {
    sub: obj.sub,
    jti: obj.jti,
    iat: obj.iat,
    exp: obj.exp,
    tier: obj.tier
  };
}
__name(parsePayload, "parsePayload");

// api/types.ts
var JWT_TTL_SECONDS = 7 * 24 * 60 * 60;
var ACCESS_CODE_REGEX = /^[a-z0-9-]{3,40}$/i;
var KEY_PREFIX = {
  code: "code:",
  session: "session:",
  inflight: "inflight:",
  killswitch: "killswitch:active"
};
var DEFAULT_TEMPLATE = "piano_trio";
var TEMPLATE_VOICE_ASSIGNMENTS = {
  piano_trio: { LH: "piano_lh", RH: "piano_rh", V: "violin", Vc: "cello" },
  string_quartet: { V1: "violin", V2: "violin", VA: "viola", VC: "cello" }
};
var PROMPT_MAX_CHARS = 1e3;

// api/auth.ts
async function handleAuth(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  let body;
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
  if (!stored) {
    return json({ error: "Code not recognized" }, 401);
  }
  let accessCode;
  try {
    accessCode = JSON.parse(stored);
  } catch {
    return json({ error: "Corrupted code record" }, 500);
  }
  if (accessCode.revoked) {
    return json({ error: "Code revoked" }, 401);
  }
  if (Date.parse(accessCode.expires_at) < Date.now()) {
    return json({ error: "Code expired" }, 401);
  }
  accessCode.last_seen_at = (/* @__PURE__ */ new Date()).toISOString();
  await env.WAVELODY_CODES.put(
    KEY_PREFIX.code + accessCode.code,
    JSON.stringify(accessCode)
  );
  const jti = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1e3);
  const payload = {
    sub: accessCode.code,
    tier: accessCode.tier,
    jti,
    iat: now,
    exp: now + JWT_TTL_SECONDS
  };
  const token = await signJwt(payload, env.WAVELODY_JWT_SECRET);
  const meta = {
    code: accessCode.code,
    jti,
    created_at: (/* @__PURE__ */ new Date()).toISOString(),
    user_agent: request.headers.get("User-Agent")
  };
  await env.WAVELODY_CODES.put(
    KEY_PREFIX.session + jti,
    JSON.stringify(meta),
    { expirationTtl: JWT_TTL_SECONDS + 86400 }
  );
  const session = {
    code: accessCode.code,
    tier: accessCode.tier,
    label: accessCode.label,
    generations_max: accessCode.generations_max,
    edits_max: accessCode.edits_max,
    expires_at: accessCode.expires_at
  };
  return json({ token, session }, 200);
}
__name(handleAuth, "handleAuth");
function extractCode(body) {
  if (!body || typeof body !== "object") return null;
  const v = body.code;
  return typeof v === "string" ? v : null;
}
__name(extractCode, "extractCode");

// api/middleware.ts
var AuthError = class extends Error {
  constructor(status, body) {
    super(body.error);
    this.status = status;
    this.body = body;
    this.name = "AuthError";
  }
  static {
    __name(this, "AuthError");
  }
};
async function authenticate(request, env) {
  const header = request.headers.get("Authorization");
  if (!header || !header.toLowerCase().startsWith("bearer ")) {
    throw new AuthError(401, { error: "Missing Authorization header" });
  }
  const token = header.slice("bearer ".length).trim();
  let payload;
  try {
    payload = await verifyJwt(token, env.WAVELODY_JWT_SECRET);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Invalid token";
    throw new AuthError(401, { error: msg });
  }
  const raw = await env.WAVELODY_CODES.get(KEY_PREFIX.code + payload.sub);
  if (!raw) throw new AuthError(401, { error: "Code not found" });
  let code;
  try {
    code = JSON.parse(raw);
  } catch {
    throw new AuthError(500, { error: "Corrupted code record" });
  }
  if (code.revoked) {
    throw new AuthError(401, { error: "Code revoked" });
  }
  if (Date.parse(code.expires_at) < Date.now()) {
    throw new AuthError(401, { error: "Code expired" });
  }
  const now = Math.floor(Date.now() / 1e3);
  const refreshedToken = await signJwt(
    {
      sub: payload.sub,
      tier: payload.tier,
      jti: payload.jti,
      iat: now,
      exp: now + JWT_TTL_SECONDS
    },
    env.WAVELODY_JWT_SECRET
  );
  return { payload, code, refreshedToken };
}
__name(authenticate, "authenticate");
async function checkAndIncrement(env, code, kind) {
  if (kind === "generation" || kind === "both") {
    if (code.generations_used >= code.generations_max) {
      throw new AuthError(429, {
        error: "Generation quota exceeded",
        retry_after_seconds: 0,
        used: code.generations_used,
        max: code.generations_max
      });
    }
  }
  if (kind === "edit" || kind === "both") {
    if (code.edits_used >= code.edits_max) {
      throw new AuthError(429, {
        error: "Edit quota exceeded",
        retry_after_seconds: 0,
        used: code.edits_used,
        max: code.edits_max
      });
    }
  }
  const updated = {
    ...code,
    last_seen_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (kind === "generation" || kind === "both") {
    updated.generations_used += 1;
  }
  if (kind === "edit" || kind === "both") {
    updated.edits_used += 1;
  }
  await env.WAVELODY_CODES.put(
    KEY_PREFIX.code + code.code,
    JSON.stringify(updated)
  );
  return updated;
}
__name(checkAndIncrement, "checkAndIncrement");
async function checkKillswitch(env) {
  const v = await env.WAVELODY_CODES.get(KEY_PREFIX.killswitch);
  return v === "1";
}
__name(checkKillswitch, "checkKillswitch");
var INFLIGHT_TTL_SECONDS = 90;
async function acquireInflight(env, code) {
  const key = KEY_PREFIX.inflight + code;
  const existing = await env.WAVELODY_CODES.get(key);
  if (existing) {
    const expiry = Number(existing);
    if (Number.isFinite(expiry) && expiry > Date.now()) return false;
  }
  const expiryMs = Date.now() + INFLIGHT_TTL_SECONDS * 1e3;
  await env.WAVELODY_CODES.put(key, String(expiryMs), {
    expirationTtl: INFLIGHT_TTL_SECONDS
  });
  return true;
}
__name(acquireInflight, "acquireInflight");
async function releaseInflight(env, code) {
  await env.WAVELODY_CODES.delete(KEY_PREFIX.inflight + code);
}
__name(releaseInflight, "releaseInflight");
function refreshHeader(token) {
  return { "X-Refreshed-Token": token };
}
__name(refreshHeader, "refreshHeader");
async function gateWriteEndpoint(request, env, opts) {
  let ctx;
  try {
    ctx = await authenticate(request, env);
  } catch (e) {
    if (e instanceof AuthError) return json(e.body, e.status);
    throw e;
  }
  if (opts.checkKillswitchFlag) {
    if (await checkKillswitch(env)) {
      return json(
        { error: "Demo paused for the day, back tomorrow." },
        503
      );
    }
  }
  let release = /* @__PURE__ */ __name(async () => {
  }, "release");
  if (opts.useInflight) {
    const acquired = await acquireInflight(env, ctx.code.code);
    if (!acquired) {
      return json(
        { error: "Generation already in progress for this code." },
        429
      );
    }
    release = /* @__PURE__ */ __name(() => releaseInflight(env, ctx.code.code), "release");
  }
  try {
    await checkAndIncrement(env, ctx.code, opts.kind);
  } catch (e) {
    await release();
    if (e instanceof AuthError) return json(e.body, e.status);
    throw e;
  }
  return { ctx, release };
}
__name(gateWriteEndpoint, "gateWriteEndpoint");

// api/gemini.ts
var GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
var GEMINI_MODEL = "gemini-2.5-flash";
var CRITIQUE_SYSTEM = `You are a music critic. Given a user prompt, the
MusicDSL score that was composed for it, and the rendered WAV audio,
identify 3-5 specific musical issues. Focus on issues a careful listener
would notice on the first hearing \u2014 voice leading, rhythmic placement,
balance, harmonic surprise, dynamic shape \u2014 not subjective taste.

For each issue produce:
  - location: a natural-language pointer to where in the piece, e.g.
    "bar 3 beat 49, voice V" or "bars 5-7, all voices".
  - issue: one sentence describing what is wrong.
  - suggested_fix: one sentence describing a concrete change. Where the
    fix can be expressed as a MusicDSL diff, write it inline in
    backticks; otherwise prose is fine.

Return STRICT JSON. No markdown, no commentary outside the JSON.`;
var RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    suggestions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          location: { type: "STRING" },
          issue: { type: "STRING" },
          suggested_fix: { type: "STRING" }
        },
        required: ["location", "issue", "suggested_fix"]
      }
    }
  },
  required: ["suggestions"]
};
var GeminiHttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "GeminiHttpError";
  }
  static {
    __name(this, "GeminiHttpError");
  }
};
async function geminiCritique(apiKey, args) {
  const audioBase64 = await fetchWavBase64(args.masterWavUrl);
  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;
  const body = {
    systemInstruction: {
      parts: [{ text: CRITIQUE_SYSTEM }]
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
              "Rendered WAV is attached. Critique the rendered audio."
            ].join("\n")
          },
          {
            inline_data: {
              mime_type: "audio/wav",
              data: audioBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA
    }
  };
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!resp.ok) {
    const detail = await readGeminiError(resp);
    throw new GeminiHttpError(resp.status, detail);
  }
  const parsed = await resp.json();
  const text = parsed.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) {
    throw new GeminiHttpError(502, "Gemini returned no candidate text");
  }
  return parseSuggestions(text);
}
__name(geminiCritique, "geminiCritique");
function parseSuggestions(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new GeminiHttpError(
      502,
      `Gemini returned non-JSON output: ${text.slice(0, 200)}`
    );
  }
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.suggestions)) {
    throw new GeminiHttpError(
      502,
      "Gemini output missing suggestions array"
    );
  }
  const raw = parsed.suggestions;
  const suggestions = [];
  for (const item of raw) {
    if (item && typeof item === "object" && typeof item.location === "string" && typeof item.issue === "string" && typeof item.suggested_fix === "string") {
      suggestions.push({
        location: item.location,
        issue: item.issue,
        suggested_fix: item.suggested_fix
      });
    }
  }
  return { suggestions };
}
__name(parseSuggestions, "parseSuggestions");
async function fetchWavBase64(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new GeminiHttpError(
      502,
      `Failed to fetch master WAV for critique: ${resp.status}`
    );
  }
  const buf = await resp.arrayBuffer();
  return arrayBufferToBase64(buf);
}
__name(fetchWavBase64, "fetchWavBase64");
function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  const CHUNK = 32768;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK))
    );
  }
  return btoa(binary);
}
__name(arrayBufferToBase64, "arrayBufferToBase64");
async function readGeminiError(resp) {
  try {
    const body = await resp.json();
    return body.error?.message ?? `HTTP ${resp.status}`;
  } catch {
    return `HTTP ${resp.status}`;
  }
}
__name(readGeminiError, "readGeminiError");

// api/critique.ts
async function handleCritique(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  const body = await parseBody(request);
  if (body instanceof Response) return body;
  const gate = await gateWriteEndpoint(request, env, {
    kind: "both",
    checkKillswitchFlag: false,
    useInflight: false
  });
  if (gate instanceof Response) return gate;
  const refresh = refreshHeader(gate.ctx.refreshedToken);
  try {
    const result = await geminiCritique(env.GEMINI_API_KEY, {
      musicdsl: body.musicdsl,
      masterWavUrl: body.master_wav_url,
      originalPrompt: body.original_prompt
    });
    return json(result, 200, refresh);
  } catch (e) {
    const status = e instanceof GeminiHttpError ? e.status : 502;
    const message = e instanceof Error ? e.message : String(e);
    return json(
      { error: "critique_failed", detail: message },
      status >= 500 ? 502 : status,
      refresh
    );
  } finally {
    await gate.release();
  }
}
__name(handleCritique, "handleCritique");
async function parseBody(request) {
  let raw;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!raw || typeof raw !== "object") {
    return json({ error: "Body must be a JSON object" }, 400);
  }
  const obj = raw;
  if (typeof obj.musicdsl !== "string" || obj.musicdsl.length === 0) {
    return json({ error: "musicdsl is required" }, 400);
  }
  if (typeof obj.master_wav_url !== "string" || obj.master_wav_url.length === 0) {
    return json({ error: "master_wav_url is required" }, 400);
  }
  if (typeof obj.original_prompt !== "string" || obj.original_prompt.length === 0) {
    return json({ error: "original_prompt is required" }, 400);
  }
  if (obj.original_prompt.length > PROMPT_MAX_CHARS) {
    return json(
      { error: `original_prompt exceeds ${PROMPT_MAX_CHARS} chars` },
      400
    );
  }
  return {
    musicdsl: obj.musicdsl,
    master_wav_url: obj.master_wav_url,
    original_prompt: obj.original_prompt
  };
}
__name(parseBody, "parseBody");

// api/anthropic.ts
var ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
var ANTHROPIC_VERSION = "2023-06-01";
var ANTHROPIC_BETA = "prompt-caching-2024-07-31";
async function anthropicComplete(apiKey, req) {
  const resp = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({ ...req, stream: false })
  });
  if (!resp.ok) {
    const detail = await readErrorBody(resp);
    throw new AnthropicHttpError(resp.status, detail);
  }
  const body = await resp.json();
  if (!body.content) return "";
  return body.content.filter((b) => b.type === "text" && typeof b.text === "string").map((b) => b.text).join("");
}
__name(anthropicComplete, "anthropicComplete");
async function anthropicStreamText(apiKey, req, onChunk) {
  const resp = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: anthropicHeaders(apiKey),
    body: JSON.stringify({ ...req, stream: true })
  });
  if (!resp.ok || !resp.body) {
    const detail = await readErrorBody(resp);
    throw new AnthropicHttpError(resp.status, detail);
  }
  return readSseTextStream(resp.body, onChunk);
}
__name(anthropicStreamText, "anthropicStreamText");
var AnthropicHttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "AnthropicHttpError";
  }
  static {
    __name(this, "AnthropicHttpError");
  }
};
function anthropicHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": ANTHROPIC_VERSION,
    "anthropic-beta": ANTHROPIC_BETA
  };
}
__name(anthropicHeaders, "anthropicHeaders");
async function readErrorBody(resp) {
  try {
    const body = await resp.json();
    return body.error?.message ?? `HTTP ${resp.status}`;
  } catch {
    return `HTTP ${resp.status}`;
  }
}
__name(readErrorBody, "readErrorBody");
async function readSseTextStream(stream, onChunk) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let assembled = "";
  const handle = /* @__PURE__ */ __name((event) => {
    const delta = extractDeltaText(event);
    if (delta.length === 0) return;
    assembled += delta;
    onChunk(delta);
  }, "handle");
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      handle(event);
    }
  }
  if (buffer.length > 0) handle(buffer);
  return assembled;
}
__name(readSseTextStream, "readSseTextStream");
function extractDeltaText(event) {
  let out = "";
  for (const line of event.split("\n")) {
    if (!line.startsWith("data:")) continue;
    const data = line.slice("data:".length).trim();
    if (!data || data === "[DONE]") continue;
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta" && typeof parsed.delta.text === "string") {
        out += parsed.delta.text;
      }
    } catch {
    }
  }
  return out;
}
__name(extractDeltaText, "extractDeltaText");

// api/system-prompts.ts
var MUSICDSL_SPEC = `MusicDSL v2.2 \u2014 composition format.

A score has a HEADER block and a GRID block.

HEADER (one '# KEY: value' line each):
  TITLE, COMPOSER, TEMPO (BPM int), TIME (e.g. 4/4), KEY (e.g. A minor),
  RESOLUTION (rows per bar; 96 is standard), INSTRUMENTS (comma list),
  VOICES (comma list of voice column names).

SCHEMA ROW (required, immediately after headers):
  BAR, BEAT, STR, HAR, SUS, <each voice column...>

GRID ROWS (one per row in resolution):
  BAR, BEAT, STR, HAR, SUS, <voice cells...>
  - BAR: 1-based int.
  - BEAT: 1..RESOLUTION.
  - STR: structure tag like <SECTION:A>, <PHRASE:start>, <CADENCE:auth>,
    <MODULATE:Aminor>, <TEMPO:96>; or '-' for none.
  - HAR: Roman numeral (I, ii, V7, viidim, bIII) or '-'.
  - SUS: ringing notes carried from prior rows '(C4,E4:p)' or '-'.
  - Voice cells: notes, rests, curves, or '-' for none.

NOTE TOKEN: (PITCH:DYNAMIC:DURATION[s][.articulation][#tag])
  PITCH: <step><alter><octave>  e.g. C4, F#5, Bb3.
  Chord: comma-joined pitches sharing dyn+dur, e.g. (C4,E4,G4:mf:24)
  DYNAMIC: ppp pp p mp mf f ff fff sfz
  DURATION: integer rows. At RESOLUTION=96 in 4/4: 24=quarter, 48=half,
    96=whole, 12=8th, 6=16th.
  's' suffix: note rings into SUS column on subsequent rows.
  Articulation: .stac .legato .trill (after duration).

EXPLICIT REST: R:24 (rest with duration; goes in a single voice cell).
EMPTY ROW: '.' alone \u2014 equivalent to '-, -, -, ...' across all columns.
NR COMPRESSION: '11R' = 11 consecutive empty rows; '11R |' = same but the
  last empty row carries the bar terminator. Use NR aggressively to keep
  scores compact \u2014 80%+ of rows are typically empty at RES 96.

BAR TERMINATOR: append ' |' to the LAST content row of every bar.
  Every bar MUST start at BEAT=1 and end with '|'.

VALIDATION INVARIANTS the score MUST satisfy:
  - Bar starts at BEAT=1.
  - Bar ends with '|'.
  - Note duration never overflows the bar:
      beat + duration - 1 <= RESOLUTION
  - Voice column count matches header VOICES.
  - Every cell parses as a valid note token, rest, '-' or curve.

TYPICAL SCORE LENGTH: 16-32 bars in 4/4, RESOLUTION 96.`;
var PIANO_TRIO_EXAMPLE = `# TITLE: Piano Trio Demo
# COMPOSER: Wavelody
# TEMPO: 96
# TIME: 4/4
# KEY: C major
# RESOLUTION: 96
# INSTRUMENTS: piano, violin, cello
# VOICES: LH, RH, V, Vc
BAR, BEAT, STR, HAR, SUS, LH, RH, V, Vc
1, 1, <SECTION:A>, I, -, (C2:f:24), (C4,E4,G4:mf:12), (G4:mf:96), (C3:mp:48)
11R
1, 13, -, -, -, -, (C4,E4,G4:mp:12), -, -
11R
1, 25, -, -, -, (G2:f:24), (C4,E4,G4:mf:12), -, -
83R |
2, 1, -, IV, -, (F2:f:24), (F4,A4,C5:mf:12), (A4:mf:96), (F3:mp:48)
95R |
3, 1, -, V7, -, (G2:f:24), (G3,B3,D4,F4:mf:12), (D5:mf:96), (G2:mp:48)
95R |
4, 1, <CADENCE:auth>, I, -, (C2:mp:96s), (C4,E4,G4:mp:12), (C5:mf:24), (C3:f:96s)
95R |`;
var WORKED_EXAMPLES = `Worked example 1 \u2014 Piano Trio four-bar I-IV-V7-I cadence (RES 96, 4/4):

${PIANO_TRIO_EXAMPLE}

Worked example 2 \u2014 single voice, sparse melody:

# TITLE: Sparse Pensive
# TEMPO: 64
# TIME: 4/4
# KEY: A minor
# RESOLUTION: 96
# VOICES: V1
BAR, BEAT, STR, HAR, SUS, V1
1, 1, <SECTION:A>, i, -, (A4:p:48s)
1, 49, -, -, (A4:p), (E5:mp:48)
47R |
2, 1, -, VI, -, (F4:p:48)
47R
2, 49, -, V, -, (E4:mp:48)
47R |

Worked example 3 \u2014 String Quartet two bars (RES 96, 4/4):

# TITLE: Quartet
# TEMPO: 88
# TIME: 4/4
# KEY: G major
# RESOLUTION: 96
# INSTRUMENTS: violin, violin, viola, cello
# VOICES: V1, V2, VA, VC
BAR, BEAT, STR, HAR, SUS, V1, V2, VA, VC
1, 1, <SECTION:A>, I, -, (G5:f:96), (D5:mf:48), (B3:mf:48), (G2:f:96s)
1, 49, -, V, (G2:f), -, (A4:mf:48), (D4:mf:48), -
47R |
2, 1, -, IV, -, (C5:mf:96), (E5:mf:48), (G3:mf:48), (C3:mf:96s)
47R |`;
function templateBlock(template) {
  const assignments = TEMPLATE_VOICE_ASSIGNMENTS[template];
  const lines = Object.entries(assignments).map(
    ([voice, instrument]) => `  ${voice} \u2192 ${instrument}`
  );
  const voices = Object.keys(assignments).join(", ");
  return `Ensemble template: ${template}.
Voices (use these exact column names in VOICES): ${voices}
Voice \u2192 instrument mapping the renderer expects:
${lines.join("\n")}`;
}
__name(templateBlock, "templateBlock");
var COMPOSE_INSTRUCTIONS = `You are a composer. Given a user prompt and an
ensemble template, produce a complete MusicDSL v2.2 score.

Output rules:
- Output ONLY the score: header block, schema row, then grid rows. No
  prose, no markdown fences, no commentary.
- Use the EXACT voice column names from the ensemble template above.
- Use NR compression aggressively (e.g. '95R |' for an empty bar).
- 16-32 bars typical. Default to 16 if unsure.
- Always set RESOLUTION to 96 unless the time signature dictates otherwise.
- Every bar starts at BEAT=1 and ends with ' |' on its last row.
- Note duration must not overflow the bar.`;
var EDIT_INSTRUCTIONS = `You are an editor. Given the FULL current score
and an edit instruction scoped to (voice, bar range), produce a
MusicDSL slice covering ONLY the requested bar range for ONLY the
requested voice column. Other voices are not your concern.

Output rules:
- Output ONLY a MusicDSL slice \u2014 header block, schema row matching the
  current score's voices, then grid rows for the requested bar range.
- The slice MUST cover bars bar_start..bar_end inclusive. Include the
  full row content for those bars (all voices), even though only the
  named voice should change. The frontend extracts and merges the
  changed voice's cells.
- Preserve existing structure, harmony, and other voices unchanged
  unless the edit instruction explicitly asks otherwise.
- Maintain the same RESOLUTION and TIME as the current score.
- No prose, no markdown fences.`;
function buildComposeSystem(template) {
  const cached = {
    type: "text",
    text: [
      MUSICDSL_SPEC,
      "",
      templateBlock(template),
      "",
      WORKED_EXAMPLES
    ].join("\n\n"),
    cache_control: { type: "ephemeral" }
  };
  const tail = {
    type: "text",
    text: COMPOSE_INSTRUCTIONS
  };
  return [cached, tail];
}
__name(buildComposeSystem, "buildComposeSystem");
function buildEditSystem(template, currentScore, voiceId, barStart, barEnd) {
  const cached = {
    type: "text",
    text: [
      MUSICDSL_SPEC,
      "",
      templateBlock(template),
      "",
      WORKED_EXAMPLES
    ].join("\n\n"),
    cache_control: { type: "ephemeral" }
  };
  const tail = {
    type: "text",
    text: [
      EDIT_INSTRUCTIONS,
      "",
      `Selection: voice=${voiceId} bars=${barStart}..${barEnd}.`,
      "",
      "Full current score (for context):",
      "<score>",
      currentScore,
      "</score>"
    ].join("\n")
  };
  return [cached, tail];
}
__name(buildEditSystem, "buildEditSystem");
var DEFAULT_CLAUDE_MODEL = "claude-opus-4-7";

// src/lib/musicdsl/types.ts
var ParseError = class extends Error {
  static {
    __name(this, "ParseError");
  }
  line;
  column;
  constructor(message, line, column) {
    super(`${message} (line ${line}, column ${column})`);
    this.name = "ParseError";
    this.line = line;
    this.column = column;
  }
};

// src/lib/musicdsl/expandRests.ts
var NR_TOKEN = /^(\d+)R(\s*\|)?$/;
function matchNRToken(line) {
  const m = NR_TOKEN.exec(line.trim());
  if (!m) return null;
  return { count: parseInt(m[1], 10), endsBar: m[2] !== void 0 };
}
__name(matchNRToken, "matchNRToken");
function readBarBeat(line) {
  const m = /^(\d+)\s*,\s*(\d+)/.exec(line.trim());
  if (!m) return null;
  return { bar: parseInt(m[1], 10), beat: parseInt(m[2], 10) };
}
__name(readBarBeat, "readBarBeat");
function expandRests(source) {
  const lines = source.split(/\r?\n/);
  const out = [];
  const ctx = { bar: 0, beat: 0 };
  let firstRowSeen = false;
  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      out.push(raw);
      continue;
    }
    const nr = matchNRToken(trimmed);
    if (nr !== null) {
      if (nr.count < 2) {
        throw new ParseError(`NR count must be >= 2, got "${nr.count}R"`, i + 1, 1);
      }
      if (!firstRowSeen) {
        throw new ParseError(`NR token cannot appear before any beat row`, i + 1, 1);
      }
      for (let k = 0; k < nr.count; k += 1) {
        ctx.beat += 1;
        const last = k === nr.count - 1;
        const delim = last && nr.endsBar ? " |" : "";
        out.push(`${ctx.bar}, ${ctx.beat}, .${delim}`);
      }
      if (nr.endsBar) {
        ctx.bar += 1;
        ctx.beat = 0;
      }
      continue;
    }
    const bb = readBarBeat(trimmed);
    if (bb !== null) {
      ctx.bar = bb.bar;
      ctx.beat = bb.beat;
      firstRowSeen = true;
    }
    if (trimmed.endsWith("|")) {
      ctx.bar += 1;
      ctx.beat = 0;
    }
    out.push(raw);
  }
  return out.join("\n");
}
__name(expandRests, "expandRests");

// src/lib/musicdsl/parse.ts
var FIXED_LEADING_COLUMNS = ["BAR", "BEAT", "STR", "HAR", "SUS"];
var DYNAMICS = /* @__PURE__ */ new Set([
  "ppp",
  "pp",
  "p",
  "mp",
  "mf",
  "f",
  "ff",
  "fff",
  "sfz"
]);
var STEP_TO_PC = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11
};
function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}
__name(gcd, "gcd");
var CANONICAL_RESOLUTIONS = {
  "4/4": 96,
  "3/4": 96,
  "2/4": 96,
  "6/8": 96,
  "9/8": 144,
  "12/8": 96,
  "5/4": 480,
  "7/8": 112
};
function computeResolution(time) {
  const { numerator, denominator } = time;
  const key = `${numerator}/${denominator}`;
  const canonical = CANONICAL_RESOLUTIONS[key];
  if (canonical !== void 0) return canonical;
  if (denominator === 4) return Math.max(96, numerator * 24);
  if (denominator === 8) return Math.max(96, numerator * 16);
  throw new ParseError(
    `Unsupported time signature denominator: ${key} (only /4 and /8 are supported)`,
    1,
    1
  );
}
__name(computeResolution, "computeResolution");
function pitchToMidi(step, alter, octave) {
  return (octave + 1) * 12 + STEP_TO_PC[step] + alter;
}
__name(pitchToMidi, "pitchToMidi");
var DEFAULT_HEADER = {
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  resolution: 96,
  instruments: [],
  voices: []
};
function err(state, message, columnHint = 1) {
  throw new ParseError(message, state.lineNo, columnHint);
}
__name(err, "err");
function parsePitch(token, state) {
  const m = /^([A-G])(#|b|n)?(-?\d+)$/.exec(token);
  if (!m) err(state, `Invalid pitch token: "${token}"`);
  const step = m[1];
  let alter = 0;
  if (m[2] === "#") alter = 1;
  else if (m[2] === "b") alter = -1;
  const octave = parseInt(m[3], 10);
  return { step, alter, octave, midi: pitchToMidi(step, alter, octave) };
}
__name(parsePitch, "parsePitch");
function parseDynamic(token, state) {
  if (!DYNAMICS.has(token)) err(state, `Unknown dynamic: "${token}"`);
  return token;
}
__name(parseDynamic, "parseDynamic");
function parseFraction(input, state) {
  const m = /^(\d+)\/(\d+)$/.exec(input);
  if (!m) err(state, `Invalid offset fraction: "${input}"`);
  const num = parseInt(m[1], 10);
  const den = parseInt(m[2], 10);
  if (den === 0) err(state, `Offset denominator cannot be zero`);
  if (num <= 0 || num >= den) {
    err(state, `Offset must be a proper fraction in lowest terms (got ${num}/${den})`);
  }
  if (gcd(num, den) !== 1) {
    err(state, `Offset must be in lowest terms (got ${num}/${den})`);
  }
  return { num, den };
}
__name(parseFraction, "parseFraction");
function parseInnerNote(inner, state) {
  let body = inner;
  let tag;
  const tagMatch = /#([a-z])$/.exec(body);
  if (tagMatch) {
    tag = tagMatch[1];
    body = body.slice(0, body.length - tagMatch[0].length);
  }
  const colonParts = body.split(":");
  if (colonParts.length !== 3) {
    err(state, `Note must have form (PITCH:DYNAMIC:DURATION), got "(${inner})"`);
  }
  const pitchPart = colonParts[0];
  const dynPart = colonParts[1];
  let durPart = colonParts[2];
  let articulation;
  const artMatch = /\.([A-Za-z][A-Za-z0-9]*)$/.exec(durPart);
  if (artMatch) {
    articulation = artMatch[1];
    durPart = durPart.slice(0, durPart.length - artMatch[0].length);
  }
  let sustain = false;
  if (durPart.endsWith("s")) {
    sustain = true;
    durPart = durPart.slice(0, -1);
  }
  if (!/^\d+$/.test(durPart)) {
    err(state, `Invalid duration: "${durPart}"`);
  }
  const durationUnits = parseInt(durPart, 10);
  const pitches = pitchPart.split(",").map((p) => parsePitch(p, state));
  const dynamic = parseDynamic(dynPart, state);
  return { pitches, dynamic, durationUnits, sustain, articulation, tag };
}
__name(parseInnerNote, "parseInnerNote");
function parseSusNote(inner, state) {
  const parts = inner.split(":");
  if (parts.length !== 2) err(state, `SUS token must be (PITCHES:DYNAMIC), got "(${inner})"`);
  const pitches = parts[0].split(",").map((p) => parsePitch(p, state));
  const dynamic = parseDynamic(parts[1], state);
  return { pitches, dynamic };
}
__name(parseSusNote, "parseSusNote");
function consumeNoteToken(cell, i, state) {
  let j = i + 1;
  while (j < cell.length && cell[j] !== ")") j += 1;
  if (j >= cell.length) err(state, "Unclosed note paren");
  const inner = cell.slice(i + 1, j);
  const innerParts = parseInnerNote(inner, state);
  let nextIdx = j + 1;
  let offset;
  if (nextIdx < cell.length && /[+~-]/.test(cell[nextIdx])) {
    const remainder = cell.slice(nextIdx);
    const m = /^([+~-])(\d+\/\d+)/.exec(remainder);
    if (m) {
      const sign = m[1];
      const fraction = parseFraction(m[2], state);
      const mode = sign === "+" ? "forward" : sign === "~" ? "anchored" : "backward";
      offset = { mode, fraction };
      nextIdx += m[0].length;
    }
  }
  const note = {
    pitches: innerParts.pitches,
    dynamic: innerParts.dynamic,
    durationUnits: innerParts.durationUnits,
    sustain: innerParts.sustain,
    ...innerParts.articulation !== void 0 && {
      articulation: innerParts.articulation
    },
    ...innerParts.tag !== void 0 && { tag: innerParts.tag },
    ...offset !== void 0 && { offset }
  };
  return { note, nextIdx };
}
__name(consumeNoteToken, "consumeNoteToken");
function consumeCurveToken(cell, i, state) {
  const dimChar = cell[i];
  const dim = dimChar.toUpperCase();
  const releases = dimChar === dimChar.toLowerCase();
  let j = i + 1;
  let scope = "master";
  if (cell[j] === "#") {
    let k = j + 1;
    while (k < cell.length && /[a-z]/.test(cell[k])) k += 1;
    if (k === j + 1) err(state, `Empty tag after '#' in curve token`);
    scope = cell.slice(j + 1, k);
    j = k;
    if (cell[j] === ":") j += 1;
  }
  let value = null;
  const numMatch = /^(\d+(?:\.\d+)?)/.exec(cell.slice(j));
  if (numMatch) {
    value = parseFloat(numMatch[1]);
    j += numMatch[0].length;
  }
  if (!releases && value === null) {
    err(state, `Curve waypoint ${dim} requires a value`);
  }
  if (value !== null && (value < 0 || value > 2)) {
    err(state, `Curve value out of range [0.0, 2.0]: ${value}`);
  }
  return { curve: { dim, releases, value, scope }, nextIdx: j };
}
__name(consumeCurveToken, "consumeCurveToken");
function parseCellTokens(cell, state) {
  const notes = [];
  const curves = [];
  let i = 0;
  while (i < cell.length) {
    const c = cell[i];
    if (c === "(") {
      const { note, nextIdx } = consumeNoteToken(cell, i, state);
      notes.push(note);
      i = nextIdx;
    } else if (c === "J" || c === "j" || c === "Y" || c === "y") {
      const { curve, nextIdx } = consumeCurveToken(cell, i, state);
      curves.push(curve);
      i = nextIdx;
    } else {
      err(state, `Unexpected character in voice cell: "${c}"`);
    }
  }
  return { notes, curves };
}
__name(parseCellTokens, "parseCellTokens");
function parseVoiceCell(raw, state) {
  const trimmed = raw.trim();
  if (trimmed === "-" || trimmed === "") {
    return { notes: [], curves: [], silent: true };
  }
  const restMatch = /^R:(\d+)$/.exec(trimmed);
  if (restMatch) {
    return {
      notes: [],
      curves: [],
      silent: false,
      rest: { durationUnits: parseInt(restMatch[1], 10) }
    };
  }
  const { notes, curves } = parseCellTokens(trimmed, state);
  return { notes, curves, silent: notes.length === 0 && curves.length === 0 };
}
__name(parseVoiceCell, "parseVoiceCell");
function parseSusCell(raw, state) {
  const trimmed = raw.trim();
  if (trimmed === "-" || trimmed === "") return [];
  const susNotes = [];
  let i = 0;
  while (i < trimmed.length) {
    if (trimmed[i] !== "(") err(state, `SUS column must contain (...) tokens or "-"`);
    let j = i + 1;
    while (j < trimmed.length && trimmed[j] !== ")") j += 1;
    if (j >= trimmed.length) err(state, "Unclosed SUS paren");
    susNotes.push(parseSusNote(trimmed.slice(i + 1, j), state));
    i = j + 1;
  }
  return susNotes;
}
__name(parseSusCell, "parseSusCell");
function parseHeaderLine(line, state, header) {
  const m = /^#\s*([A-Z_]+)\s*:\s*(.*)$/.exec(line);
  if (!m) err(state, `Malformed header line: "${line}"`);
  const key = m[1];
  const value = m[2].trim();
  switch (key) {
    case "TITLE":
      header.title = value;
      break;
    case "COMPOSER":
      header.composer = value;
      break;
    case "TEMPO": {
      const t = parseInt(value, 10);
      if (!Number.isFinite(t)) err(state, `Invalid TEMPO: "${value}"`);
      header.tempo = t;
      break;
    }
    case "TIME": {
      const tm = /^(\d+)\/(\d+)$/.exec(value);
      if (!tm) err(state, `Invalid TIME: "${value}"`);
      header.timeSignature = { numerator: parseInt(tm[1], 10), denominator: parseInt(tm[2], 10) };
      break;
    }
    case "KEY":
      header.key = value;
      break;
    case "RESOLUTION": {
      const r = parseInt(value, 10);
      if (!Number.isFinite(r) || r <= 0) err(state, `Invalid RESOLUTION: "${value}"`);
      header.resolution = r;
      break;
    }
    case "WAV_OFFSET": {
      const w = parseFloat(value);
      if (!Number.isFinite(w)) err(state, `Invalid WAV_OFFSET: "${value}"`);
      header.wavOffset = w;
      break;
    }
    case "INSTRUMENTS":
      header.instruments = value.split(",").map((s) => s.trim()).filter(Boolean);
      break;
    case "VOICES":
      header.voices = value.split(",").map((s) => s.trim()).filter(Boolean);
      break;
    default:
      err(state, `Unknown header field: "${key}"`);
  }
}
__name(parseHeaderLine, "parseHeaderLine");
function isSchemaRow(cells) {
  if (cells.length < FIXED_LEADING_COLUMNS.length) return false;
  for (let i = 0; i < FIXED_LEADING_COLUMNS.length; i += 1) {
    if (cells[i] !== FIXED_LEADING_COLUMNS[i]) return false;
  }
  return cells.slice(FIXED_LEADING_COLUMNS.length).every((c) => /^[A-Za-z][A-Za-z0-9_]*$/.test(c));
}
__name(isSchemaRow, "isSchemaRow");
function splitCells(line) {
  const cells = [];
  let depth = 0;
  let buf = "";
  for (const ch of line) {
    if (ch === "(") {
      depth += 1;
      buf += ch;
    } else if (ch === ")") {
      depth = Math.max(0, depth - 1);
      buf += ch;
    } else if (ch === "," && depth === 0) {
      cells.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  cells.push(buf.trim());
  return cells;
}
__name(splitCells, "splitCells");
function trimBarDelim(cells) {
  if (cells.length === 0) return { cells, endsBar: false };
  const last = cells[cells.length - 1];
  if (last.endsWith("|")) {
    const stripped = last.slice(0, -1).trim();
    const next = cells.slice(0, -1);
    if (stripped.length > 0) next.push(stripped);
    return { cells: next, endsBar: true };
  }
  return { cells, endsBar: false };
}
__name(trimBarDelim, "trimBarDelim");
function parseBeatRow(raw, voices, state) {
  const cells = splitCells(raw);
  if (cells.length < 3) err(state, `Row needs at least BAR, BEAT, content`);
  const bar = parseInt(cells[0], 10);
  const beat = parseInt(cells[1], 10);
  if (!Number.isFinite(bar) || !Number.isFinite(beat)) {
    err(state, `Row must start with integer bar and beat, got "${cells[0]}, ${cells[1]}"`);
  }
  const rest = cells.slice(2);
  const { cells: stripped, endsBar } = trimBarDelim(rest);
  if (stripped.length === 1 && stripped[0] === ".") {
    return {
      row: makeEmptyRow(bar, beat, voices, endsBar),
      bar
    };
  }
  const expectedLen = FIXED_LEADING_COLUMNS.length - 2 + voices.length;
  if (stripped.length !== expectedLen) {
    err(
      state,
      `Row column count mismatch: expected ${expectedLen} (STR/HAR/SUS + ${voices.length} voices), got ${stripped.length}`
    );
  }
  const [strCell, harCell, susCell, ...voiceCells] = stripped;
  const sustain = parseSusCell(susCell, state);
  const voicesMap = /* @__PURE__ */ new Map();
  for (let i = 0; i < voices.length; i += 1) {
    voicesMap.set(voices[i], parseVoiceCell(voiceCells[i], state));
  }
  const row = {
    bar,
    beat,
    sustain,
    voices: voicesMap,
    endsBar,
    ...strCell !== "-" && strCell !== "" ? { structure: strCell } : {},
    ...harCell !== "-" && harCell !== "" ? { harmony: harCell } : {}
  };
  return { row, bar };
}
__name(parseBeatRow, "parseBeatRow");
function makeEmptyRow(bar, beat, voices, endsBar) {
  const voicesMap = /* @__PURE__ */ new Map();
  for (const v of voices) {
    voicesMap.set(v, { notes: [], curves: [], silent: true });
  }
  return { bar, beat, sustain: [], voices: voicesMap, endsBar };
}
__name(makeEmptyRow, "makeEmptyRow");
function parse(source) {
  const expanded = expandRests(source);
  const lines = expanded.split(/\r?\n/);
  const header = {};
  let hadHeaderBlock = false;
  let hadSchemaRow = false;
  let voices = [];
  const rows = [];
  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const state = { lineNo: i + 1 };
    const trimmed = raw.trim();
    if (trimmed === "") {
      i += 1;
      continue;
    }
    if (trimmed.startsWith("#")) {
      hadHeaderBlock = true;
      parseHeaderLine(trimmed, state, header);
      i += 1;
      continue;
    }
    const cells = splitCells(trimmed);
    if (!hadSchemaRow && isSchemaRow(cells)) {
      hadSchemaRow = true;
      const declared = cells.slice(FIXED_LEADING_COLUMNS.length);
      voices = declared;
      if (header.voices && header.voices.length > 0) {
        if (header.voices.length !== declared.length) {
          err(state, `Schema row voices (${declared.join(",")}) do not match header VOICES`);
        }
      } else {
        header.voices = declared;
      }
      i += 1;
      continue;
    }
    if (voices.length === 0) {
      if (header.voices && header.voices.length > 0) {
        voices = header.voices;
      } else {
        const probe = trimBarDelim(cells.slice(2)).cells;
        const isDot = probe.length === 1 && probe[0] === ".";
        const inferred = isDot ? 0 : Math.max(0, probe.length - 3);
        voices = Array.from({ length: inferred }, (_, k) => `V${k + 1}`);
        header.voices = voices;
      }
    }
    const { row } = parseBeatRow(trimmed, voices, state);
    rows.push(row);
    i += 1;
  }
  const filled = {
    ...DEFAULT_HEADER,
    ...header,
    voices: voices.length > 0 ? voices : header.voices ?? [],
    instruments: header.instruments ?? []
  };
  if (!header.timeSignature) filled.timeSignature = { numerator: 4, denominator: 4 };
  if (!header.resolution) filled.resolution = computeResolution(filled.timeSignature);
  const bars = [];
  let currentRows = [];
  let currentBarIdx = -1;
  let currentResolution = filled.resolution;
  const currentTime = filled.timeSignature;
  for (const row of rows) {
    if (row.bar !== currentBarIdx) {
      if (currentRows.length > 0) {
        bars.push({
          index: currentBarIdx,
          rows: currentRows,
          resolution: currentResolution,
          timeSignature: currentTime
        });
      }
      currentRows = [];
      currentBarIdx = row.bar;
    }
    if (row.structure) {
      const resMatch = /^<RESOLUTION:(\d+)>$/.exec(row.structure);
      if (resMatch) currentResolution = parseInt(resMatch[1], 10);
    }
    currentRows.push(row);
  }
  if (currentRows.length > 0) {
    bars.push({
      index: currentBarIdx,
      rows: currentRows,
      resolution: currentResolution,
      timeSignature: currentTime
    });
  }
  return {
    header: filled,
    bars,
    hadHeaderBlock,
    hadSchemaRow
  };
}
__name(parse, "parse");

// api/validate-musicdsl.ts
function validateMusicDsl(source) {
  let score;
  try {
    score = parse(source);
  } catch (e) {
    if (e instanceof ParseError) {
      return { valid: false, errors: [e.message] };
    }
    const msg = e instanceof Error ? e.message : String(e);
    return { valid: false, errors: [`Parse failure: ${msg}`] };
  }
  const errors = [];
  if (score.bars.length === 0) {
    errors.push("Score has no bars.");
    return { valid: false, errors };
  }
  if (score.header.voices.length === 0) {
    errors.push("Header VOICES is empty.");
  }
  for (const bar of score.bars) {
    checkBar(bar, score, errors);
  }
  return errors.length === 0 ? { valid: true, score } : { valid: false, errors };
}
__name(validateMusicDsl, "validateMusicDsl");
function checkBar(bar, score, errors) {
  if (bar.rows.length === 0) {
    errors.push(`Bar ${bar.index}: empty (no rows).`);
    return;
  }
  const first = bar.rows[0];
  if (first.beat !== 1) {
    errors.push(
      `Bar ${bar.index}: first row must start at beat 1, got beat ${first.beat}.`
    );
  }
  const last = bar.rows[bar.rows.length - 1];
  if (!last.endsBar) {
    errors.push(`Bar ${bar.index}: last row missing bar terminator '|'.`);
  }
  for (const row of bar.rows) {
    checkRow(row, bar, score, errors);
  }
}
__name(checkBar, "checkBar");
function checkRow(row, bar, score, errors) {
  if (row.beat < 1 || row.beat > bar.resolution) {
    errors.push(
      `Bar ${bar.index} beat ${row.beat}: out of range (resolution ${bar.resolution}).`
    );
  }
  for (const voice of score.header.voices) {
    const cell = row.voices.get(voice);
    if (!cell) continue;
    for (const note of cell.notes) {
      const end = row.beat + note.durationUnits - 1;
      if (end > bar.resolution) {
        errors.push(
          `Bar ${bar.index} beat ${row.beat} voice ${voice}: note duration ${note.durationUnits} overflows bar (ends at ${end}, resolution ${bar.resolution}).`
        );
      }
    }
    if (cell.rest && row.beat + cell.rest.durationUnits - 1 > bar.resolution) {
      errors.push(
        `Bar ${bar.index} beat ${row.beat} voice ${voice}: rest duration ${cell.rest.durationUnits} overflows bar.`
      );
    }
  }
}
__name(checkRow, "checkRow");

// api/edit.ts
var MAX_ATTEMPTS = 3;
var EDIT_MAX_TOKENS = 4e3;
async function handleEdit(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  const body = await parseBody2(request);
  if (body instanceof Response) return body;
  const gate = await gateWriteEndpoint(request, env, {
    kind: "edit",
    checkKillswitchFlag: false,
    useInflight: false
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
    body.bar_end
  );
  const userMsg = `Edit voice ${body.voice_id} bars ${body.bar_start}-${body.bar_end}: ${body.edit_prompt}`;
  let lastErrors = [];
  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      let text;
      try {
        text = await anthropicComplete(env.ANTHROPIC_API_KEY, {
          model,
          max_tokens: EDIT_MAX_TOKENS,
          system,
          messages: [{ role: "user", content: userMsg }],
          temperature: 0.6
        });
      } catch (e) {
        const status = e instanceof AnthropicHttpError ? e.status : 500;
        const message = e instanceof Error ? e.message : String(e);
        lastErrors = [`Anthropic ${status}: ${message}`];
        continue;
      }
      const validation = validateMusicDsl(text);
      if (validation.valid) {
        const response = {
          slice: text,
          bar_start: body.bar_start,
          bar_end: body.bar_end,
          voice_id: body.voice_id
        };
        return json(response, 200, refresh);
      }
      lastErrors = validation.errors;
    }
    return json(
      {
        error: "edit_failed",
        retry_after_seconds: 5,
        errors: lastErrors
      },
      503,
      refresh
    );
  } finally {
    await gate.release();
  }
}
__name(handleEdit, "handleEdit");
async function parseBody2(request) {
  let raw;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!raw || typeof raw !== "object") {
    return json({ error: "Body must be a JSON object" }, 400);
  }
  const obj = raw;
  if (typeof obj.voice_id !== "string" || obj.voice_id.length === 0) {
    return json({ error: "voice_id is required" }, 400);
  }
  if (typeof obj.bar_start !== "number" || !Number.isInteger(obj.bar_start) || obj.bar_start < 1) {
    return json({ error: "bar_start must be a positive integer" }, 400);
  }
  if (typeof obj.bar_end !== "number" || !Number.isInteger(obj.bar_end) || obj.bar_end < obj.bar_start) {
    return json({ error: "bar_end must be >= bar_start" }, 400);
  }
  if (typeof obj.edit_prompt !== "string" || obj.edit_prompt.trim().length === 0) {
    return json({ error: "edit_prompt is required" }, 400);
  }
  if (obj.edit_prompt.length > PROMPT_MAX_CHARS) {
    return json({ error: `edit_prompt exceeds ${PROMPT_MAX_CHARS} chars` }, 400);
  }
  if (typeof obj.current_score !== "string" || obj.current_score.length === 0) {
    return json({ error: "current_score is required" }, 400);
  }
  return {
    voice_id: obj.voice_id,
    bar_start: obj.bar_start,
    bar_end: obj.bar_end,
    edit_prompt: obj.edit_prompt.trim(),
    current_score: obj.current_score
  };
}
__name(parseBody2, "parseBody");
function inferTemplate(score) {
  const m = /^# VOICES:\s*(.+)$/m.exec(score);
  if (!m) return DEFAULT_TEMPLATE;
  const voices = m[1].split(",").map((v) => v.trim()).filter(Boolean);
  if (voices.includes("V1") && voices.includes("V2") && voices.includes("VA") && voices.includes("VC")) {
    return "string_quartet";
  }
  return DEFAULT_TEMPLATE;
}
__name(inferTemplate, "inferTemplate");

// api/generate.ts
var MAX_ATTEMPTS2 = 3;
var COMPOSE_MAX_TOKENS = 8e3;
async function handleGenerate(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  const body = await parseBody3(request);
  if (body instanceof Response) return body;
  const gate = await gateWriteEndpoint(request, env, {
    kind: "generation",
    checkKillswitchFlag: true,
    useInflight: true
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
      ...refresh
    }
  });
}
__name(handleGenerate, "handleGenerate");
async function parseBody3(request) {
  let raw;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!raw || typeof raw !== "object") {
    return json({ error: "Body must be a JSON object" }, 400);
  }
  const obj = raw;
  if (typeof obj.prompt !== "string" || obj.prompt.trim().length === 0) {
    return json({ error: "prompt is required" }, 400);
  }
  if (obj.prompt.length > PROMPT_MAX_CHARS) {
    return json(
      {
        error: `prompt exceeds ${PROMPT_MAX_CHARS} chars`,
        detail: `length=${obj.prompt.length}`
      },
      400
    );
  }
  const template = obj.template ?? DEFAULT_TEMPLATE;
  return { prompt: obj.prompt.trim(), template };
}
__name(parseBody3, "parseBody");
function composeStream(env, req, release) {
  const enc = new TextEncoder();
  const model = env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL;
  const system = buildComposeSystem(req.template ?? DEFAULT_TEMPLATE);
  return new ReadableStream({
    async start(controller) {
      const send = /* @__PURE__ */ __name((event, data) => {
        const payload = `event: ${event}
data: ${JSON.stringify(data)}

`;
        controller.enqueue(enc.encode(payload));
      }, "send");
      let lastErrors = [];
      try {
        for (let attempt = 1; attempt <= MAX_ATTEMPTS2; attempt += 1) {
          send("attempt", { attempt });
          let text;
          try {
            text = await anthropicStreamText(
              env.ANTHROPIC_API_KEY,
              {
                model,
                max_tokens: COMPOSE_MAX_TOKENS,
                system,
                messages: [{ role: "user", content: req.prompt }],
                temperature: 0.7
              },
              (chunk) => send("chunk", { text: chunk })
            );
          } catch (e) {
            const status = e instanceof AnthropicHttpError ? e.status : 500;
            const message = e instanceof Error ? e.message : String(e);
            lastErrors = [`Anthropic ${status}: ${message}`];
            send("validation", {
              attempt,
              valid: false,
              errors: lastErrors
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
            errors: validation.errors
          });
        }
        send("error", {
          error: "composition_failed",
          retry_after_seconds: 5,
          errors: lastErrors
        });
      } finally {
        await release();
        controller.close();
      }
    }
  });
}
__name(composeStream, "composeStream");

// api/me.ts
async function handleMe(request, env) {
  if (request.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }
  let ctx;
  try {
    ctx = await authenticate(request, env);
  } catch (e) {
    if (e instanceof AuthError) return json(e.body, e.status);
    throw e;
  }
  const state = {
    code: ctx.code.code,
    tier: ctx.code.tier,
    label: ctx.code.label,
    generations_used: ctx.code.generations_used,
    edits_used: ctx.code.edits_used,
    generations_max: ctx.code.generations_max,
    edits_max: ctx.code.edits_max,
    expires_at: ctx.code.expires_at
  };
  return json(state, 200, refreshHeader(ctx.refreshedToken));
}
__name(handleMe, "handleMe");

// api/render.ts
var DEFAULT_PERFORMER_URL = "http://localhost:8000";
var PERFORMER_TIMEOUT_MS = 9e4;
async function handleRender(request, env) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }
  const body = await parseBody4(request);
  if (body instanceof Response) return body;
  const gate = await gateWriteEndpoint(request, env, {
    kind: "generation",
    checkKillswitchFlag: true,
    useInflight: false
  });
  if (gate instanceof Response) return gate;
  const refresh = refreshHeader(gate.ctx.refreshedToken);
  try {
    const cacheKey = await cacheKeyFor(
      body.musicdsl,
      body.template,
      body.voice_assignments ?? TEMPLATE_VOICE_ASSIGNMENTS[body.template]
    );
    if (env.RENDER_CACHE) {
      const cached = await loadFromCache(env.RENDER_CACHE, cacheKey, body);
      if (cached) {
        await rollbackGeneration(env, gate);
        return json(cached, 200, refresh);
      }
    }
    const performerUrl = env.PERFORMER_V0_URL || DEFAULT_PERFORMER_URL;
    const performerResp = await callPerformer(performerUrl, body);
    let response;
    if (env.RENDER_CACHE) {
      response = await writeToCacheAndBuildResponse(
        env.RENDER_CACHE,
        cacheKey,
        performerResp
      );
    } else {
      response = {
        master_url: performerResp.master_url,
        stems: performerResp.stems.map((s) => ({
          voice_id: s.voice_id,
          url: s.audio_url
        })),
        cached: false
      };
    }
    return json(response, 200, refresh);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return json(
      { error: "render_failed", detail: message },
      502,
      refresh
    );
  } finally {
    await gate.release();
  }
}
__name(handleRender, "handleRender");
async function parseBody4(request) {
  let raw;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!raw || typeof raw !== "object") {
    return json({ error: "Body must be a JSON object" }, 400);
  }
  const obj = raw;
  if (typeof obj.musicdsl !== "string" || obj.musicdsl.length === 0) {
    return json({ error: "musicdsl is required" }, 400);
  }
  if (typeof obj.template !== "string" || !(obj.template in TEMPLATE_VOICE_ASSIGNMENTS)) {
    return json({ error: "template is required and must be a known one" }, 400);
  }
  const out = {
    musicdsl: obj.musicdsl,
    template: obj.template
  };
  if (obj.voice_assignments && typeof obj.voice_assignments === "object" && !Array.isArray(obj.voice_assignments)) {
    out.voice_assignments = obj.voice_assignments;
  }
  if (Array.isArray(obj.voices_to_render)) {
    const filtered = obj.voices_to_render.filter(
      (v) => typeof v === "string" && v.length > 0
    );
    if (filtered.length > 0) out.voices_to_render = filtered;
  }
  return out;
}
__name(parseBody4, "parseBody");
async function callPerformer(baseUrl, body) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    PERFORMER_TIMEOUT_MS
  );
  try {
    const resp = await fetch(`${baseUrl.replace(/\/$/, "")}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        musicdsl: body.musicdsl,
        template: body.template,
        voice_assignments: body.voice_assignments ?? TEMPLATE_VOICE_ASSIGNMENTS[body.template],
        voices_to_render: body.voices_to_render
      }),
      signal: controller.signal
    });
    if (!resp.ok) {
      const detail = await resp.text().catch(() => `HTTP ${resp.status}`);
      throw new Error(`Performer v0 returned ${resp.status}: ${detail}`);
    }
    return await resp.json();
  } finally {
    clearTimeout(timeout);
  }
}
__name(callPerformer, "callPerformer");
async function loadFromCache(bucket, cacheKey, body) {
  const assignments = body.voice_assignments ?? TEMPLATE_VOICE_ASSIGNMENTS[body.template];
  const voices = Object.keys(assignments);
  const masterKey = `${cacheKey}/master.wav`;
  const masterHead = await bucket.head(masterKey);
  if (!masterHead) return null;
  const stems = [];
  for (const voice of voices) {
    const stemKey = `${cacheKey}/${voice}.wav`;
    const head = await bucket.head(stemKey);
    if (!head) return null;
    stems.push({ voice_id: voice, url: cacheUrl(stemKey) });
  }
  return {
    master_url: cacheUrl(masterKey),
    stems,
    cached: true
  };
}
__name(loadFromCache, "loadFromCache");
async function writeToCacheAndBuildResponse(bucket, cacheKey, performer) {
  const masterBytes = await fetchBinary(performer.master_url);
  const masterKey = `${cacheKey}/master.wav`;
  await bucket.put(masterKey, masterBytes, {
    httpMetadata: { contentType: "audio/wav" }
  });
  const stems = [];
  for (const stem of performer.stems) {
    const stemBytes = await fetchBinary(stem.audio_url);
    const stemKey = `${cacheKey}/${stem.voice_id}.wav`;
    await bucket.put(stemKey, stemBytes, {
      httpMetadata: { contentType: "audio/wav" }
    });
    stems.push({ voice_id: stem.voice_id, url: cacheUrl(stemKey) });
  }
  return {
    master_url: cacheUrl(masterKey),
    stems,
    cached: false
  };
}
__name(writeToCacheAndBuildResponse, "writeToCacheAndBuildResponse");
async function fetchBinary(url) {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch ${url}: ${resp.status}`);
  }
  return resp.arrayBuffer();
}
__name(fetchBinary, "fetchBinary");
function cacheUrl(key) {
  return `/api/render-cache/${encodeURIComponent(key)}`;
}
__name(cacheUrl, "cacheUrl");
async function cacheKeyFor(musicdsl, template, assignments) {
  const sortedAssignments = Object.keys(assignments).sort().map((k) => `${k}=${assignments[k]}`).join(",");
  const canonical = `${musicdsl}
#TEMPLATE:${template}
#ASSIGN:${sortedAssignments}`;
  const buf = new TextEncoder().encode(canonical);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return `render/${hexEncode(hashBuf)}`;
}
__name(cacheKeyFor, "cacheKeyFor");
function hexEncode(buf) {
  const bytes = new Uint8Array(buf);
  let out = "";
  for (let i = 0; i < bytes.length; i += 1) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}
__name(hexEncode, "hexEncode");
async function rollbackGeneration(env, gate) {
  const codeKey = KEY_PREFIX.code + gate.ctx.code.code;
  const raw = await env.WAVELODY_CODES.get(codeKey);
  if (!raw) return;
  let code;
  try {
    code = JSON.parse(raw);
  } catch {
    return;
  }
  if (code.generations_used <= 0) return;
  code.generations_used -= 1;
  await env.WAVELODY_CODES.put(codeKey, JSON.stringify(code));
}
__name(rollbackGeneration, "rollbackGeneration");

// api/index.ts
var ROUTES = {
  "/api/auth": handleAuth,
  "/api/me": handleMe,
  "/api/generate": handleGenerate,
  "/api/edit": handleEdit,
  "/api/render": handleRender,
  "/api/critique": handleCritique
};
var api_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    const url = new URL(request.url);
    const handler = ROUTES[url.pathname];
    if (!handler) {
      return withCors(json({ error: "Not found" }, 404));
    }
    try {
      const response = await handler(request, env);
      return withCors(response);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Internal server error";
      console.error("Unhandled error in", url.pathname, e);
      return withCors(json({ error: message }, 500));
    }
  }
};

// C:/Users/globa/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/globa/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-sFX7TB/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = api_default;

// C:/Users/globa/AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-sFX7TB/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
