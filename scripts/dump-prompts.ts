// dump-prompts.ts — emits the TS-side cached system prompt as a
// golden file. Run via `npx tsx scripts/dump-prompts.ts` to regenerate
// the goldens under ../MusicDSL/performer_v0/tests/fixtures/ when the
// Worker's system-prompts.ts changes. The Python port at
// performer_v0/orchestration/system_prompts.py has byte-parity tests
// against this golden — drift will bust Anthropic's prompt cache.

import * as fs from "node:fs";
import * as path from "node:path";

import { buildComposeSystem, buildEditSystem } from "../api/system-prompts";

const out = "../MusicDSL/performer_v0/tests/fixtures";
fs.mkdirSync(out, { recursive: true });

function dump(name: string, text: string): void {
  // Force LF on disk so the Python golden tests don't see CRLF on Windows.
  const normalized = text.replace(/\r\n/g, "\n");
  fs.writeFileSync(path.join(out, name), normalized, { encoding: "utf-8" });
  console.log(`  ${name}: ${normalized.length} chars`);
}

console.log("compose piano_trio");
const cpt = buildComposeSystem("piano_trio");
dump("compose_piano_trio_cached.txt", cpt[0].text);
dump("compose_piano_trio_tail.txt", cpt[1].text);

console.log("compose string_quartet");
const csq = buildComposeSystem("string_quartet");
dump("compose_string_quartet_cached.txt", csq[0].text);
dump("compose_string_quartet_tail.txt", csq[1].text);

console.log("edit piano_trio (V, bars 3-5, MOCK_SCORE)");
const ept = buildEditSystem("piano_trio", "<MOCK_SCORE>", "V", 3, 5);
dump("edit_piano_trio_cached.txt", ept[0].text);
dump("edit_piano_trio_tail.txt", ept[1].text);

console.log("done");
