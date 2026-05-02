// Built-in access codes that are always recognised by /api/auth even when
// the wavelody-codes KV namespace hasn't been seeded with them. The first
// successful auth call materialises the AccessCode record into KV so
// downstream middleware (quota tracking, last_seen_at, revoke checks)
// behaves identically to a code created by scripts/generate-codes.ts.
//
// Use this sparingly — it bypasses the partner-tracking workflow. Reserve
// it for owner / dev codes that need to keep working without a manual KV
// seed step.

import type { AccessCode, Tier } from "./types";

interface BuiltInCodeSpec {
  tier: Tier;
  label: string;
  generations_max: number;
  edits_max: number;
  expires_days: number;
}

const BUILT_IN_CODES: Record<string, BuiltInCodeSpec> = {
  "dev-network-owner": {
    tier: "reviewer",
    label: "Dev Network Owner",
    generations_max: 9999,
    edits_max: 9999,
    expires_days: 365 * 5,
  },
};

export function buildBuiltInAccessCode(code: string): AccessCode | null {
  const spec = BUILT_IN_CODES[code];
  if (!spec) return null;
  const now = new Date();
  return {
    code,
    tier: spec.tier,
    label: spec.label,
    generations_used: 0,
    edits_used: 0,
    generations_max: spec.generations_max,
    edits_max: spec.edits_max,
    created_at: now.toISOString(),
    expires_at: new Date(
      now.getTime() + spec.expires_days * 86_400_000,
    ).toISOString(),
    revoked: false,
    last_seen_at: null,
  };
}
