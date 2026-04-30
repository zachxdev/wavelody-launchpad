import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { computeResolution, parse, pitchToMidi } from "./parse";
import { ParseError } from "./types";

const FIXTURE_DIR = join(__dirname, "__fixtures__");
const readFixture = (name: string) =>
  readFileSync(join(FIXTURE_DIR, `${name}.mdsl`), "utf-8");

describe("pitchToMidi", () => {
  it.each([
    ["C", 0, 4, 60],
    ["A", 0, 4, 69],
    ["C", 1, 4, 61],
    ["D", -1, 4, 61],
    ["G", 1, 5, 80],
    ["B", 0, 0, 23],
    ["C", 0, -1, 0],
    ["G", 0, 9, 127],
    ["F", -1, 4, 64],
    ["E", 1, 3, 53],
  ] as const)("pitch %s alter=%i octave=%i → midi %i", (step, alter, oct, midi) => {
    expect(pitchToMidi(step, alter, oct)).toBe(midi);
  });
});

describe("computeResolution", () => {
  it.each([
    [{ numerator: 4, denominator: 4 }, 96],
    [{ numerator: 3, denominator: 4 }, 96],
    [{ numerator: 2, denominator: 4 }, 96],
    [{ numerator: 6, denominator: 8 }, 96],
    [{ numerator: 12, denominator: 8 }, 96],
    [{ numerator: 9, denominator: 8 }, 144],
    [{ numerator: 5, denominator: 4 }, 480],
    [{ numerator: 7, denominator: 8 }, 112],
  ] as const)("canonical resolution(%o) = %i", (ts, expected) => {
    expect(computeResolution(ts)).toBe(expected);
  });

  it("falls back to numerator*24 for unlisted x/4 meters", () => {
    expect(computeResolution({ numerator: 11, denominator: 4 })).toBe(264);
  });

  it("falls back to numerator*16 for unlisted x/8 meters", () => {
    expect(computeResolution({ numerator: 13, denominator: 8 })).toBe(208);
  });

  it("falls back to 96 floor for very small unlisted meters", () => {
    expect(computeResolution({ numerator: 1, denominator: 4 })).toBe(96);
    expect(computeResolution({ numerator: 1, denominator: 8 })).toBe(96);
  });

  it("rejects unsupported denominators", () => {
    expect(() => computeResolution({ numerator: 4, denominator: 2 })).toThrow(ParseError);
    expect(() => computeResolution({ numerator: 4, denominator: 16 })).toThrow(ParseError);
  });
});

