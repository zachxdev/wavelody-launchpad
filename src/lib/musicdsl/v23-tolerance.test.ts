// Phase 8.5z Group 2B: TS player tolerance for MusicDSL v2.3.
//
// The contract: a score with the full v2.3 token surface must parse
// into a valid Score AST that the audio synth can consume without
// crashing. Per-feature audio realization (technique filters,
// articulation pitch envelopes) is deferred; this test pins the
// crash-resistance contract.

import { describe, expect, it } from "vitest";
import { parse } from "./parse";

describe("v2.3 tolerance — synth-input contract", () => {
  const wrap = (rows: string[]) =>
    `# TITLE: t\n# TEMPO: 60\n# TIME: 4/4\n# RESOLUTION: 96\n# VOICES: V\nBAR, BEAT, STR, HAR, SUS, V\n${rows.join("\n")}\n`;

  it("kitchen-sink score with every v2.3 feature parses cleanly", () => {
    const score = parse(
      wrap([
        // §5.10 source + waypoints + arrival
        "1, 1, -, I, -, (C4:mf:48)",
        "1, 24, -, -, -, QEb4",
        "1, 36, -, -, -, QF4:mp",
        "1, 48, -, V, -, q(G4:mf:48) |",
        // §5.11 technique letters in voice cells (sticky state markers)
        "2, 1, -, I, -, P",
        "2, 12, -, -, -, (C4:mp:24)",
        "2, 36, -, -, -, T",
        "2, 48, -, -, -, (E4:mp:48) |",
        // §5.11 brass mute suffix + concatenated letters
        "3, 1, -, I, -, Ms",
        "3, 12, -, -, -, LT",
        "3, 24, -, -, -, (G4:f:72) |",
        // §5.4.1 expanded articulation catalog including stacked
        "4, 1, -, I, -, (C5:f:24.accent)",
        "4, 25, -, -, -, (D5:f:24.tenuto.legato)",
        "4, 49, -, -, -, (E5:mf:24.flutter)",
        "4, 73, -, -, -, (F5:p:24.scoop) |",
      ]),
    );

    // Score parses, has 4 bars, with notes recovered cleanly.
    expect(score.bars).toHaveLength(4);

    // Every paren-bound note in the score reaches the AST.
    const allNotes = score.bars.flatMap((bar) =>
      bar.rows.flatMap((row) =>
        Array.from(row.voices.values()).flatMap((v) => v.notes),
      ),
    );
    // Source C4, q-arrival G4, then C4, E4, G4 in bar 3, then C5/D5/E5/F5
    // in bar 4 = 9 notes total (Q waypoints don't produce note tokens).
    expect(allNotes.length).toBeGreaterThanOrEqual(9);

    // The q-arrival is flagged so a future pitch-glide implementation
    // in the TS synth can pick it up.
    const arrival = allNotes.find((n) => n.articulation === "gliss_arrival");
    expect(arrival).toBeDefined();
    expect(arrival?.pitches[0].step).toBe("G");
  });

  it("technique letters interleaved with notes do not break note recovery", () => {
    const score = parse(
      wrap([
        "1, 1, -, I, -, P(C4:mf:24)",
        "1, 25, -, -, -, T(D4:mf:24)",
        "1, 49, -, -, -, O(E4:mf:24)",
        "1, 73, -, -, -, (F4:mf:24) |",
      ]),
    );
    const notes = score.bars[0].rows.flatMap((row) =>
      Array.from(row.voices.values()).flatMap((v) => v.notes),
    );
    // All four notes recovered; the technique-letter prefixes were
    // consumed and the (pitch:dyn:dur) bodies parsed normally.
    expect(notes).toHaveLength(4);
    expect(notes.map((n) => n.pitches[0].step)).toEqual(["C", "D", "E", "F"]);
  });
});
