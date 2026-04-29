import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expandRests } from "./expandRests";
import { parse } from "./parse";
import { serialize } from "./serialize";

const FIXTURE_DIR = join(__dirname, "__fixtures__");
const readFixture = (name: string) =>
  readFileSync(join(FIXTURE_DIR, `${name}.mdsl`), "utf-8");

function canonicalize(text: string): string {
  // Normalize whitespace: trim each line, collapse runs of spaces, drop trailing newlines, then re-add one.
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l !== "")
    .join("\n")
    .concat("\n");
}

describe("serialize: round-trip basic 4/4", () => {
  const original = readFixture("basic_4-4");
  const score = parse(original);
  const out = serialize(score);

  it("produces text equal to input modulo whitespace", () => {
    expect(canonicalize(out)).toBe(canonicalize(original));
  });

  it("re-parses identically (parse(serialize(s)) === parse(s))", () => {
    const reparsed = parse(out);
    expect(reparsed.bars).toHaveLength(score.bars.length);
    for (let b = 0; b < score.bars.length; b += 1) {
      const a = score.bars[b];
      const c = reparsed.bars[b];
      expect(c.index).toBe(a.index);
      expect(c.resolution).toBe(a.resolution);
      expect(c.rows.length).toBe(a.rows.length);
      for (let r = 0; r < a.rows.length; r += 1) {
        expect(c.rows[r].bar).toBe(a.rows[r].bar);
        expect(c.rows[r].beat).toBe(a.rows[r].beat);
        expect(c.rows[r].endsBar).toBe(a.rows[r].endsBar);
      }
    }
  });

  it("is idempotent across two serialize cycles", () => {
    const second = serialize(parse(out));
    expect(canonicalize(second)).toBe(canonicalize(out));
  });
});

describe("serialize: round-trip with_offsets", () => {
  // Fixture uses NR for compactness; serialize emits expanded form (re-compression
  // is out of scope per §5.9), so we compare against expandRests(original).
  const original = readFixture("with_offsets");
  const out = serialize(parse(original));

  it("matches expanded input modulo whitespace", () => {
    expect(canonicalize(out)).toBe(canonicalize(expandRests(original)));
  });

  it("preserves offset suffixes verbatim", () => {
    expect(out).toContain("(B4:p:2)-1/2");
    expect(out).toContain("(C4:mf:24)+1/2");
    expect(out).toContain("(D4:mp:24)~1/3");
    expect(out).toContain("(E4:mf:3)+3/7");
  });
});

describe("serialize: round-trip with_curves", () => {
  const original = readFixture("with_curves");
  const out = serialize(parse(original));

  it("matches expanded input modulo whitespace", () => {
    expect(canonicalize(out)).toBe(canonicalize(expandRests(original)));
  });

  it("preserves curve token forms verbatim", () => {
    expect(out).toContain("(G2:f:96#d)");
    expect(out).toContain("(D5:f:96#m)J0.3Y0.5");
    expect(out).toContain("Y#d:0.4");
    expect(out).toContain("y#d");
    expect(out).toContain("j#m:0");
  });
});

describe("serialize: structural fidelity", () => {
  const score = parse(readFixture("basic_4-4"));
  const out = serialize(score);

  it("emits bar 1 line 1 with chord intact", () => {
    const lines = out.split("\n");
    const firstRow = lines.find((l) => l.startsWith("1, 1,"));
    expect(firstRow).toBeDefined();
    expect(firstRow).toContain("(C3:mf:96)");
    expect(firstRow).toContain("(E4,G4,C5:mf:24)");
    expect(firstRow).toContain("<SECTION:A>");
  });

  it("ends each bar with the | delimiter", () => {
    const lines = out.split("\n").filter((l) => l.includes("|"));
    expect(lines.length).toBe(2);
    expect(lines[0]).toMatch(/^1, 96, .* \|$/);
    expect(lines[1]).toMatch(/^2, 96, .* \|$/);
  });
});
