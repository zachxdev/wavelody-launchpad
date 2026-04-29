import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { extractVoices } from "./extractVoices";
import { parse } from "./parse";

const FIXTURE_DIR = join(__dirname, "__fixtures__");
const readFixture = (name: string) =>
  readFileSync(join(FIXTURE_DIR, `${name}.mdsl`), "utf-8");

describe("extractVoices: basic 4/4", () => {
  const score = parse(readFixture("basic_4-4"));
  const streams = extractVoices(score);

  it("returns one stream per declared voice in header order", () => {
    expect(streams.map((s) => s.voice)).toEqual(["LH", "RH"]);
  });

  it("LH has one event per bar (whole-note hits at beat 1)", () => {
    const lh = streams.find((s) => s.voice === "LH");
    expect(lh?.events).toHaveLength(2);
    expect(lh?.events[0].bar).toBe(1);
    expect(lh?.events[0].beat).toBe(1);
    expect(lh?.events[0].absolutePosition).toBe(0);
    expect(lh?.events[1].bar).toBe(2);
    expect(lh?.events[1].beat).toBe(1);
    expect(lh?.events[1].absolutePosition).toBe(96);
  });

  it("RH has four events per bar (chord hits at beats 1, 25, 49, 73)", () => {
    const rh = streams.find((s) => s.voice === "RH");
    expect(rh?.events.map((e) => e.beat)).toEqual([1, 25, 49, 73, 1, 25, 49, 73]);
    expect(rh?.events.map((e) => e.absolutePosition)).toEqual([
      0, 24, 48, 72, 96, 120, 144, 168,
    ]);
  });
});

describe("extractVoices: with_sustain fixture", () => {
  const score = parse(readFixture("with_sustain"));
  const streams = extractVoices(score);

  it("captures the sustain flag on Ab3", () => {
    const lh = streams.find((s) => s.voice === "LH");
    const ab3 = lh?.events[0];
    expect(ab3?.note.sustain).toBe(true);
    expect(ab3?.note.pitches[0]).toEqual({ step: "A", alter: -1, octave: 3, midi: 56 });
  });

  it("non-sustaining notes have sustain=false", () => {
    const rh = streams.find((s) => s.voice === "RH");
    expect(rh?.events.every((e) => e.note.sustain === false)).toBe(true);
  });

  it("SUS column tracks Ab3 ringing at bar 2 beat 1", () => {
    const bar2row1 = score.bars[1].rows[0];
    expect(bar2row1.sustain).toHaveLength(1);
    expect(bar2row1.sustain[0].pitches[0].midi).toBe(56);
    expect(bar2row1.sustain[0].dynamic).toBe("p");
  });
});
