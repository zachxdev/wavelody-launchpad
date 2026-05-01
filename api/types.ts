// Shared types for the Wavelody auth + rate-limit backend. Pure types — no
// references to runtime-specific globals like KVNamespace — so this module is
// safe to import from both Worker code (api/*) and the Node CLI scripts
// (scripts/*).

export type Tier = "reviewer" | "friend" | "public";

export interface AccessCode {
  code: string;
  tier: Tier;
  label: string;
  generations_used: number;
  edits_used: number;
  generations_max: number;
  edits_max: number;
  created_at: string;
  expires_at: string;
  revoked: boolean;
  last_seen_at: string | null;
}

export interface JwtPayload {
  sub: string;
  tier: Tier;
  jti: string;
  iat: number;
  exp: number;
}

export interface SessionInfo {
  code: string;
  tier: Tier;
  label: string;
  generations_max: number;
  edits_max: number;
  expires_at: string;
}

export interface QuotaState extends SessionInfo {
  generations_used: number;
  edits_used: number;
}

export interface SessionMeta {
  code: string;
  jti: string;
  created_at: string;
  user_agent: string | null;
}

export interface TierConfig {
  generations_max: number;
  edits_max: number;
  expires_days: number;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  reviewer: { generations_max: 20, edits_max: 60, expires_days: 30 },
  friend: { generations_max: 10, edits_max: 30, expires_days: 60 },
  public: { generations_max: 3, edits_max: 5, expires_days: 7 },
};

export const JWT_TTL_SECONDS = 7 * 24 * 60 * 60;

export const ACCESS_CODE_REGEX = /^[a-z0-9-]{3,40}$/i;

export const KEY_PREFIX = {
  code: "code:",
  session: "session:",
  inflight: "inflight:",
  killswitch: "killswitch:active",
} as const;

// ---------- Phase 8b endpoint contracts ----------

// /api/generate — composition. Streamed back as SSE events; the final
// `result` event carries the assembled MusicDSL string.
export interface GenerateRequest {
  prompt: string;
  // Optional ensemble template hint. Defaults to "piano_trio" — the demo
  // template — when omitted.
  template?: EnsembleTemplate;
}

// /api/edit — scoped edit. Returns a MusicDSL slice covering the requested
// bar range that the frontend merges into the AST.
export interface EditRequest {
  voice_id: string;
  bar_start: number;
  bar_end: number;
  edit_prompt: string;
  current_score: string;
}

export interface EditResponse {
  slice: string;
  bar_start: number;
  bar_end: number;
  voice_id: string;
}

// /api/render — Performer v0 proxy.
//
// voices_to_render: when provided, the Worker re-renders only those voices
// and pulls every other voice's WAV from the R2 cache. This is the path
// scoped edits take so the user only pays the latency for the changed
// voice.
export interface RenderRequest {
  musicdsl: string;
  template: EnsembleTemplate;
  voice_assignments?: Record<string, string>;
  voices_to_render?: string[];
}

export interface RenderStem {
  voice_id: string;
  url: string;
}

export interface RenderResponse {
  master_url: string;
  stems: RenderStem[];
  cached: boolean;
}

// /api/critique — Gemini multimodal call.
export interface CritiqueRequest {
  musicdsl: string;
  master_wav_url: string;
  original_prompt: string;
}

export interface CritiqueSuggestion {
  // Free-form location string e.g. "bar 3 beat 49 voice V". Gemini fills
  // this in natural-language form rather than a structured trio so the
  // model can describe ranges, sub-row positions, and voice-pairs.
  location: string;
  issue: string;
  suggested_fix: string;
}

export interface CritiqueResponse {
  suggestions: CritiqueSuggestion[];
}

// Standard error body shape returned by every Phase 8b endpoint.
export interface ApiError {
  error: string;
  detail?: string;
  retry_after_seconds?: number;
}

// Demo ensemble templates. Phase 8b ships piano_trio only; future templates
// land alongside the corresponding Performer v0 instrument profiles.
export type EnsembleTemplate = "piano_trio" | "string_quartet";

export const DEFAULT_TEMPLATE: EnsembleTemplate = "piano_trio";

// Per-template voice assignments — what instrument each voice column maps
// to in Performer v0. The Performer takes the same shape over the wire.
export const TEMPLATE_VOICE_ASSIGNMENTS: Record<
  EnsembleTemplate,
  Record<string, string>
> = {
  piano_trio: { LH: "piano_lh", RH: "piano_rh", V: "violin", Vc: "cello" },
  string_quartet: { V1: "violin", V2: "violin", VA: "viola", VC: "cello" },
};

// Hard cap on free-form prompt length. The Engine Readiness Gate calls out
// that prompts should be terse; 1000 chars accommodates the longest
// suggested prompt with breathing room.
export const PROMPT_MAX_CHARS = 1000;
