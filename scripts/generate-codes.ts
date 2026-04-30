#!/usr/bin/env tsx
// Bulk-create access codes in the wavelody-codes KV namespace.
//
// Single code (named partner / friend):
//   npx tsx scripts/generate-codes.ts --tier reviewer \
//     --suffix andrew-c --label "Andrew Chen, a16z"
//   npx tsx scripts/generate-codes.ts --tier friend \
//     --suffix jakob --label "Jakob Sandvik"
//
// Bulk (anonymous public codes):
//   npx tsx scripts/generate-codes.ts --bulk public --count 20
//
// Output: tab-separated lines (code\ttier\tlabel\texpires_at) so the result
// pastes cleanly into a Notion table or a spreadsheet.

import { parseArgs } from "node:util";
import type { AccessCode, Tier } from "../api/types";
import { ACCESS_CODE_REGEX, KEY_PREFIX, TIER_CONFIG } from "../api/types";
import { loadConfig, putKey } from "./lib/cf-kv";

const TIERS: ReadonlySet<Tier> = new Set<Tier>([
  "reviewer",
  "friend",
  "public",
]);

const PREFIX_FOR_TIER: Record<Tier, string> = {
  reviewer: "speedrun-",
  friend: "friend-",
  public: "pub-",
};

// Avoids visually ambiguous chars (1/l, 0/O) for codes shared verbally.
const PUBLIC_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const PUBLIC_SUFFIX_LEN = 6;

function randomSuffix(): string {
  const bytes = new Uint8Array(PUBLIC_SUFFIX_LEN);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < PUBLIC_SUFFIX_LEN; i++) {
    out += PUBLIC_ALPHABET[bytes[i] % PUBLIC_ALPHABET.length];
  }
  return out;
}

function buildAccessCode(tier: Tier, suffix: string, label: string): AccessCode {
  const code = (PREFIX_FOR_TIER[tier] + suffix).toLowerCase();
  if (!ACCESS_CODE_REGEX.test(code)) {
    throw new Error(
      `Generated code "${code}" doesn't match ${ACCESS_CODE_REGEX} — adjust --suffix.`,
    );
  }
  const cfg = TIER_CONFIG[tier];
  const now = new Date();
  return {
    code,
    tier,
    label,
    generations_used: 0,
    edits_used: 0,
    generations_max: cfg.generations_max,
    edits_max: cfg.edits_max,
    created_at: now.toISOString(),
    expires_at: new Date(
      now.getTime() + cfg.expires_days * 86_400_000,
    ).toISOString(),
    revoked: false,
    last_seen_at: null,
  };
}

interface ParsedArgs {
  tier: Tier | undefined;
  suffix: string | undefined;
  label: string;
  bulk: Tier | undefined;
  count: number;
}

function parseCli(): ParsedArgs {
  const { values } = parseArgs({
    options: {
      tier: { type: "string" },
      suffix: { type: "string" },
      label: { type: "string", default: "" },
      bulk: { type: "string" },
      count: { type: "string" },
    },
    strict: true,
    allowPositionals: false,
  });

  function asTier(v: string | undefined): Tier | undefined {
    if (!v) return undefined;
    if (!TIERS.has(v as Tier)) {
      throw new Error(`Unknown tier "${v}". Use reviewer | friend | public.`);
    }
    return v as Tier;
  }

  return {
    tier: asTier(values.tier),
    suffix: values.suffix,
    label: values.label ?? "",
    bulk: asTier(values.bulk),
    count: values.count ? Number(values.count) : 1,
  };
}

async function main(): Promise<void> {
  const args = parseCli();
  const cfg = loadConfig();

  const codes: AccessCode[] = [];
  if (args.bulk) {
    if (args.count < 1 || !Number.isFinite(args.count)) {
      throw new Error("--count must be a positive integer.");
    }
    for (let i = 0; i < args.count; i++) {
      codes.push(buildAccessCode(args.bulk, randomSuffix(), ""));
    }
  } else {
    if (!args.tier || !args.suffix) {
      throw new Error(
        "Need --tier <reviewer|friend|public> and --suffix <text> (or --bulk <tier> --count <n>).",
      );
    }
    codes.push(buildAccessCode(args.tier, args.suffix, args.label));
  }

  for (const c of codes) {
    await putKey(cfg, KEY_PREFIX.code + c.code, JSON.stringify(c));
    process.stdout.write(
      `${c.code}\t${c.tier}\t${c.label || "(no label)"}\t${c.expires_at}\n`,
    );
  }
}

main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(msg);
  process.exit(1);
});
