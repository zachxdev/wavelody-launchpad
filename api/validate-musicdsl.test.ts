// @vitest-environment node
import { describe, expect, it } from "vitest";
import { validateMusicDsl } from "./validate-musicdsl";

const MIN_VALID = `# TITLE: Test
# TEMPO: 120
# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 1, -, I, -, (C4:mf:96) |
2, 1, -, V, -, (G4:mf:96) |
`;

describe("validateMusicDsl", () => {
  it("accepts a minimal well-formed score", () => {
    const result = validateMusicDsl(MIN_VALID);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.score.bars).toHaveLength(2);
    }
  });

  it("rejects a parse error and surfaces a single message", () => {
    const broken = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 1, -, -, -, (C4:mf:notanumber) |
`;
    const result = validateMusicDsl(broken);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toMatch(/duration/i);
    }
  });

  it("flags beat overflow when a note duration extends past bar end", () => {
    const overflow = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 90, -, -, -, (C4:mf:24) |
`;
    const result = validateMusicDsl(overflow);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => /overflow/i.test(e))).toBe(true);
    }
  });

  it("flags a bar that does not start at beat 1", () => {
    const noReset = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 1, -, -, -, (C4:mf:24) |
2, 5, -, -, -, (D4:mf:24) |
`;
    const result = validateMusicDsl(noReset);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some((e) => /must start at beat 1/i.test(e)),
      ).toBe(true);
    }
  });

  it("flags a bar that does not end with the '|' terminator", () => {
    const noTerm = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 1, -, -, -, (C4:mf:24)
2, 1, -, -, -, (D4:mf:24) |
`;
    const result = validateMusicDsl(noTerm);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(
        result.errors.some((e) => /missing bar terminator/i.test(e)),
      ).toBe(true);
    }
  });

  it("flags an out-of-range beat", () => {
    const oob = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: V1
1, 1, -, -, -, (C4:mf:24)
1, 200, -, -, -, (D4:mf:1) |
`;
    const result = validateMusicDsl(oob);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.some((e) => /out of range/i.test(e))).toBe(true);
    }
  });

  it("returns the parsed Score on success for callers to reuse", () => {
    const result = validateMusicDsl(MIN_VALID);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.score.header.voices).toEqual(["V1"]);
      expect(result.score.header.tempo).toBe(120);
    }
  });
});