describe("parse: basic 4/4 fixture", () => {
  const text = readFixture("basic_4-4");
  const score = parse(text);

  it("captures the header block", () => {
    expect(score.hadHeaderBlock).toBe(true);
    expect(score.hadSchemaRow).toBe(true);
    expect(score.header.tempo).toBe(120);
    expect(score.header.timeSignature).toEqual({ numerator: 4, denominator: 4 });
    expect(score.header.resolution).toBe(96);
    expect(score.header.key).toBe("C major");
    expect(score.header.instruments).toEqual(["piano"]);
    expect(score.header.voices).toEqual(["LH", "RH"]);
  });

  it("groups rows into bars with full resolution", () => {
    expect(score.bars).toHaveLength(2);
    for (const bar of score.bars) {
      expect(bar.rows).toHaveLength(96);
      expect(bar.resolution).toBe(96);
      expect(bar.timeSignature).toEqual({ numerator: 4, denominator: 4 });
    }
  });

  it("sets endsBar on the last row of each bar only", () => {
    for (const bar of score.bars) {
      for (let i = 0; i < bar.rows.length - 1; i += 1) {
        expect(bar.rows[i].endsBar).toBe(false);
      }
      expect(bar.rows[bar.rows.length - 1].endsBar).toBe(true);
    }
  });

  it("parses the LH whole note at bar 1 beat 1", () => {
    const row = score.bars[0].rows[0];
    expect(row.bar).toBe(1);
    expect(row.beat).toBe(1);
    expect(row.structure).toBe("<SECTION:A>");
    expect(row.harmony).toBe("I");
    const lh = row.voices.get("LH");
    expect(lh?.silent).toBe(false);
    expect(lh?.notes).toHaveLength(1);
    const note = lh?.notes[0];
    expect(note?.dynamic).toBe("mf");
    expect(note?.durationUnits).toBe(96);
    expect(note?.sustain).toBe(false);
    expect(note?.pitches).toHaveLength(1);
    expect(note?.pitches[0]).toEqual({ step: "C", alter: 0, octave: 3, midi: 48 });
  });

  it("parses the RH C-major chord at bar 1 beat 1", () => {
    const row = score.bars[0].rows[0];
    const rh = row.voices.get("RH");
    expect(rh?.notes).toHaveLength(1);
    const chord = rh?.notes[0];
    expect(chord?.pitches.map((p) => p.midi)).toEqual([64, 67, 72]);
  });

  it("treats dot rows as fully empty", () => {
    const row = score.bars[0].rows[1];
    expect(row.bar).toBe(1);
    expect(row.beat).toBe(2);
    expect(row.structure).toBeUndefined();
    expect(row.harmony).toBeUndefined();
    expect(row.sustain).toEqual([]);
    expect(row.voices.get("LH")?.silent).toBe(true);
    expect(row.voices.get("RH")?.silent).toBe(true);
  });
});

describe("parse: with_offsets fixture", () => {
  const score = parse(readFixture("with_offsets"));

  it("parses anticipation offset (-M/D) in RH", () => {
    const note = score.bars[0].rows[0].voices.get("RH")?.notes[0];
    expect(note?.offset).toEqual({ mode: "backward", fraction: { num: 1, den: 2 } });
  });

  it("parses forward offset (+M/D) in LH", () => {
    const note = score.bars[0].rows[24].voices.get("LH")?.notes[0];
    expect(note?.offset).toEqual({ mode: "forward", fraction: { num: 1, den: 2 } });
  });

  it("parses anchored offset (~M/D) in LH", () => {
    const note = score.bars[0].rows[48].voices.get("LH")?.notes[0];
    expect(note?.offset).toEqual({ mode: "anchored", fraction: { num: 1, den: 3 } });
  });

  it("parses septuplet offset (+3/7) in RH", () => {
    const note = score.bars[0].rows[72].voices.get("RH")?.notes[0];
    expect(note?.offset).toEqual({ mode: "forward", fraction: { num: 3, den: 7 } });
  });

  it("rejects offsets with M >= D", () => {
    const text = `# VOICES: LH\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, (C4:mf:24)+5/4 |\n`;
    expect(() => parse(text)).toThrow(/proper fraction/);
  });

  it("rejects offsets not in lowest terms", () => {
    const text = `# VOICES: LH\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, (C4:mf:24)+2/4 |\n`;
    expect(() => parse(text)).toThrow(/lowest terms/);
  });
});

