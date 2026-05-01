import { describe, expect, it } from "vitest";
import { parse } from "./parse";
import { mergeEditSlice } from "./merge";
import { serializeNote } from "./serialize";

const BASE = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: LH, RH, V, Vc
1, 1, -, I, -, (C2:f:96), (C4:mp:96), (G4:mp:96), (C3:mp:96) |
2, 1, -, V, -, (G2:f:96), (G4:mp:96), (D5:mp:96), (G3:mp:96) |
`;

const SLICE_V = `# TIME: 4/4
# RESOLUTION: 96
# VOICES: LH, RH, V, Vc
2, 1, -, V, -, (G2:f:96), (G4:mp:96), (B4:mf:96), (G3:mp:96) |
`;

describe("mergeEditSlice", () => {
  it("replaces only the target voice in the named bars", () => {
    const current = parse(BASE);
    const slice = parse(SLICE_V);
    const merged = mergeEditSlice(current, slice, "V");

    const bar1 = merged.bars[0];
    const bar2 = merged.bars[1];

    // Bar 1 unchanged.
    expect(bar1.rows[0].voices.get("V")?.notes[0].pitches[0].step).toBe("G");

    // Bar 2 V voice now plays B4 not D5.
    const v2 = bar2.rows[0].voices.get("V");
    expect(v2?.notes[0].pitches[0].step).toBe("B");
    expect(serializeNote(v2!.notes[0])).toContain("B4");

    // Bar 2 other voices preserved (LH/RH/Vc unchanged).
    const lh2 = bar2.rows[0].voices.get("LH");
    expect(lh2?.notes[0].pitches[0].step).toBe("G");
  });

  it("returns current unchanged when the voice id does not exist", () => {
    const current = parse(BASE);
    const slice = parse(SLICE_V);
    const merged = mergeEditSlice(current, slice, "Nope");
    expect(merged).toBe(current);
  });

  it("ignores slice bars not in the current score", () => {
    const current = parse(BASE);
    const slice = parse(`# TIME: 4/4
# RESOLUTION: 96
# VOICES: LH, RH, V, Vc
99, 1, -, V, -, -, -, (Eb5:mf:96), - |
`);
    const merged = mergeEditSlice(current, slice, "V");
    expect(merged.bars).toHaveLength(2);
    expect(merged.bars[0].rows[0].voices.get("V")?.notes[0].pitches[0].step).toBe(
      "G",
    );
  });
});
