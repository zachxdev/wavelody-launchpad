import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@/lib/musicdsl";
import {
  formatHarCell,
  formatRowLabel,
  formatStrCell,
  formatSusCell,
  formatVoiceCell,
  isDotRow,
} from "./grid-format";

const FIXTURE_DIR = join(__dirname, "../../lib/musicdsl/__fixtures__");
const readFixture = (name: string) =>
  readFileSync(join(FIXTURE_DIR, `${name}.mdsl`), "utf-8");

describe("grid-format", () => {
  const score = parse(readFixture("basic_4-4"));
  const voices = score.header.voices;

  it("formatRowLabel emits BAR.BEAT", () => {
    expect(formatRowLabel(1, 1)).toBe("1.1");
    expect(formatRowLabel(2, 96)).toBe("2.96");
  });

  it("formatStrCell emits the structure marker or '-'", () => {
    expect(formatStrCell(score.bars[0].rows[0])).toBe("<SECTION:A>");
    expect(formatStrCell(score.bars[0].rows[1])).toBe("-");
  });

  it("formatHarCell emits the harmony or '-'", () => {
    expect(formatHarCell(score.bars[0].rows[0])).toBe("I");
    expect(formatHarCell(score.bars[0].rows[1])).toBe("-");
  });

  it("formatSusCell emits '-' for empty sustain", () => {
    expect(formatSusCell(score.bars[0].rows[0])).toBe("-");
  });

  it("formatVoiceCell emits the canonical token text", () => {
    const row = score.bars[0].rows[0];
    expect(formatVoiceCell(row, "LH")).toBe("(C3:mf:96)");
    expect(formatVoiceCell(row, "RH")).toBe("(E4,G4,C5:mf:24)");
  });

  it("formatVoiceCell emits '-' for silent cells", () => {
    expect(formatVoiceCell(score.bars[0].rows[1], "LH")).toBe("-");
  });

  it("isDotRow detects fully empty rows", () => {
    expect(isDotRow(score.bars[0].rows[0], voices)).toBe(false); // has notes
    expect(isDotRow(score.bars[0].rows[1], voices)).toBe(true); // dot row
  });

  it("formatVoiceCell preserves chord, sustain, and offset shape", () => {
    const sustained = parse(readFixture("with_sustain"));
    const row1 = sustained.bars[0].rows[0];
    expect(formatVoiceCell(row1, "LH")).toBe("(Ab3:p:96s)");
    const offsets = parse(readFixture("with_offsets"));
    const row73 = offsets.bars[0].rows[72];
    expect(formatVoiceCell(row73, "RH")).toBe("(E4:mf:3)+3/7");
  });

  it("formatVoiceCell preserves curve tokens after notes", () => {
    const curves = parse(readFixture("with_curves"));
    const row = curves.bars[0].rows[0];
    expect(formatVoiceCell(row, "RH")).toBe("(D5:f:96#m)J0.3Y0.5");
  });
});