describe("parse: with_curves fixture", () => {
  const score = parse(readFixture("with_curves"));

  it("attaches tags to notes", () => {
    const lh = score.bars[0].rows[0].voices.get("LH")?.notes[0];
    const rh = score.bars[0].rows[0].voices.get("RH")?.notes[0];
    expect(lh?.tag).toBe("d");
    expect(rh?.tag).toBe("m");
  });

  it("parses master J + Y waypoints in the same cell", () => {
    const rh = score.bars[0].rows[0].voices.get("RH");
    expect(rh?.curves).toEqual([
      { dim: "J", releases: false, value: 0.3, scope: "master" },
      { dim: "Y", releases: false, value: 0.5, scope: "master" },
    ]);
  });

  it("distinguishes uppercase waypoint from lowercase release via `releases`", () => {
    const lh25 = score.bars[0].rows[24].voices.get("LH");
    expect(lh25?.curves).toEqual([
      { dim: "Y", releases: false, value: 0.4, scope: "d" },
    ]);
    const rh25 = score.bars[0].rows[24].voices.get("RH");
    expect(rh25?.curves).toEqual([
      { dim: "J", releases: false, value: 1.5, scope: "master" },
    ]);
  });

  it("parses tagged release with no value (j#d)", () => {
    const lh49 = score.bars[0].rows[48].voices.get("LH");
    expect(lh49?.curves).toEqual([
      { dim: "Y", releases: true, value: null, scope: "d" },
    ]);
  });

  it("parses tagged sudden cut as j#m:0 (releases=true, value=0)", () => {
    const rh73 = score.bars[0].rows[72].voices.get("RH");
    expect(rh73?.curves).toEqual([
      { dim: "J", releases: true, value: 0, scope: "m" },
    ]);
  });

  it("parses release with explicit end value (j1.0)", () => {
    const lh96 = score.bars[0].rows[95].voices.get("LH");
    expect(lh96?.curves).toEqual([
      { dim: "J", releases: true, value: 1, scope: "master" },
    ]);
  });

  it("rejects out-of-range curve value", () => {
    const text = `# VOICES: LH\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, J3.5 |\n`;
    expect(() => parse(text)).toThrow(/out of range/);
  });

  it("rejects uppercase waypoint without value", () => {
    const text = `# VOICES: LH\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, J |\n`;
    expect(() => parse(text)).toThrow(/requires a value/);
  });
});

describe("parse: odd_meter (5/4) fixture", () => {
  const score = parse(readFixture("odd_meter"));

  it("parses TIME 5/4 and RESOLUTION 480", () => {
    expect(score.header.timeSignature).toEqual({ numerator: 5, denominator: 4 });
    expect(score.header.resolution).toBe(480);
  });

  it("expands one bar to exactly 480 rows", () => {
    expect(score.bars).toHaveLength(1);
    expect(score.bars[0].rows).toHaveLength(480);
    expect(score.bars[0].rows[479].endsBar).toBe(true);
  });

  it("places quintuplet RH pickups at the expected positions", () => {
    const positions = [1, 97, 193, 289, 385];
    for (const beat of positions) {
      const cell = score.bars[0].rows[beat - 1].voices.get("RH");
      expect(cell?.notes).toHaveLength(1);
    }
  });
});

describe("parse: anonymized fixture (v4)", () => {
  const score = parse(readFixture("anonymized"));

  it("synthesizes a default header", () => {
    expect(score.hadHeaderBlock).toBe(false);
    expect(score.hadSchemaRow).toBe(true);
    expect(score.header.tempo).toBe(120);
    expect(score.header.timeSignature).toEqual({ numerator: 4, denominator: 4 });
    expect(score.header.resolution).toBe(96);
    expect(score.header.voices).toEqual(["V1", "V2"]);
  });

  it("expands the bar to 96 rows under default 4/4", () => {
    expect(score.bars).toHaveLength(1);
    expect(score.bars[0].rows).toHaveLength(96);
    expect(score.bars[0].resolution).toBe(96);
  });
});

describe("parse: error reporting", () => {
  it("rejects unknown dynamic with line/column", () => {
    const text = `# VOICES: LH\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, (C4:zz:24) |\n`;
    try {
      parse(text);
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(ParseError);
      expect((e as ParseError).line).toBe(3);
    }
  });

  it("rejects malformed pitch", () => {
    const text = `# VOICES: LH\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, (X4:mf:24) |\n`;
    expect(() => parse(text)).toThrow(ParseError);
  });

  it("rejects mismatched column count", () => {
    const text = `# VOICES: LH, RH\nBAR, BEAT, STR, HAR, SUS, LH, RH\n1, 1, -, -, - |\n`;
    expect(() => parse(text)).toThrow(/column count/);
  });
});
