// Phase-6 placeholder synthesis. Renders per-voice AudioBuffers from the parsed
// Score using OfflineAudioContext + plain Web Audio oscillators. Phase 8 swaps
// these for real RunPod stems at the same load() boundary in Workspace.
//
// Per-voice timbre is a deliberate caricature, not a realistic instrument
// imitation — the goal is just "voices sound distinguishable when soloed":
//   piano (LH/RH)  sine + 2× harmonic, fast AD envelope
//   strings (V)    sawtooth, slow attack, vibrato
//   strings (Vc)   sawtooth, slow attack, less vibrato, lower pre-emphasis

import { extractVoices, type Note, type NoteEvent, type Score } from "@/lib/musicdsl";

const SAMPLE_RATE = 44100;

const DYNAMIC_GAIN: Record<Note["dynamic"], number> = {
  ppp: 0.08,
  pp: 0.12,
  p: 0.18,
  mp: 0.25,
  mf: 0.35,
  f: 0.5,
  ff: 0.6,
  fff: 0.7,
  sfz: 0.65,
};

interface VoiceSynthProfile {
  oscillator: OscillatorType;
  attack: number; // seconds
  decay: number; // seconds (only matters for piano-style envelope)
  release: number; // seconds
  sustain: number; // 0..1
  harmonics: { ratio: number; gain: number }[];
  vibratoHz: number;
  vibratoCents: number;
  envelopeKind: "ad" | "adsr"; // piano vs string
}

const PROFILES: Record<string, VoiceSynthProfile> = {
  LH: {
    oscillator: "sine",
    attack: 0.005,
    decay: 0.4,
    release: 0.3,
    sustain: 0.0,
    harmonics: [{ ratio: 2, gain: 0.3 }, { ratio: 3, gain: 0.1 }],
    vibratoHz: 0,
    vibratoCents: 0,
    envelopeKind: "ad",
  },
  RH: {
    oscillator: "sine",
    attack: 0.005,
    decay: 0.5,
    release: 0.3,
    sustain: 0.0,
    harmonics: [{ ratio: 2, gain: 0.4 }, { ratio: 3, gain: 0.15 }, { ratio: 4, gain: 0.05 }],
    vibratoHz: 0,
    vibratoCents: 0,
    envelopeKind: "ad",
  },
  V: {
    oscillator: "sawtooth",
    attack: 0.05,
    decay: 0.05,
    release: 0.15,
    sustain: 1.0,
    harmonics: [],
    vibratoHz: 5,
    vibratoCents: 8,
    envelopeKind: "adsr",
  },
  Vc: {
    oscillator: "sawtooth",
    attack: 0.08,
    decay: 0.08,
    release: 0.2,
    sustain: 1.0,
    harmonics: [],
    vibratoHz: 4,
    vibratoCents: 5,
    envelopeKind: "adsr",
  },
};

const FALLBACK_PROFILE: VoiceSynthProfile = {
  oscillator: "triangle",
  attack: 0.02,
  decay: 0.2,
  release: 0.2,
  sustain: 0.4,
  harmonics: [],
  vibratoHz: 0,
  vibratoCents: 0,
  envelopeKind: "adsr",
};

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function rowSeconds(score: Score): number {
  const bar = score.bars[0];
  const bpm = score.header.tempo || 120;
  const rowsPerBeat = bar
    ? bar.resolution / bar.timeSignature.numerator
    : 24;
  return 60 / (bpm * rowsPerBeat);
}

function totalDurationSeconds(score: Score): number {
  const sec = rowSeconds(score);
  let totalRows = 0;
  for (const bar of score.bars) totalRows += bar.rows.length;
  // Pad 0.5s at the end so release tails fit.
  return totalRows * sec + 0.5;
}

function eventOnsetBeats(event: NoteEvent, rowsPerBeat: number): number {
  const off = event.note.offset;
  const fraction = off ? off.fraction.num / off.fraction.den : 0;
  const sign = off?.mode === "backward" ? -1 : 1;
  return event.absolutePosition / rowsPerBeat + (sign * fraction) / rowsPerBeat;
}

