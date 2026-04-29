// NR rest expansion. Per spec §5.9, MusicDSL files MAY use NR-compressed runs of
// dot-shorthand rows: `<N>R` for N consecutive empty rows, `<N>R |` for a run
// ending a bar (last row carries the bar delimiter). This module expands those
// runs back to canonical dot rows so the AST always holds expanded form.
//
// Disambiguation: explicit-duration rests have a colon (`R:24`); NR runs have a
// leading digit and no colon (`10R`).

import { ParseError } from "./types";

const NR_TOKEN = /^(\d+)R(\s*\|)?$/;

interface NRMatch {
  count: number;
  endsBar: boolean;
}

export function matchNRToken(line: string): NRMatch | null {
  const m = NR_TOKEN.exec(line.trim());
  if (!m) return null;
  return { count: parseInt(m[1], 10), endsBar: m[2] !== undefined };
}

interface ExpansionContext {
  bar: number;
  beat: number;
}

function readBarBeat(line: string): { bar: number; beat: number } | null {
  const m = /^(\d+)\s*,\s*(\d+)/.exec(line.trim());
  if (!m) return null;
  return { bar: parseInt(m[1], 10), beat: parseInt(m[2], 10) };
}

export function expandRests(source: string): string {
  const lines = source.split(/\r?\n/);
  const out: string[] = [];
  const ctx: ExpansionContext = { bar: 0, beat: 0 };
  let firstRowSeen = false;

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      out.push(raw);
      continue;
    }

    const nr = matchNRToken(trimmed);
    if (nr !== null) {
      if (nr.count < 2) {
        throw new ParseError(`NR count must be >= 2, got "${nr.count}R"`, i + 1, 1);
      }
      if (!firstRowSeen) {
        throw new ParseError(`NR token cannot appear before any beat row`, i + 1, 1);
      }
      for (let k = 0; k < nr.count; k += 1) {
        ctx.beat += 1;
        const last = k === nr.count - 1;
        const delim = last && nr.endsBar ? " |" : "";
        out.push(`${ctx.bar}, ${ctx.beat}, .${delim}`);
      }
      if (nr.endsBar) {
        ctx.bar += 1;
        ctx.beat = 0;
      }
      continue;
    }

    const bb = readBarBeat(trimmed);
    if (bb !== null) {
      ctx.bar = bb.bar;
      ctx.beat = bb.beat;
      firstRowSeen = true;
    }
    // Track bar delimiter for next NR's bar context.
    if (trimmed.endsWith("|")) {
      ctx.bar += 1;
      ctx.beat = 0;
    }
    out.push(raw);
  }

  return out.join("\n");
}
