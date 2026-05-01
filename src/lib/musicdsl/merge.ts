// Surgical merge of an edit slice back into a current Score.
//
// /api/edit returns a MusicDSL slice covering the requested bar range;
// the model is told to leave non-target voices unchanged inside the slice
// but we don't trust that. mergeEditSlice walks the bars in the slice,
// finds the matching bars in the current Score, and replaces ONLY the
// named voice's cell on each beat row. Everything else — other voices,
// structure, harmony, sustain, beats not present in the slice — is left
// alone.
//
// If the slice contains a bar the current score doesn't, we ignore it
// (preserves the original bar count). If a slice row's beat doesn't
// match any current row, we ignore it (preserves the original
// resolution). Both are intentional: the demo lets the user move bars
// around manually rather than have an edit silently change layout.

import type { Score, Bar, BeatRow } from "./types";

export function mergeEditSlice(
  current: Score,
  slice: Score,
  voiceId: string,
): Score {
  if (!current.header.voices.includes(voiceId)) return current;

  const sliceByBar = new Map<number, Bar>();
  for (const b of slice.bars) sliceByBar.set(b.index, b);

  const newBars = current.bars.map((bar) => {
    const sliceBar = sliceByBar.get(bar.index);
    if (!sliceBar) return bar;

    const sliceRowsByBeat = new Map<number, BeatRow>();
    for (const r of sliceBar.rows) sliceRowsByBeat.set(r.beat, r);

    const newRows = bar.rows.map((row) => {
      const sliceRow = sliceRowsByBeat.get(row.beat);
      if (!sliceRow) return row;
      const sliceCell = sliceRow.voices.get(voiceId);
      if (!sliceCell) return row;
      const nextVoices = new Map(row.voices);
      nextVoices.set(voiceId, sliceCell);
      return { ...row, voices: nextVoices };
    });

    return { ...bar, rows: newRows };
  });

  return { ...current, bars: newBars };
}
