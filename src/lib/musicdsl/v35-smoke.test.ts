// Phase 8.5z final smoke test — TS player parses the v35 score
// (Claude-composed kitchen-sink v2.3 prompt) without crashing.
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { parse } from "./parse";
import { validateMusicDsl } from "../../../api/validate-musicdsl";

const SCORE_PATH = "D:/GitHub/MusicDSL/smoke-v35-musicdsl.txt";

describe("v35 cross-player smoke (Phase 8.5z)", () => {
  it("TS parser loads the Claude-composed v2.3 score without crashing", () => {
    if (!existsSync(SCORE_PATH)) {
      console.log("v35 score not present; skipping");
      return;
    }
    const score = readFileSync(SCORE_PATH, "utf-8");
    // Parser does not throw on the v2.3 surface area.
    expect(() => parse(score)).not.toThrow();
    // Validator passes the score (no @, &, no unterminated Q chains).
    const result = validateMusicDsl(score);
    if (!result.valid) {
      console.log("v35 validation errors:", result.errors);
    }
    expect(result.valid).toBe(true);
  });
});
