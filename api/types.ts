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
