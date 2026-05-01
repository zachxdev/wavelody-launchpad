// Audio stem loading. Two paths:
//
//   1. /api/render — Performer v0 service via the Worker proxy. Returns a
//      RenderResponse with per-voice URLs we fetch + decode. This is the
//      Phase 8b production path.
//   2. Synthesized placeholders (audio-synth.ts). Used as a fallback when
//      no render URLs are available — local dev without Performer running,
//      or when /api/render itself failed.
//
// The legacy `loadStemsForScore(score, pieceId)` overload is kept for the
// dev fixture path under /public/audio/.

import * as Tone from "tone";
import type { Score } from "@/lib/musicdsl";
import type { RenderStem } from "../../../api/types";

export async function decodeWavFromUrl(
  url: string,
  ctx: BaseAudioContext = Tone.getContext().rawContext as BaseAudioContext,
): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Stem fetch failed: ${url} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

export interface StemLoadResult {
  stems: Map<string, AudioBuffer>;
  failed: string[];
}

/**
 * Attempt to load per-voice WAV stems from /audio/<piece>_<voice>.wav.
 * Returns whatever loaded successfully plus a list of voices that failed.
 * Both lists may be empty; the caller decides whether to fall back to
 * synthesis based on `stems.size` vs `score.header.voices.length`.
 */
export async function loadStemsForScore(
  score: Score,
  pieceId: string,
): Promise<StemLoadResult> {
  const stems = new Map<string, AudioBuffer>();
  const failed: string[] = [];
  await Promise.all(
    score.header.voices.map(async (voice) => {
      const url = `/audio/${pieceId}_${voice.toLowerCase()}.wav`;
      try {
        const buffer = await decodeWavFromUrl(url);
        stems.set(voice, buffer);
      } catch {
        failed.push(voice);
      }
    }),
  );
  return { stems, failed };
}

// Load per-voice stems from /api/render output. Each RenderStem carries a
// URL the Worker has populated (R2 in prod, Performer pass-through in dev).
// Returns the loaded AudioBuffers keyed by voice id, plus the list of any
// voices that failed to load — caller decides whether to swap them out
// for synthesized placeholders.
export async function loadStemsFromRender(
  stems: RenderStem[],
): Promise<StemLoadResult> {
  const out = new Map<string, AudioBuffer>();
  const failed: string[] = [];
  await Promise.all(
    stems.map(async (s) => {
      try {
        const buffer = await decodeWavFromUrl(s.url);
        out.set(s.voice_id, buffer);
      } catch {
        failed.push(s.voice_id);
      }
    }),
  );
  return { stems: out, failed };
}
