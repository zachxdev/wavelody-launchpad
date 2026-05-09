// MusicDSL excerpts for the "view score diff" toggles in Sky Combat's
// iteration timeline. Each entry is the literal DSL text for the focal-change
// bar(s) of that round, pulled from
// D:/GitHub/MusicDSL/smoke-vN-piano-boss-fight-sky-musicdsl.txt
// and verified by diffing against the previous version.

export type SkyCombatDslExcerpt = {
  /** Human-readable description of which bars the excerpt shows. */
  bars: string;
  /** Verbatim DSL text. */
  excerpt: string;
};

export const skyCombatDslExcerpts: Record<string, SkyCombatDslExcerpt | null> = {
  v1: {
    bars: "Bar 29 — Hero theme square on the beat (the 'rhythmically inert' v1)",
    excerpt: `# v1 — Hero enters as on-beat unison octaves. Reads as hymn, not battle cry.
29, 1, <SECTION:HERO><THEME:B>, B, -, (B5, B6:f:24.legato), (B3, B4:f:24.legato)
5R
29, 25, -, -, -, (C#5, C#6:f:12.legato), (C#3, C#4:f:12.legato)
5R
29, 37, -, -, -, (D#5, D#6:f:12.legato), (D#3, D#4:f:12.legato)`,
  },

  v2: {
    bars: "Bar 29 — dotted-quarter + 8th syncopation (Round 1 fix)",
    excerpt: `# v2 — Hero gets dotted-quarter + 8th + half-note hook.
# Pushes against the beat instead of landing on it.
29, 1, <SECTION:HERO><THEME:B>, B, -, (B5, B6:f:18.legato), (B3, B4:f:18.legato)
5R
29, 19, -, -, -, (C#5, C#6:f:6.legato), (C#3, C#4:f:6.legato)
5R
29, 25, -, -, -, (D#5, D#6:f:24.legato), (D#3, D#4:f:24.legato)`,
  },

  v3: {
    bars: "Bar 69 — 32nd-note machine-gun bursts (Round 2, after RES=96 upgrade)",
    excerpt: `# v3 — RESOLUTION raised from 48 to 96 unblocks dur=3 (true 32nd note).
# Burst-rest-burst pattern: 8 bursts on beat 1-22, gap, then resume at 49.
69, 1, <SECTION:COMBAT_D4_MACHINE_GUN>, -, -, (F#5:ff:3.stac), (B2:ff:36.stac)
5R
69, 4, -, -, -, (F#5:ff:3.stac), -
5R
69, 7, -, -, -, (F#5:ff:3.stac), -
5R
69, 10, -, -, -, (F#5:ff:3.stac), -
5R
69, 13, -, -, -, (F#5:ff:3.stac), -
5R
69, 16, -, -, -, (F#5:ff:3.stac), -
5R
69, 19, -, -, -, (F#5:ff:3.stac), -
5R
69, 22, -, -, -, (F#5:ff:3.stac), -`,
  },

  v4: {
    bars: "Bars 69 + 70 — 3-voice texture, but pitch content loops identically",
    excerpt: `# v4 — bar 69 RH cluster: A5/G#5/B5/C6/A#5
69, 1, <SECTION:COMBAT_D4_3VOICE>, -, -, (A5:f:8.legato), (B1, F#2:mp:32s.tenuto)
5R
69, 9, -, -, -, (G#5:f:8.legato), -
5R
69, 17, -, -, -, (B5:f:8.legato), -
5R
69, 25, -, -, -, (C6:f:8.legato), -
5R
69, 33, -, -, -, (A#5:f:8.legato), (B1, F#2:mp:32s.tenuto)
# v4 — bar 70 RH cluster: A5/G#5/B5/C6/A#5  ← IDENTICAL to bar 69
70, 1, -, -, -, (A5:f:8.legato), (B1, F#2:mp:32s.tenuto)
5R
70, 9, -, -, -, (G#5:f:8.legato), -
5R
70, 17, -, -, -, (B5:f:8.legato), -
5R
70, 25, -, -, -, (C6:f:8.legato), -
5R
70, 33, -, -, -, (A#5:f:8.legato), (B1, F#2:mp:32s.tenuto)`,
  },

  v5: {
    bars: "Bars 16 / 20 / 24 — cross-over stabs displaced to unpredictable beats",
    excerpt: `# v5 — same Neapolitan C6 stab, three different timings.
# Bar 16 = beat 91 (establishing). Bar 20 = beat 73. Bar 24 = beat 88.
16, 91, -, -, -, -, (C6:sfz:6.stac)
5R |
20, 73, -, -, -, -, (C6:sfz:6.stac)
5R |
24, 88, -, -, -, -, (C6:sfz:6.stac)`,
  },

  v6: {
    bars: "Bars 6-8 — accelerating intro: 16ths → triplets → 32nds",
    excerpt: `# v6 — escalating diminished arpeggios with rhythmic acceleration.
# Bar 6 dur=6 (16ths), Bar 7 dur=4 (16th-note triplets), Bar 8 dur=3 (32nds).
6, 1, <DIM:Cdim7_rising>, -, -, (C5:p:6.legato), -
5R
6, 7, -, -, -, (Eb5:p:6.legato), -
5R
6, 13, -, -, -, (F#5:p:6.legato), -
5R |
7, 1, <DIM:C#dim7_rising>, -, -, (C#5:p:4.legato), -
5R
7, 5, -, -, -, (E5:p:4.legato), -
5R
7, 9, -, -, -, (G5:p:4.legato), -
5R |
8, 1, <DIM:Ddim7_rising>, -, -, (D5:mp:3.legato), -
5R
8, 4, -, -, -, (F5:mp:3.legato), -
5R
8, 7, -, -, -, (G#5:mp:3.legato), -`,
  },

  v7: {
    bars: "Bars 69 + 70 — RH cluster shifts up a step (the per-bar variation fix)",
    excerpt: `# v7 — bar 69 RH cluster: A5/G#5/B5/C6/A#5 (centre A5)
69, 1, <SECTION:COMBAT_D4_DEVTUNE>, -, -, (A5:f:8.legato), (B1, F#2:mp:32s.tenuto)
5R
69, 9, -, -, -, (G#5:f:8.legato), -
5R
69, 17, -, -, -, (B5:f:8.legato), -
5R
69, 25, -, -, -, (C6:f:8.legato), -
5R
69, 33, -, -, -, (A#5:f:8.legato), (B1, F#2:mp:32s.tenuto)
# v7 — bar 70 RH cluster: B5/A5/C6/D6 (centre B5 — UP A STEP from bar 69)
70, 1, -, -, -, (B5:f:8.legato), (B1, F#2:mp:32s.tenuto)
5R
70, 9, -, -, -, (A5:f:8.legato), -
5R
70, 17, -, -, -, (C6:f:8.legato), -
5R
70, 25, -, -, -, (D6:f:8.legato), -
5R
70, 33, -, -, -, (B5:f:8.legato), (B1, F#2:mp:32s.tenuto)`,
  },

  v8: {
    bars: "Bars 77 + 78 — tremolo morphs across bars (the second human-driven fix)",
    excerpt: `# v8 — bar 77 RH tremolo: B5/B6 (broken-octave on B)
77, 1, <SECTION:COMBAT_D5_MORPH>, -, -, (B5:mf:6.legato), (B3:mp:48.legato)
5R
77, 7, -, -, -, (B6:mf:6.legato), -
5R
77, 13, -, -, -, (B5:mf:6.legato), -
5R
77, 19, -, -, -, (B6:mf:6.legato), -
# v8 — bar 78 RH tremolo: A#5/D6  ← MORPHS to a different pair, not a static loop
78, 1, -, -, -, (A#5:mf:6.legato), (F#3:mp:48.legato)
5R
78, 7, -, -, -, (D6:mf:6.legato), -
5R
78, 13, -, -, -, (A#5:mf:6.legato), -
5R
78, 19, -, -, -, (D6:mf:6.legato), -
# LH walks F#3 → F3 → E3 → D#3 → D3 → C#3 → C3 → B2 across bars 77-84
# (a chromatic descent under a tremolo that itself morphs each bar)`,
  },
};
