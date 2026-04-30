import { describe, expect, it } from "vitest";
import type { Note } from "@/lib/musicdsl";
import {
  beatToX,
  dynamicToOpacity,
  laneHeight,
  pitchToY,
  voiceLaneRange,
  PX_PER_SEMITONE,
} from "./piano-roll-layout";

const note = (midi: number, dynamic: Note["dynamic"] = "mf"): Note => ({
  pitches: [{ step: "C", alter: 0, octave: 4, midi }],
  dynamic,
  durationUnits: 24,
  sustain: false,
});

describe("voiceLaneRange", () => {
  it("pads ±4 semitones around the actual note range", () => {
    const notes = [note(60), note(72)];
    expect(voiceLaneRange(notes)).toEqual({ minMidi: 56, maxMidi: 76 });
  });

  it("returns a centered fallback for empty voice", () => {
    expect(voiceLaneRange([])).toEqual({ minMidi: 48, maxMidi: 72 });
  });

  it("clamps to MIDI bounds 0..127", () => {
    expect(voiceLaneRange([note(2)]).minMidi).toBe(0);
    expect(voiceLaneRange([note(125)]).maxMidi).toBe(127);
  });

  it("scans every pitch in chord notes", () => {
    const chord: Note = {
      pitches: [
        { step: "C", alter: 0, octave: 3, midi: 48 },
        { step: "E", alter: 0, octave: 3, midi: 52 },
        { step: "G", alter: 0, octave: 5, midi: 79 },
      ],
      dynamic: "mf",
      durationUnits: 24,
      sustain: false,
    };
    expect(voiceLaneRange([chord])).toEqual({ minMidi: 44, maxMidi: 83 });
  });

  it("respects custom pad", () => {
    expect(voiceLaneRange([note(60)], 0)).toEqual({ minMidi: 60, maxMidi: 60 });
  });
});

describe("pitchToY", () => {
  it("places the top-of-lane MIDI at y=0", () => {
    expect(pitchToY(72, 72, 6)).toBe(0);
  });

  it("descends one (pxPerSemitone) per MIDI step downward", () => {
    expect(pitchToY(60, 72, 6)).toBe(72); // 12 semitones × 6 px
  });

  it("returns negative y for pitches above lane top", () => {
    expect(pitchToY(73, 72, 6)).toBe(-6);
  });
});

describe("beatToX", () => {
  it("scales linearly", () => {
    expect(beatToX(0, 24)).toBe(0);
    expect(beatToX(4, 24)).toBe(96);
    expect(beatToX(2.5, 24)).toBe(60);
  });
});

describe("dynamicToOpacity", () => {
  it.each([
    ["ppp", 0.25],
    ["pp", 0.35],
    ["p", 0.45],
    ["mp", 0.55],
    ["mf", 0.7],
    ["f", 0.85],
    ["ff", 0.95],
    ["fff", 1.0],
    ["sfz", 1.0],
  ] as const)("%s → %f", (dyn, op) => {
    expect(dynamicToOpacity(dyn)).toBe(op);
  });
});

describe("laneHeight", () => {
  it("multiplies the inclusive MIDI range by pxPerSemitone", () => {
    expect(laneHeight({ minMidi: 60, maxMidi: 72 })).toBe(13 * PX_PER_SEMITONE);
  });
});
