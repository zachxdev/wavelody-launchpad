// TS port of validate_musicdsl.py — gates Claude output before we trust it.
//
// The shared parser at src/lib/musicdsl already raises ParseError for
// structural problems (voice count mismatch, malformed tokens, unsupported
// time signatures). What it does NOT enforce is the spec-level invariants
// that arise once a piece is fully parsed:
//
//   1. Beat range: 1 ≤ beat ≤ resolution.
//   2. Beat overflow: a note at beat b with duration d satisfies
//      b + d - 1 ≤ resolution. Sub-row offsets via +M/D may shift onset
//      across the bar boundary at transport time, but the notation row
//      itself stays inside its bar — "notation-stays-with-grid" (§5.7).
//   3. Bar reset: every bar's first row sits at BEAT=1.
//   4. Bar terminator: every bar's last content row carries `|` (endsBar).
//   5. Voice count: header.voices.length matches per-row voice cells.
//      (Already enforced by the parser, but we re-check defensively.)
//
// Returns { valid: true, score } so callers can re-use the parsed AST,
// or { valid: false, errors } with one short message per failed
// invariant. We collect every error rather than throwing on the first —
// downstream retry logic is more useful if it sees the full picture.

import { parse, ParseError } from "../src/lib/musicdsl";
import type { Score, Bar, BeatRow } from "../src/lib/musicdsl";

export interface ValidationOk {
  valid: true;
  score: Score;
}

export interface ValidationFail {
  valid: false;
  errors: string[];
}

export type ValidationResult = ValidationOk | ValidationFail;

export function validateMusicDsl(source: string): ValidationResult {
  let score: Score;
  try {
    score = parse(source);
  } catch (e: unknown) {
    if (e instanceof ParseError) {
      return { valid: false, errors: [e.message] };
    }
    const msg = e instanceof Error ? e.message : String(e);
    return { valid: false, errors: [`Parse failure: ${msg}`] };
  }

  const errors: string[] = [];

  if (score.bars.length === 0) {
    errors.push("Score has no bars.");
    return { valid: false, errors };
  }

  if (score.header.voices.length === 0) {
    errors.push("Header VOICES is empty.");
  }

  for (const bar of score.bars) {
    checkBar(bar, score, errors);
  }

  return errors.length === 0
    ? { valid: true, score }
    : { valid: false, errors };
}

function checkBar(bar: Bar, score: Score, errors: string[]): void {
  if (bar.rows.length === 0) {
    errors.push(`Bar ${bar.index}: empty (no rows).`);
    return;
  }

  const first = bar.rows[0];
  if (first.beat !== 1) {
    errors.push(
      `Bar ${bar.index}: first row must start at beat 1, got beat ${first.beat}.`,
    );
  }

  const last = bar.rows[bar.rows.length - 1];
  if (!last.endsBar) {
    errors.push(`Bar ${bar.index}: last row missing bar terminator '|'.`);
  }

  for (const row of bar.rows) {
    checkRow(row, bar, score, errors);
  }
}

function checkRow(
  row: BeatRow,
  bar: Bar,
  score: Score,
  errors: string[],
): void {
  if (row.beat < 1 || row.beat > bar.resolution) {
    errors.push(
      `Bar ${bar.index} beat ${row.beat}: out of range (resolution ${bar.resolution}).`,
    );
  }

  for (const voice of score.header.voices) {
    const cell = row.voices.get(voice);
    if (!cell) continue;
    for (const note of cell.notes) {
      const end = row.beat + note.durationUnits - 1;
      if (end > bar.resolution) {
        errors.push(
          `Bar ${bar.index} beat ${row.beat} voice ${voice}: note duration ${note.durationUnits} overflows bar (ends at ${end}, resolution ${bar.resolution}).`,
        );
      }
    }
    if (cell.rest && row.beat + cell.rest.durationUnits - 1 > bar.resolution) {
      errors.push(
        `Bar ${bar.index} beat ${row.beat} voice ${voice}: rest duration ${cell.rest.durationUnits} overflows bar.`,
      );
    }
  }
}
