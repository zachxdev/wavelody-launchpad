// MusicDSL excerpts for the "view score diff" toggles in the iteration
// timeline. Each entry is the literal DSL text for the focal-change bar(s)
// of that round, pulled from D:/GitHub/MusicDSL/smoke-vN-piano-medley-
// lyrical-fantasy-musicdsl.txt and verified by diffing against the previous
// version. Where the round's headline narrative did not actually land in the
// expected bars, the `bars` field reflects the real diff and the iteration
// card's "applied" text is qualified accordingly.

export type LullabyDslExcerpt = {
  /** Human-readable description of which bars the excerpt shows. */
  bars: string;
  /** Verbatim DSL text. */
  excerpt: string;
};

export const lullabyDslExcerpts: Record<string, LullabyDslExcerpt | null> = {
  v1: null,

  v2: {
    bars: "Section D — bars 41-42 (recast as Woodland-Dance-derived contour; 43-44 continue same pattern)",
    excerpt: `# ════════ D. LYRICAL BALLAD (bars 41-52) — RECAST w/ B-derived contour ════════
41, 1, <SECTION:D_BALLAD><PHRASE:start>, -, -, (F#4,D5:mf:12.tenuto), (D2:mf:6.tenuto)
5R
41, 7, -, -, -, -, (A2:mf:6.tenuto)
5R
41, 13, -, -, -, (A4,F#5:mf:12.tenuto), (D3:mf:6.tenuto)
5R
41, 19, -, -, -, -, (F#3:mf:6.tenuto)
5R
41, 25, -, -, -, (C#5,A5:mf:12.tenuto), (A3:mf:6.tenuto)
5R
41, 31, -, -, -, -, (F#3:mf:6.tenuto)
5R
41, 37, -, -, -, (A4,F#5:mf:12.tenuto), (D3:mf:6.tenuto)
5R
41, 43, -, -, -, -, (A2:mf:6.tenuto)
5R |
42, 1, -, -, -, (G4,E5:mf:12.tenuto), (A1:mf:6.tenuto)
5R
42, 7, -, -, -, -, (E2:mf:6.tenuto)
5R
42, 13, -, -, -, (E4,C#5:mf:12.tenuto), (A2:mf:6.tenuto)
5R
42, 19, -, -, -, -, (C#3:mf:6.tenuto)
5R
42, 25, -, -, -, (G4,E5:mf:12.tenuto), (E3:mf:6.tenuto)
5R
42, 31, -, -, -, -, (C#3:mf:6.tenuto)
5R
42, 37, -, -, -, (C#5,A5:mf:12.tenuto), (A2:mf:6.tenuto)
5R
42, 43, -, -, -, -, (E2:mf:6.tenuto)
5R |`,
  },

  v3: {
    bars: "Bars 59-60 — open Dmaj9 final close (RH gains D6, drops F#3/A3 from final LH chord)",
    excerpt: `59, 1, <PHRASE:coda>, -, -, (F#4,A4:p:24.tenuto), (D2,A2,D3,F#3,A3:p:48.tenuto)
23R
59, 25, -, -, -, (D4,F#4:p:24.tenuto), -
23R |
60, 1, -, -, -, (E5,A5,D6:pp:48.tenuto), (D2,A2:pp:48s.tenuto)
47R |`,
  },

  v4: {
    bars: "Section C bar 27 — sixths-harmonised opening (b1 A5 → F#5+A5; b25 F#5 → D5+F#5; bars 28-30 follow same pattern)",
    excerpt: `# ════════ C. CELESTIAL — 27-30 sixths, 31 sfz→p, 38 → A7 ════════
27, 1, <SECTION:C_CELESTIAL><PHRASE:start>, -, -, (F#5,A5:pp:24.tenuto), (B1,B2:pp:48s.tenuto)
2R
27, 4, -, -, -, -, (F#3:pp:3)
2R
27, 7, -, -, -, -, (B3:pp:3)
2R
27, 10, -, -, -, -, (D4:pp:3)
2R
27, 13, -, -, -, -, (B2:pp:3)
2R
# ... beats 16-22 LH arp continues B-arpeggio ...
27, 25, -, -, -, (D5,F#5:pp:24.tenuto), (B2:pp:3)
2R
27, 28, -, -, -, -, (F#3:pp:3)
2R
27, 31, -, -, -, -, (B3:pp:3)
2R
# ... beats 34-46 LH arp continues ...`,
  },

  // Diff sanity-check: bars 27-29 and 31-32 are byte-identical to v4. The
  // only Section C change at v5 is bar 30 — D4 → C#4 at LH rows 7, 19, 31, 43
  // (the "Dmaj7 shimmer" called out in v5's section banner). The "rhythmic
  // breathing" prescription Round 4 articulated did not land in this round.
  v5: {
    bars: "Bar 30 — Dmaj7 shimmer (LH D4 → C#4 at rows 7, 19, 31, 43); bars 27-29 & 31-32 unchanged from v4",
    excerpt: `# ════════ C. CELESTIAL — bar 30 Dmaj7 shimmer ════════
30, 1, -, -, -, (D5,F#5:pp:24.tenuto), (D2,D3:pp:48s.tenuto)
2R
30, 4, -, -, -, -, (A3:pp:3)
2R
30, 7, -, -, -, -, (C#4:pp:3)
2R
30, 10, -, -, -, -, (F#4:pp:3)
2R
30, 13, -, -, -, -, (D3:pp:3)
2R
30, 16, -, -, -, -, (A3:pp:3)
2R
30, 19, -, -, -, -, (C#4:pp:3)
2R
30, 22, -, -, -, -, (F#4:pp:3)
2R
30, 25, -, -, -, (F#5,A5:pp:24.tenuto), (D3:pp:3)
2R
# ... beats 28-46: A3, C#4, F#4 pattern continues; rows 31 & 43 also C#4 (was D4) ...`,
  },

  v6: {
    bars: "Bar 43 — LH counter-melody refinement (row 25: F#3 → G#3, the D-E-G#-F# leading line into bar 44)",
    excerpt: `43, 1, -, -, -, (A4,F#5:mf:12.tenuto), (B1:mf:6.tenuto)
5R
43, 7, -, -, -, -, (F#2:mf:6.tenuto)
5R
43, 13, -, -, -, (F#4,D5:mf:12.tenuto), (B2:mf:6.tenuto)
5R
43, 19, -, -, -, -, (D3:mf:6.tenuto)
5R
43, 25, -, -, -, (G4,E5:mf:12.tenuto), (G#3:mf:6.tenuto)
5R
43, 31, -, -, -, -, (E3:mf:6.tenuto)
5R
43, 37, -, -, -, (F#4,D5:mf:12.tenuto), (D3:mf:6.tenuto)
5R
43, 43, -, -, -, -, (B2:mf:6.tenuto)
5R |`,
  },

  // Diff sanity-check: bar 30 is byte-identical between v6 and v7. The v7
  // changes that actually landed are at bars 28-29 (LH 2nd-half registral
  // spread). The chromatic (E5,G#5) passing dyad I expected at v7's bar 30
  // is actually a v9 change.
  v7: {
    bars: "Bar 28 — LH 2nd-half registral spread (rows 31/34 A3,C#4 → C#4,E4); bar 30 unchanged from v6",
    excerpt: `# ════════ C. CELESTIAL — bars 28,29 LH 2nd-half spread ════════
28, 1, -, -, -, (C#5,E5:pp:18.tenuto), (A1,A2:pp:48s.tenuto)
2R
28, 4, -, -, -, -, (E3:pp:3)
2R
28, 7, -, -, -, -, (A3:pp:3)
2R
# ... beats 10-22 LH continues A-arpeggio ...
28, 25, -, -, -, (A4,C#5:pp:24.tenuto), (A2:pp:3)
2R
28, 28, -, -, -, -, (E3:pp:3)
2R
28, 31, -, -, -, -, (C#4:pp:3)
2R
28, 34, -, -, -, -, (E4:pp:3)
2R
28, 37, -, -, -, -, (A2:pp:3)
2R
28, 40, -, -, -, -, (E3:pp:3)
2R
28, 43, -, -, -, -, (C#4:pp:3)
2R
28, 46, -, -, -, -, (E4:pp:3)
2R |`,
  },

  v8: {
    bars: "Bar 51 — LH chromatic descending E1-D2-C#2-B1-A2-G2-F#2-E2 (replaces v7's G3-D3-B2-G2 voicing)",
    excerpt: `51, 1, -, -, -, (F#4,D5:mf:12.tenuto), (E1:mf:6.tenuto)
5R
51, 7, -, -, -, -, (D2:mf:6.tenuto)
5R
51, 13, -, -, -, (D4,B4:mf:12.tenuto), (C#2:mf:6.tenuto)
5R
51, 19, -, -, -, -, (B1:mf:6.tenuto)
5R
51, 25, -, -, -, (F#4,D5:mf:12.tenuto), (A2:mf:6.tenuto)
5R
51, 31, -, -, -, -, (G2:mf:6.tenuto)
5R
51, 37, -, -, -, (B4,G5:mf:12.tenuto), (F#2:mf:6.tenuto)
5R
51, 43, -, -, -, -, (E2:mf:6.tenuto)
5R |`,
  },

  // Diff sanity-check: bars 48-49 are byte-identical between v8 and v9. The
  // bar-48-49 hidden-octave fix that Round 8 articulated did not land in v9
  // — only in v10. v9's actual changes are at bars 14, 24, 30, 42, 43, 54, 58.
  // Showing bar 42 since it's the most musically significant near the climax.
  v9: {
    bars: "Bar 42 — break parallel sixths with solo top voice b3-4 ((G4,E5) → (E5:9) + D5:3 appoggiatura); bars 48-49 unchanged from v8",
    excerpt: `42, 1, -, -, -, (G4,E5:mf:18.tenuto), (A1:mf:6.tenuto)
5R
42, 7, -, -, -, -, (E2:mf:6.tenuto)
5R
42, 13, -, -, -, -, (A2:mf:6.tenuto)
5R
42, 19, -, -, -, (E4,C#5:mf:6), (C#3:mf:6.tenuto)
5R
42, 25, -, -, -, (E5:mf:9), (E3:mf:6.tenuto)
5R
42, 31, -, -, -, -, (C#3:mf:6.tenuto)
2R
42, 34, -, -, -, (D5:mf:3), -
2R
42, 37, -, -, -, (C#5:mf:12.tenuto), (A2:mf:6.tenuto)
5R
42, 43, -, -, -, -, (E2:mf:6.tenuto)
5R |`,
  },

  v10: {
    bars: "Bars 48-49 (Round 9 graft) — hidden-octave fix at climax: bar 48 row 25 RH (A5,F#6) → (F#5,D6); row 37 G5 → G#5; bar 49 b1 (D5,B5) → (A5,F#6). Applied on the v8 base since v9 did not touch these bars.",
    excerpt: `48, 1, -, -, -, (A4,F#5:mf:12.tenuto), (D2:mf:6.tenuto)
5R
48, 7, -, -, -, -, (A2:mf:6.tenuto)
5R
48, 13, -, -, -, (C#5,A5:mf:12.tenuto), (D3:mf:6.tenuto)
5R
48, 19, -, -, -, -, (F#3:mf:6.tenuto)
5R
48, 25, -, -, -, (F#5,D6:mf:12.tenuto), (A3,C#4:mf:6.tenuto)
5R
48, 31, -, -, -, -, (F#3,A3:mf:6.tenuto)
5R
48, 37, -, -, -, (G#5,E6:mf:12.tenuto), (D3,F#3:mf:6.tenuto)
5R
48, 43, -, -, -, -, (A2,C#3:mf:6.tenuto)
5R |
49, 1, -, -, -, (A5,F#6:f:12.tenuto), (B1:mf:6.tenuto)
5R
49, 7, -, -, -, -, (F#2:mf:6.tenuto)
5R
49, 13, -, -, -, (A4,F#5:f:12.tenuto), (B2:mf:6.tenuto)
5R
49, 19, -, -, -, -, (D3:mf:6.tenuto)
5R
49, 25, -, -, -, (F#4,D5:mf:12.tenuto), (F#3:mf:6.tenuto)
5R
49, 31, -, -, -, -, (D3:mf:6.tenuto)
5R
49, 37, -, -, -, (A4,F#5:mf:12.tenuto), (B2:mf:6.tenuto)
5R
49, 43, -, -, -, -, (F#2:mf:6.tenuto)
5R |`,
  },
};
