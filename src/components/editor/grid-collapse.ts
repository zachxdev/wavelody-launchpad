// Display-only re-collapse pass for the MDSL Grid view.
//
// The AST is always expanded (per Phase 3 design), but the grid should show
// runs of dot rows in their NR-compressed form so the view matches how scores
// are read in their canonical transport-layer shape.
//
// Rules (per spec §5.9 plus user direction):
// - Runs of >= 4 consecutive dot rows within a bar collapse to a single
//   <count>R marker. Runs of 1-3 stay expanded.
// - Runs do not cross bar boundaries (the | delimiter resets).
// - Dot rows are determined by isDotRow (all columns silent + no STR/HAR/SUS).
// - The collapse is purely visual; the AST is never mutated.

import type { Bar, BeatRow } from "@/lib/musicdsl";
import { isDotRow } from "./grid-format";

export interface DisplayBeatRow {
  kind: "row";
  row: BeatRow;
  rowIndexInBar: number;
}

export interface DisplayCollapsedRun {
  kind: "collapsed";
  count: number;
  // The 0-based indices in bar.rows that this run covers, inclusive.
  startIdx: number;
  endIdx: number;
  // The bar this run lives in.
  bar: number;
  // Whether the LAST row of the run carries the bar delimiter (i.e. the run
  // ends a bar). When true, the collapsed token is rendered as `<N>R |` to
  // mirror the spec §5.9 transport form.
  endsBar: boolean;
}

export type DisplayRow = DisplayBeatRow | DisplayCollapsedRun;

export const COLLAPSE_THRESHOLD = 4;

export function collapseBar(
  bar: Bar,
  voices: string[],
  expanded: ReadonlySet<string>,
): DisplayRow[] {
  const out: DisplayRow[] = [];
  const rows = bar.rows;
  let i = 0;
  while (i < rows.length) {
    if (!isDotRow(rows[i], voices)) {
      out.push({ kind: "row", row: rows[i], rowIndexInBar: i });
      i += 1;
      continue;
    }
    // Walk a run of dot rows.
    let j = i;
    while (j < rows.length && isDotRow(rows[j], voices)) j += 1;
    const runLen = j - i;
    const key = collapseKey(bar.index, i);
    const shouldCollapse = runLen >= COLLAPSE_THRESHOLD && !expanded.has(key);
    if (shouldCollapse) {
      out.push({
        kind: "collapsed",
        count: runLen,
        startIdx: i,
        endIdx: j - 1,
        bar: bar.index,
        endsBar: rows[j - 1].endsBar,
      });
    } else {
      for (let k = i; k < j; k += 1) {
        out.push({ kind: "row", row: rows[k], rowIndexInBar: k });
      }
    }
    i = j;
  }
  return out;
}

// Stable key for a collapsed run, used by the MdslGrid component to track
// which runs the user has expanded interactively.
export function collapseKey(barIndex: number, startIdxInBar: number): string {
  return `${barIndex}:${startIdxInBar}`;
}
