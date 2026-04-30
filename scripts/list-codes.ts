#!/usr/bin/env tsx
// Inspect access codes in the wavelody-codes KV namespace.
//
//   npx tsx scripts/list-codes.ts                      # all codes
//   npx tsx scripts/list-codes.ts --tier reviewer      # filter by tier
//   npx tsx scripts/list-codes.ts --tier reviewer --json
//
// Tabular output is sorted by tier (reviewer → friend → public) then by
// last_seen_at (most recent first), so the rows that move during the
// Speedrun review window float to the top. Use this to track who has
// engaged with the demo and how much budget remains per code.

import { parseArgs } from "node:util";
import type { AccessCode, Tier } from "../api/types";
import { KEY_PREFIX } from "../api/types";
import { getKey, listKeys, loadConfig } from "./lib/cf-kv";

const TIERS: ReadonlySet<Tier> = new Set<Tier>([
  "reviewer",
  "friend",
  "public",
]);

const TIER_ORDER: Record<Tier, number> = {
  reviewer: 0,
  friend: 1,
  public: 2,
};

interface ParsedArgs {
  tier: Tier | undefined;
  json: boolean;
}

function parseCli(): ParsedArgs {
  const { values } = parseArgs({
    options: {
      tier: { type: "string" },
      json: { type: "boolean", default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  let tier: Tier | undefined;
  if (values.tier) {
    if (!TIERS.has(values.tier as Tier)) {
      throw new Error(
        `Unknown tier "${values.tier}". Use reviewer | friend | public.`,
      );
    }
    tier = values.tier as Tier;
  }
  return { tier, json: values.json ?? false };
}

function formatRow(c: AccessCode): string {
  const cols = [
    c.code,
    c.tier,
    `${c.generations_used}/${c.generations_max}g`,
    `${c.edits_used}/${c.edits_max}e`,
    c.expires_at.slice(0, 10),
    c.last_seen_at ? c.last_seen_at.slice(0, 19) + "Z" : "never",
    c.revoked ? "REVOKED" : "",
    c.label || "",
  ];
  return cols.join("\t");
}

async function main(): Promise<void> {
  const args = parseCli();
  const cfg = loadConfig();

  const all = await listKeys(cfg, KEY_PREFIX.code);
  const codes: AccessCode[] = [];
  for (const k of all) {
    const raw = await getKey(cfg, k.name);
    if (!raw) continue;
    let parsed: AccessCode;
    try {
      parsed = JSON.parse(raw) as AccessCode;
    } catch {
      console.warn(`Skipping malformed record at ${k.name}`);
      continue;
    }
    if (args.tier && parsed.tier !== args.tier) continue;
    codes.push(parsed);
  }

  codes.sort((a, b) => {
    const t = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    if (t !== 0) return t;
    const aSeen = a.last_seen_at ? Date.parse(a.last_seen_at) : 0;
    const bSeen = b.last_seen_at ? Date.parse(b.last_seen_at) : 0;
    return bSeen - aSeen;
  });

  if (args.json) {
    process.stdout.write(JSON.stringify(codes, null, 2) + "\n");
    return;
  }

  process.stdout.write(
    "code\ttier\tgens\tedits\texpires\tlast_seen\tflags\tlabel\n",
  );
  for (const c of codes) {
    process.stdout.write(formatRow(c) + "\n");
  }
}

main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(msg);
  process.exit(1);
});
