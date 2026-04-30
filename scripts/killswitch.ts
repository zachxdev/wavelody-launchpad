#!/usr/bin/env tsx
// Flip the global $-ceiling killswitch on or off.
//
//   npx tsx scripts/killswitch.ts on
//   npx tsx scripts/killswitch.ts off
//   npx tsx scripts/killswitch.ts status
//
// When on, /api/generate and /api/render return 503 ("Demo paused for the
// day, back tomorrow."); /api/edit and /api/critique are unaffected (they're
// cheap by comparison).
//
// Phase 8 will wire actual cost accounting to flip this automatically; for
// now it's a manual lever you trigger when the daily RunPod / API spend
// hits the conservative ceiling ($50/day per spec).

import { KEY_PREFIX } from "../api/types";
import { deleteKey, getKey, loadConfig, putKey } from "./lib/cf-kv";

async function main(): Promise<void> {
  const action = process.argv[2];
  if (!action || !["on", "off", "status"].includes(action)) {
    console.error("Usage: tsx scripts/killswitch.ts <on|off|status>");
    process.exit(1);
  }
  const cfg = loadConfig();

  if (action === "on") {
    await putKey(cfg, KEY_PREFIX.killswitch, "1");
    console.log("Killswitch: ON — /api/generate and /api/render will 503.");
  } else if (action === "off") {
    await deleteKey(cfg, KEY_PREFIX.killswitch);
    console.log("Killswitch: OFF — write endpoints are open again.");
  } else {
    const v = await getKey(cfg, KEY_PREFIX.killswitch);
    console.log(`Killswitch: ${v === "1" ? "ON" : "OFF"}`);
  }
}

main().catch((e: unknown) => {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(msg);
  process.exit(1);
});