function scheduleNote(
  ctx: OfflineAudioContext,
  destination: AudioNode,
  profile: VoiceSynthProfile,
  midi: number,
  startSec: number,
  durationSec: number,
  amp: number,
): void {
  const baseFreq = midiToFreq(midi);
  const env = ctx.createGain();
  env.gain.value = 0;
  env.connect(destination);

  // Envelope shaping.
  const peak = amp;
  const attackEnd = startSec + profile.attack;
  const decayEnd = attackEnd + profile.decay;
  const releaseStart = startSec + Math.max(0, durationSec);
  const releaseEnd = releaseStart + profile.release;
  env.gain.setValueAtTime(0, startSec);
  env.gain.linearRampToValueAtTime(peak, attackEnd);
  if (profile.envelopeKind === "ad") {
    env.gain.linearRampToValueAtTime(0, decayEnd);
  } else {
    env.gain.linearRampToValueAtTime(peak * profile.sustain, decayEnd);
    env.gain.setValueAtTime(peak * profile.sustain, releaseStart);
    env.gain.linearRampToValueAtTime(0, releaseEnd);
  }

  // Fundamental + harmonic stack.
  const allOscs: OscillatorNode[] = [];
  const allGains: GainNode[] = [];
  const fundamental = ctx.createOscillator();
  fundamental.type = profile.oscillator;
  fundamental.frequency.value = baseFreq;
  const fundGain = ctx.createGain();
  fundGain.gain.value = 1;
  fundamental.connect(fundGain).connect(env);
  allOscs.push(fundamental);
  allGains.push(fundGain);

  for (const h of profile.harmonics) {
    const o = ctx.createOscillator();
    o.type = profile.oscillator;
    o.frequency.value = baseFreq * h.ratio;
    const g = ctx.createGain();
    g.gain.value = h.gain;
    o.connect(g).connect(env);
    allOscs.push(o);
    allGains.push(g);
  }

  // Vibrato (LFO modulating each oscillator's frequency in cents).
  if (profile.vibratoHz > 0 && profile.vibratoCents > 0) {
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = profile.vibratoHz;
    const lfoGain = ctx.createGain();
    // Convert cents → semitone fraction → freq delta. 1 cent ≈ freq * 0.00057779.
    const centsToFreq = baseFreq * (Math.pow(2, profile.vibratoCents / 1200) - 1);
    lfoGain.gain.value = centsToFreq;
    lfo.connect(lfoGain);
    for (const o of allOscs) lfoGain.connect(o.frequency);
    lfo.start(startSec);
    lfo.stop(releaseEnd);
  }

  for (const o of allOscs) {
    o.start(startSec);
    o.stop(releaseEnd);
  }
}

interface OfflineCtor {
  new (
    options: OfflineAudioContextOptions | number,
    length?: number,
    sampleRate?: number,
  ): OfflineAudioContext;
}

function getOfflineCtor(): OfflineCtor | null {
  if (typeof OfflineAudioContext !== "undefined")
    return OfflineAudioContext as unknown as OfflineCtor;
  // Safari fallback (older versions only).
  const win = globalThis as unknown as { webkitOfflineAudioContext?: OfflineCtor };
  return win.webkitOfflineAudioContext ?? null;
}

export async function synthesizeVoiceBuffer(
  score: Score,
  voice: string,
): Promise<AudioBuffer> {
  const Ctor = getOfflineCtor();
  if (!Ctor) {
    throw new Error("OfflineAudioContext is not available in this environment");
  }
  const duration = totalDurationSeconds(score);
  const ctx = new Ctor(1, Math.ceil(duration * SAMPLE_RATE), SAMPLE_RATE);
  const profile = PROFILES[voice] ?? FALLBACK_PROFILE;
  const sec = rowSeconds(score);
  const bar = score.bars[0];
  const rowsPerBeat = bar
    ? bar.resolution / bar.timeSignature.numerator
    : 24;

  const streams = extractVoices(score);
  const stream = streams.find((s) => s.voice === voice);
  if (stream) {
    for (const event of stream.events) {
      const onsetBeats = eventOnsetBeats(event, rowsPerBeat);
      const startSec = onsetBeats * (60 / (score.header.tempo || 120));
      const durationSec = (event.note.durationUnits / rowsPerBeat) *
        (60 / (score.header.tempo || 120));
      const amp = DYNAMIC_GAIN[event.note.dynamic];
      for (const pitch of event.note.pitches) {
        scheduleNote(
          ctx,
          ctx.destination,
          profile,
          pitch.midi,
          startSec,
          durationSec,
          amp,
        );
      }
    }
  }
  void sec;
  return ctx.startRendering();
}

export async function synthesizeStemsForScore(
  score: Score,
): Promise<Map<string, AudioBuffer>> {
  const out = new Map<string, AudioBuffer>();
  // Render voices in parallel — OfflineAudioContext runs faster than realtime.
  const buffers = await Promise.all(
    score.header.voices.map((v) => synthesizeVoiceBuffer(score, v)),
  );
  for (let i = 0; i < score.header.voices.length; i += 1) {
    out.set(score.header.voices[i], buffers[i]);
  }
  return out;
}
