// Grid-view text formatters. Most cell rendering reuses the per-token serializer
// helpers from musicdsl/serialize so the grid view is by-construction consistent
// with the canonical .mdsl text emitted by serialize().

import type { BeatRow } from "@/lib/musicdsl";
import {
  isRowEmpty,
  serializeSusCell,
  serializeVoiceCell,
} from "@/lib/musicdsl";

export function formatRowLabel(bar: number, beat: number): string {
  return `${bar}.${beat}`;
}

export function formatStrCell(row: BeatRow): string {
  return row.structure ?? "-";
}

export function formatHarCell(row: BeatRow): string {
  return row.harmony ?? "-";
}

export function formatSusCell(row: BeatRow): string {
  return serializeSusCell(row.sustain);
}

export function formatVoiceCell(row: BeatRow, voice: string): string {
  const cell = row.voices.get(voice);
  if (!cell) return "-";
  return serializeVoiceCell(cell);
}

export function isDotRow(row: BeatRow, voices: string[]): boolean {
  return isRowEmpty(row, voices);
}
