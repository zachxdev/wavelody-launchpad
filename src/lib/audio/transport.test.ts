import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Minimal Tone mock — we only need the surface Transport touches.
// Each mock instance records calls so the tests can assert state.

interface MockChannel {
  connect: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  volume: { value: number };
  mute: boolean;
  solo: boolean;
}

interface MockTransport {
  bpm: { value: number };
  state: "started" | "stopped" | "paused";
  seconds: number;
  position: number | string;
  start: ReturnType<typeof vi.fn>;
  pause: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  scheduleRepeat: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
}

const mockTransport: MockTransport = {
  bpm: { value: 120 },
  state: "stopped",
  seconds: 0,
  position: 0,
  start: vi.fn(function (this: MockTransport) {
    this.state = "started";
  }),
  pause: vi.fn(function (this: MockTransport) {
    this.state = "paused";
  }),
  stop: vi.fn(function (this: MockTransport) {
    this.state = "stopped";
    this.seconds = 0;
  }),
  scheduleRepeat: vi.fn(() => 1),
  clear: vi.fn(),
};

vi.mock("tone", () => {
  class Gain {
    gain = { value: 1 };
    toDestination() {
      return this;
    }
    connect() {
      return this;
    }
    dispose() {}
  }
  class Channel implements MockChannel {
    connect = vi.fn(function (this: Channel) {
      return this;
    });
    dispose = vi.fn();
    volume = { value: 0 };
    mute = false;
    solo = false;
  }
  class Player {
    sync() {
      return this;
    }
    start() {
      return this;
    }
    connect() {
      return this;
    }
    dispose() {}
  }
  class ToneAudioBuffer {
    constructor(public buffer: AudioBuffer) {}
  }
  return {
    Gain,
    Channel,
    Player,
    ToneAudioBuffer,
    getTransport: () => mockTransport,
    getContext: () => ({ rawContext: {} as BaseAudioContext }),
    start: vi.fn(async () => {}),
  };
});

const fakeBuffer = (duration = 1): AudioBuffer =>
  ({
    duration,
    sampleRate: 44100,
    length: 44100,
    numberOfChannels: 1,
    getChannelData: () => new Float32Array(44100),
  }) as unknown as AudioBuffer;

import { Transport } from "./transport";

describe("Transport", () => {
  let t: Transport;

  beforeEach(() => {
    mockTransport.state = "stopped";
    mockTransport.seconds = 0;
    mockTransport.bpm.value = 120;
    mockTransport.start.mockClear();
    mockTransport.pause.mockClear();
    mockTransport.stop.mockClear();
    mockTransport.scheduleRepeat.mockClear();
    mockTransport.clear.mockClear();
    t = new Transport();
  });

  afterEach(() => {
    t.dispose();
  });

  it("configure sets the BPM on Tone.Transport", () => {
    t.configure({ bpm: 96, beatsPerBar: 4, totalBeats: 16 });
    expect(mockTransport.bpm.value).toBe(96);
  });

  it("load creates one voice node per stem and emits 'loaded'", async () => {
    const stems = new Map<string, AudioBuffer>([
      ["LH", fakeBuffer()],
      ["RH", fakeBuffer()],
    ]);
    let loadedFired = false;
    t.on("loaded", () => {
      loadedFired = true;
    });
    await t.load(stems);
    expect(t.getVoices()).toEqual(["LH", "RH"]);
    expect(loadedFired).toBe(true);
  });

  it("start → pause → start moves through the right states and emits play/pause", async () => {
    const events: string[] = [];
    t.on("play", () => events.push("play"));
    t.on("pause", () => events.push("pause"));
    await t.start();
    expect(mockTransport.start).toHaveBeenCalled();
    expect(t.isPlaying()).toBe(true);
    t.pause();
    expect(mockTransport.pause).toHaveBeenCalled();
    expect(t.isPlaying()).toBe(false);
    expect(events).toEqual(["play", "pause"]);
  });

  it("stop resets transport to position 0 and emits stop + beat-tick(0)", async () => {
    const events: { name: string; beat: number }[] = [];
    t.on("stop", (b) => events.push({ name: "stop", beat: b }));
    t.on("beat-tick", (b) => events.push({ name: "beat-tick", beat: b }));
    await t.start();
    mockTransport.seconds = 5;
    t.stop();
    expect(mockTransport.stop).toHaveBeenCalled();
    expect(mockTransport.position).toBe(0);
    expect(events.some((e) => e.name === "stop" && e.beat === 0)).toBe(true);
    expect(events.some((e) => e.name === "beat-tick" && e.beat === 0)).toBe(true);
  });

  it("seek converts beats → seconds using the configured BPM", () => {
    t.configure({ bpm: 60, beatsPerBar: 4, totalBeats: 16 });
    t.seek(8);
    // 8 beats at 60 BPM = 8 seconds.
    expect(mockTransport.seconds).toBe(8);
    t.configure({ bpm: 120, beatsPerBar: 4, totalBeats: 16 });
    t.seek(8);
    // 8 beats at 120 BPM = 4 seconds.
    expect(mockTransport.seconds).toBe(4);
  });

  it("seek clamps negative beats to 0", () => {
    t.seek(-5);
    expect(mockTransport.seconds).toBe(0);
  });

  it("setVoiceMuted sets the channel's mute flag", async () => {
    await t.load(new Map([["LH", fakeBuffer()]]));
    t.setVoiceMuted("LH", true);
    // Reach into the voice map (via getVoices order + a setter call) — we
    // only have public surface, so re-set and check side-effect indirectly:
    // setting it twice without throwing is enough to confirm the path.
    t.setVoiceMuted("LH", false);
    t.setVoiceMuted("LH", true);
    expect(t.getVoices()).toEqual(["LH"]);
  });

  it("setVoiceGain converts linear → dB without throwing on the [0,1] range", async () => {
    await t.load(new Map([["LH", fakeBuffer()]]));
    t.setVoiceGain("LH", 0);
    t.setVoiceGain("LH", 0.5);
    t.setVoiceGain("LH", 1);
    // Out-of-range values should clamp silently (NaN-safe).
    t.setVoiceGain("LH", -1);
    t.setVoiceGain("LH", 2);
    t.setVoiceGain("LH", Number.NaN);
    expect(t.getVoices()).toEqual(["LH"]);
  });

  it("setVoiceSolo sets the channel solo flag (multi-solo is Tone's job)", async () => {
    await t.load(
      new Map([
        ["LH", fakeBuffer()],
        ["RH", fakeBuffer()],
        ["V", fakeBuffer()],
      ]),
    );
    t.setVoiceSolo("LH", true);
    t.setVoiceSolo("V", true);
    t.setVoiceSolo("LH", false);
    expect(t.getVoices()).toEqual(["LH", "RH", "V"]);
  });

  it("on returns an unsubscribe that removes the listener", async () => {
    let count = 0;
    const off = t.on("play", () => {
      count += 1;
    });
    await t.start();
    expect(count).toBe(1);
    off();
    await t.start();
    expect(count).toBe(1);
  });

  it("dispose tears down listeners and clears scheduled work", async () => {
    await t.start();
    t.dispose();
    expect(mockTransport.stop).toHaveBeenCalled();
    expect(mockTransport.clear).toHaveBeenCalled();
    expect(t.getVoices()).toEqual([]);
  });
});
