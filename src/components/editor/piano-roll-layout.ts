// Pure layout helpers for the Piano Roll. Kept separate from the React
// component so they can be unit-tested without rendering.

import type { Dynamic, Note } from "@/lib/musicdsl";

export interface LaneRange {
  minMidi: number;
  maxMidi: number;
}

const DEFAULT_PAD = 4;
const FALLBACK_CENTER_MIDI = 60; // C4
const FALLBACK_HALF_RANGE = 12;

export function voiceLaneRange(notes: Note[], pad = DEFAULT_PAD): LaneRange {
  if (notes.length === 0) {
    return {
      minMidi: FALLBACK_CENTER_MIDI - FALLBACK_HALF_RANGE,
      maxMidi: FALLBACK_CENTER_MIDI + FALLBACK_HALF_RANGE,
    };
  }
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  for (const n of notes) {
    for (const p of n.pitches) {
      if (p.midi < lo) lo = p.midi;
      if (p.midi > hi) hi = p.midi;
    }
  }
  return {
    minMidi: Math.max(0, lo - pad),
    maxMidi: Math.min(127, hi + pad),
  };
}

export function pitchToY(midi: number, laneTopMidi: number, pxPerSemitone: number): number {
  return (laneTopMidi - midi) * pxPerSemitone;
}

export function beatToX(beat: number, pxPerBeat: number): number {
  return beat * pxPerBeat;
}

const DYNAMIC_OPACITY: Record<Dynamic, number> = {
  ppp: 0.25,
  pp: 0.35,
  p: 0.45,
  mp: 0.55,
  mf: 0.7,
  f: 0.85,
  ff: 0.95,
  fff: 1.0,
  sfz: 1.0,
};

export function dynamicToOpacity(dynamic: Dynamic): number {
  return DYNAMIC_OPACITY[dynamic];
}

export const PX_PER_SEMITONE = 6;
export const DEFAULT_PX_PER_BEAT = 24;
export const MIN_PX_PER_BEAT = 8;
export const MAX_PX_PER_BEAT = 64;
export const RULER_HEIGHT = 28;
export const LANE_PITCH_RULER_WIDTH = 56;
export const LANE_GAP = 8;

export function laneHeight(range: LaneRange): number {
  return (range.maxMidi - range.minMidi + 1) * PX_PER_SEMITONE;
}
