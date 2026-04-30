import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@/lib/musicdsl";
import {
  COLLAPSE_THRESHOLD,
  collapseBar,
  collapseKey,
} from "./grid-collapse";

const FIXTURE_DIR = join(__dirname, "../../lib/musicdsl/__fixtures__");
const readFixture = (name: string) =>
  readFileSync(join(FIXTURE_DIR, `${name}.mdsl`), "utf-8");

describe("collapseBar (NR re-collapse for grid display)", () => {
  const score = parse(readFixture("basic_4-4"));
  const voices = score.header.voices;

  it("collapses long dot runs in basic_4-4 bar 1 by default", () => {
    // Bar 1 has notes at beats 1, 25, 49, 73 with 23 dot rows between each.
    const display = collapseBar(score.bars[0], voices, new Set());
    // Expect 4 note rows + 4 collapsed runs of 23 each.
    const collapsed = display.filter((d) => d.kind === "collapsed");
    expect(collapsed.length).toBe(4);
    for (const d of collapsed) {
      if (d.kind === "collapsed") expect(d.count).toBe(23);
    }
    const rowEntries = display.filter((d) => d.kind === "row");
    expect(rowEntries.length).toBe(4);
  });

  it("marks endsBar on the run that ends the bar", () => {
    const display = collapseBar(score.bars[0], voices, new Set());
    const last = display[display.length - 1];
    expect(last.kind).toBe("collapsed");
    if (last.kind === "collapsed") expect(last.endsBar).toBe(true);
    const second = display[display.length - 2];
    expect(second.kind).toBe("row");
  });

  it("expands runs the user has marked expanded", () => {
    const expanded = new Set([collapseKey(1, 1)]); // expand the 23-dot run after bar 1 beat 1
    const display = collapseBar(score.bars[0], voices, expanded);
    // Now: 1 note row at beat 1, 23 expanded dots, then 3 (collapsed run + note + ...).
    const counts = display.reduce(
      (a, d) => ({ row: a.row + (d.kind === "row" ? 1 : 0), col: a.col + (d.kind === "collapsed" ? 1 : 0) }),
      { row: 0, col: 0 },
    );
    expect(counts.row).toBe(4 + 23);
    expect(counts.col).toBe(3);
  });

  it("does not collapse runs shorter than the threshold", () => {
    // Synthesize a bar with a 3-dot run by parsing a tiny fixture.
    const tiny = parse(`# VOICES: LH\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, (C4:mf:24)\n1, 2, .\n1, 3, .\n1, 4, .\n1, 5, -, -, -, (D4:mf:24) |\n`);
    const display = collapseBar(tiny.bars[0], tiny.header.voices, new Set());
    expect(display.every((d) => d.kind === "row")).toBe(true);
    expect(display.length).toBe(5);
  });

  it("collapses exactly at the threshold", () => {
    const fourDots = parse(`# VOICES: LH\nBAR, BEAT, STR, HAR, SUS, LH\n1, 1, -, -, -, (C4:mf:24)\n1, 2, .\n1, 3, .\n1, 4, .\n1, 5, .\n1, 6, -, -, -, (D4:mf:24) |\n`);
    const display = collapseBar(fourDots.bars[0], fourDots.header.voices, new Set());
    const collapsed = display.filter((d) => d.kind === "collapsed");
    expect(collapsed.length).toBe(1);
    if (collapsed[0].kind === "collapsed") {
      expect(collapsed[0].count).toBe(COLLAPSE_THRESHOLD);
    }
  });

  it("does not merge runs across bar boundaries (called per-bar)", () => {
    // 2 bars, each with a 23-dot tail run. Each bar collapses independently.
    const dBars = collapseBar(score.bars[0], voices, new Set()).filter((d) => d.kind === "collapsed");
    const dBars2 = collapseBar(score.bars[1], voices, new Set()).filter((d) => d.kind === "collapsed");
    expect(dBars.length).toBe(4);
    expect(dBars2.length).toBe(4);
  });

  it("collapseKey is stable per (bar, startIdx)", () => {
    expect(collapseKey(1, 1)).toBe("1:1");
    expect(collapseKey(2, 50)).toBe("2:50");
  });
});
