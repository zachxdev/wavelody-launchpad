// Audio stem loading. Phase 6 supports two paths:
//
//   1. Static fixtures under /public/audio/<piece>_<voice>.wav. If they exist,
//      decodeWavFromUrl fetches and decodes each stem.
//   2. Synthesized placeholders (audio-synth.ts). When the static path returns
//      no usable stems, Workspace falls back to synthesizing per-voice buffers
//      from the parsed Score so the demo can play end-to-end without RunPod.
//
// Phase 8 swaps in the real RunPod Performer endpoint at the same boundary.

import * as Tone from "tone";
import type { Score } from "@/lib/musicdsl";

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
