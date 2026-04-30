// Transport: web-audio playback layer for Wavelody.
//
// Wraps Tone.js so the rest of the app sees a small, Tone-agnostic surface:
// load() takes per-voice AudioBuffers, play/pause/stop/seek run them through a
// shared Tone.Transport timeline, and the mixer routes gain/mute/solo through
// per-voice Tone.Channel nodes that share Tone's solo-bus semantics.
//
// Phase 6 is frontend only — the AudioBuffers come from synthesized placeholders
// or static fixtures (loader.ts). Phase 8 will swap in real RunPod stems at the
// same load() boundary, no other changes needed.

import * as Tone from "tone";

export type TransportEvent =
  | "play"
  | "pause"
  | "stop"
  | "seek"
  | "beat-tick"
  | "loaded";

export interface TransportListener {
  (currentBeat: number): void;
}

export interface TransportConfig {
  bpm: number;
  beatsPerBar: number;
  totalBeats: number;
}

interface VoiceNode {
  player: Tone.Player;
  channel: Tone.Channel;
  loadedDuration: number;
}

const DEFAULT_CONFIG: TransportConfig = {
  bpm: 120,
  beatsPerBar: 4,
  totalBeats: 0,
};

export class Transport {
  private listeners = new Map<TransportEvent, Set<TransportListener>>();
  private voices = new Map<string, VoiceNode>();
  private master: Tone.Gain;
  private repeatId: number | null = null;
  private config: TransportConfig = DEFAULT_CONFIG;

  constructor() {
    this.master = new Tone.Gain(1).toDestination();
  }

  configure(config: Partial<TransportConfig>): void {
    this.config = { ...this.config, ...config };
    Tone.getTransport().bpm.value = this.config.bpm;
  }

  async load(stems: Map<string, AudioBuffer>): Promise<void> {
    // Tear down any prior voices.
    for (const node of this.voices.values()) {
      node.player.dispose();
      node.channel.dispose();
    }
    this.voices.clear();

    for (const [voiceId, buffer] of stems) {
      const channel = new Tone.Channel({ volume: 0, pan: 0 }).connect(this.master);
      const toneBuffer = new Tone.ToneAudioBuffer(buffer);
      const player = new Tone.Player(toneBuffer).sync().start(0);
      player.connect(channel);
      this.voices.set(voiceId, {
        player,
        channel,
        loadedDuration: buffer.duration,
      });
    }
    this.emit("loaded", 0);
  }

  async start(): Promise<void> {
    await Tone.start();
    if (this.repeatId === null) {
      // 16th-note granularity → 4 ticks per quarter beat.
      this.repeatId = Tone.getTransport().scheduleRepeat(() => {
        const seconds = Tone.getTransport().seconds;
        const beat = (seconds * this.config.bpm) / 60;
        this.emit("beat-tick", beat);
      }, "16n");
    }
    Tone.getTransport().start();
    this.emit("play", this.getCurrentBeat());
  }

  pause(): void {
    Tone.getTransport().pause();
    this.emit("pause", this.getCurrentBeat());
  }

  stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    this.emit("stop", 0);
    this.emit("beat-tick", 0);
  }

  seek(beat: number): void {
    const seconds = (beat * 60) / this.config.bpm;
    Tone.getTransport().seconds = Math.max(0, seconds);
    this.emit("seek", beat);
    this.emit("beat-tick", beat);
  }

  getCurrentBeat(): number {
    const seconds = Tone.getTransport().seconds;
    return (seconds * this.config.bpm) / 60;
  }

  isPlaying(): boolean {
    return Tone.getTransport().state === "started";
  }

  setMasterGain(linear: number): void {
    this.master.gain.value = clamp01(linear);
  }

  setVoiceGain(voiceId: string, linear: number): void {
    const v = this.voices.get(voiceId);
    if (!v) return;
    v.channel.volume.value = linearToDb(clamp01(linear));
  }

  setVoiceMuted(voiceId: string, muted: boolean): void {
    const v = this.voices.get(voiceId);
    if (!v) return;
    v.channel.mute = muted;
  }

  setVoiceSolo(voiceId: string, soloed: boolean): void {
    const v = this.voices.get(voiceId);
    if (!v) return;
    v.channel.solo = soloed;
  }

  on(event: TransportEvent, cb: TransportListener): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(cb);
    return () => {
      set?.delete(cb);
    };
  }

  emit(event: TransportEvent, beat: number): void {
    this.listeners.get(event)?.forEach((cb) => cb(beat));
  }

  dispose(): void {
    if (this.repeatId !== null) {
      Tone.getTransport().clear(this.repeatId);
      this.repeatId = null;
    }
    Tone.getTransport().stop();
    for (const node of this.voices.values()) {
      node.player.dispose();
      node.channel.dispose();
    }
    this.voices.clear();
    this.master.dispose();
    this.listeners.clear();
  }

  /** Returns the registered voice ids in insertion order — for tests + UI. */
  getVoices(): string[] {
    return Array.from(this.voices.keys());
  }
}

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity;
  return 20 * Math.log10(linear);
}
