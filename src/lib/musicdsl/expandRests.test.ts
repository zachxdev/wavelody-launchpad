import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expandRests } from "./expandRests";
import { parse } from "./parse";
import { ParseError } from "./types";

const FIXTURE_DIR = join(__dirname, "__fixtures__");
const readFixture = (name: string) =>
  readFileSync(join(FIXTURE_DIR, `${name}.mdsl`), "utf-8");

describe("expandRests: text-level transforms", () => {
  it("expands a simple NR run after a bar/beat anchor", () => {
    const input = `1, 31, -, -, -, -, (F5:mp:19)\n3R\n1, 35, -, -, -, -, (G5:mp:19)\n`;
    const out = expandRests(input);
    expect(out.split("\n")).toEqual([
      "1, 31, -, -, -, -, (F5:mp:19)",
      "1, 32, .",
      "1, 33, .",
      "1, 34, .",
      "1, 35, -, -, -, -, (G5:mp:19)",
      "",
    ]);
  });

  it("expands an NR run that ends a bar", () => {
    const input = `1, 94, -, -, -, -, (C4:mf:6)\n2R |\n2, 1, -, I, -, -, -\n`;
    const out = expandRests(input);
    expect(out.split("\n")).toEqual([
      "1, 94, -, -, -, -, (C4:mf:6)",
      "1, 95, .",
      "1, 96, . |",
      "2, 1, -, I, -, -, -",
      "",
    ]);
  });

  it("does not touch explicit-duration rests (R:24)", () => {
    const input = `1, 1, -, -, -, R:24, -\n`;
    expect(expandRests(input)).toBe(input);
  });

  it("rejects NR with count < 2", () => {
    expect(() => expandRests(`1, 1, -, -, -, -, -\n1R\n`)).toThrow(ParseError);
  });

  it("rejects NR before any beat row", () => {
    expect(() => expandRests(`# TITLE: x\n5R\n`)).toThrow(ParseError);
  });

  it("preserves headers and schema row verbatim", () => {
    const input = `# TIME: 4/4\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, -\n2R\n1, 4, -, -, -, -\n`;
    const out = expandRests(input);
    const lines = out.split("\n");
    expect(lines[0]).toBe("# TIME: 4/4");
    expect(lines[1]).toBe("BAR, BEAT, STR, HAR, SUS, LH");
  });
});

describe("parse: nr_compressed fixture", () => {
  const text = readFixture("nr_compressed");
  const score = parse(text);

  it("expands NR runs into full bars", () => {
    expect(score.bars).toHaveLength(2);
    for (const bar of score.bars) {
      expect(bar.rows).toHaveLength(96);
    }
  });

  it("places notes at the correct beat positions after expansion", () => {
    const bar1 = score.bars[0];
    expect(bar1.rows[0].voices.get("LH")?.notes[0]?.pitches[0].midi).toBe(48);
    expect(bar1.rows[49].voices.get("RH")?.notes[0]?.pitches[0].midi).toBe(67); // G4 at beat 50
    expect(bar1.rows[95].endsBar).toBe(true);
    const bar2 = score.bars[1];
    expect(bar2.rows[0].voices.get("LH")?.notes[0]?.pitches[0].midi).toBe(43); // G2
    expect(bar2.rows[95].endsBar).toBe(true);
  });

  it("expanded dot rows are silent", () => {
    const bar1 = score.bars[0];
    for (let i = 1; i <= 48; i += 1) {
      const row = bar1.rows[i];
      expect(row.voices.get("LH")?.silent).toBe(true);
      expect(row.voices.get("RH")?.silent).toBe(true);
    }
  });
});
