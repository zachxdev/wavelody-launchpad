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
    [{ numerator: 9, denominator: 8 }, 288],
    [{ numerator: 5, denominator: 4 }, 480],
  ] as const)("resolution(%o) = %i", (ts, expected) => {
    expect(computeResolution(ts)).toBe(expected);
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
