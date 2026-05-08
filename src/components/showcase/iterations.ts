// Iteration record for the "How it was made" timeline. The story runs from
// v1 (a plain pattern transcription) through v13, the final five-movement
// Ravel-style suite. Versions v2–v6 lived inside the early "make it more
// floral / make it Ravel" prompt loop; the timeline collapses them into the
// v1 → v7 transition note rather than giving each its own card, since v7 is
// where the suite as we hear it today actually begins.

export type Iteration = {
  /** "v1", "v7", … */
  id: string;
  /** Short headline for the card. */
  title: string;
  /** mp3 path under /public. */
  audio: string;
  /** Renderer stage label: "first pass", "Gemini Round 1 fixes", … */
  stage: string;
  /** What drove this version — Zach's prompt or the Gemini critique that produced it. */
  driver: string;
  /** Two- or three-sentence note on what changed musically. */
  changes: string;
};

export const iterations: Iteration[] = [
  {
    id: "v1",
    title: "First pass — pattern transcription",
    audio: "/showcase/v1.mp3",
    stage: "Pre-suite — plain pattern read",
    driver:
      'Zach: "Use the alphabetical pattern AEJMAEKNBCNCAEJKNBCGJEATYUHTYI. Make it 3 minutes long for solo piano." A direct letter→pitch rendering with no shaping.',
    changes:
      "Single-line pattern, even quarters, no dynamics, no harmonisation. The notes are correct but the piece sounds like a finger exercise — too slow, too many literal repeats. Zach's verdict: a Beyer-style étude, not a piece.",
  },
  {
    id: "v7",
    title: "First five-movement Ravel attempt",
    audio: "/showcase/v7.mp3",
    stage: "After v2–v6 floral / Ravel / Chopin prompt loop",
    driver:
      'Zach supplied the structured pattern: "I. Lointain A B A C / II. Cantabile A B A C  D E D F / III. Plus mouvementé G H I G  H I J H / IV. Éclat L M N M / V. Retour F D E D. Write a Ravel piece, make it as complex as possible." First time the suite has its five-movement skeleton.',
    changes:
      "Letters mapped to F♯-minor pitches (A=F♯4 … N=A6). Ravel-style harmonic colour added — parallel ninths, octatonic flavours — but the rhythmic surface is still mostly even sixteenths. Zach: \"I'd give it a C+. Pass it to Gemini for critique.\"",
  },
  {
    id: "v8",
    title: "17 Gemini fixes — Round 1",
    audio: "/showcase/v8.mp3",
    stage: "Gemini critique — Round 1",
    driver:
      'Gemini Round 1 listed seventeen specific changes: stronger contrapuntal voices, longer phrases, polychords (D maj over F♯ maj), genuine rhythmic variety, agogic accents, better cadences, etc. Zach: "Do all."',
    changes:
      "All 17 prescriptions applied. Polychords appear; phrases extend across bars; right-hand fioritura ornaments thread above sustained left-hand chords. The result is recognisably more Ravel — but Gemini Round 2 flags a residual mechanical pulse: \"the ghost of the metronome is still in the machine.\"",
  },
  {
    id: "v9",
    title: "Polyrhythm overhaul — Melted Clock",
    audio: "/showcase/v9.mp3",
    stage: "Gemini critique — Round 2 → 3",
    driver:
      'Zach: "Yes to all and more polyrhythms." Gemini Round 2 prescribed Spanish hemiola (3-against-2), 5:4 against 4:4, and 7:8 cross-pulses to break the metronomic feel.',
    changes:
      "Independent voice streams now carry separate pulses — left hand in three, right hand in five, sometimes seven against eight. The timing surface stops grid-locking. Zach: the violin-note fidelity dropped a touch but the rhythmic feel is finally Ravel-adjacent.",
  },
  {
    id: "v10",
    title: "Friction — and parser-gap discoveries",
    audio: "/showcase/v10.mp3",
    stage: "Gemini Round 4 + spec-vs-parser audit",
    driver:
      'Gemini Round 3 asked for sub-row offsets (+M/D, ~M/D), J/Y dynamic curves with #tags, and half-pedal effects. Zach: "These are all in the spec — check the docs." A code audit found that several v2.4 spec features were silently ignored by the renderer.',
    changes:
      "Worked around the parser gap: row-level staggering instead of sub-row offsets, discrete velocity steps instead of J curves, density-driven crescendos instead of constant ff. Pedal handled by volume-envelope shaping. The piece gains friction and forward push despite the missing primitives.",
  },
  {
    id: "v11",
    title: "Crystallization",
    audio: "/showcase/v11.mp3",
    stage: "Gemini critique — Round 5",
    driver:
      'Gemini Round 5: tighten the dynamic shape across the whole arc, reduce middle-section right-hand monotony, sharpen the contrasts between movements. Zach was happy with the direction.',
    changes:
      "Dynamics now form a coherent macro-arc across all five movements rather than five separate climbs. Middle-section RH gets denser harmonic motion. Movement boundaries feel cleaner — Lointain breathes, Éclat actually erupts.",
  },
  {
    id: "v12",
    title: "Acoustic Bridge — left-hand mid-register support",
    audio: "/showcase/v12.mp3",
    stage: "Gemini critique — Round 6",
    driver:
      'Zach: "After playing the low notes, I want the left hand — as long as it\'s physically possible — to play some notes in the middle range to support the high notes." Gemini Round 6 framed this as Ravel\'s "Le Tombeau de Couperin" Menuet voicing.',
    changes:
      "Left hand now bridges the low bass and the high right-hand line with mid-register chord voicings, the way Ravel does in Le Tombeau. The piano sounds three-handed in places. Zach's note: \"Very good additions, but the repeated notes need more variety or to be more subdued.\"",
  },
  {
    id: "v13",
    title: "The Living Engine — three-phase growth arc",
    audio: "/showcase/v13.mp3",
    stage: "Gemini critique — Round 7 — final",
    driver:
      'Gemini Round 7 prescribed a three-phase growth arc for Movement IV (Éclat): a Hushed Intro of decaying pulses, a Fluctuating Cloud with a swell-shaped bell curve, then a Brilliant Peak on a plateau-f with sforzandi.',
    changes:
      "Mvt IV bars 60-63: decaying pulse [mp p p pp pp pp pp]. Bars 64-69: bell-curve swell [p mp mf mf mp p pp] with four-pitch rotation. Bars 70-73: plateau-f with sfz at slots 3 and 7, three-note octatonic chords expanding to four notes at bar 73. 1,437 notes total (+35 over v12), 6:06 duration, peak −5.7 dBFS. The mechanical ghost is gone.",
  },
];

export const finalIteration = iterations[iterations.length - 1];
