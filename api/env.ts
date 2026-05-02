// Worker runtime bindings. Imports KVNamespace / R2Bucket from
// @cloudflare/workers-types, so this module is for Worker code only — do not
// import it from scripts/.

export interface Env {
  // Static frontend assets (dist/) bound via wrangler.toml [assets].
  ASSETS: Fetcher;

  // Phase 7: auth + rate-limit.
  WAVELODY_CODES: KVNamespace;
  WAVELODY_JWT_SECRET: string;

  // Phase 8b: external services.
  ANTHROPIC_API_KEY: string;
  GEMINI_API_KEY: string;

  // Performer v0 service base URL (no trailing slash). Defaults to the local
  // dev URL when unset. Phase 9 wires the production URL.
  PERFORMER_V0_URL?: string;

  // R2 bucket binding for the render cache. Optional in Phase 8b — when
  // unbound, /api/render skips the cache and proxies every call. Phase 9
  // wires the real binding via wrangler.toml.
  RENDER_CACHE?: R2Bucket;

  // Optional override of the Claude model name. Defaults to
  // claude-opus-4-7 per the Engine Readiness Gate.
  CLAUDE_MODEL?: string;
}
