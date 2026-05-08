// MusicDSL excerpts for the "view score diff" toggles in The Hidden Heart's
// iteration timeline. Each entry is the literal DSL text for the focal-change
// bar(s) of that round, pulled from
// D:/GitHub/MusicDSL/smoke-vN-piano-serenade-east-asian-harmonics-musicdsl.txt
// and verified by diffing against the previous version.

export type SerenadeDslExcerpt = {
  /** Human-readable description of which bars the excerpt shows. */
  bars: string;
  /** Verbatim DSL text. */
  excerpt: string;
};

export const serenadeDslExcerpts: Record<string, SerenadeDslExcerpt | null> = {
  v1: {
    bars: "Bar 31 — sfz hexatonic cluster (the rejected 'horror' moment)",
    excerpt: `# B2 — THE UNSPOKEN FIRE — bars 31-38, hexatonic + Ryo flash
31, 1, <SECTION:B2_UNSPOKEN_FIRE><PHRASE:start>, -, -, (C#5, D5, E5:sfz:6.tenuto), (C#3, F#3:sfz:48s.tenuto)
5R
31, 7, -, -, -, (G#4:p:42.tenuto), -
5R |
32, 1, <PHRASE:ryo_flash>, -, -, (F5:mf:24.tenuto), (D3, G#3:mp:48s.tenuto)
5R
32, 25, -, -, -, (G5:mf:24.tenuto), -
5R |
33, 1, -, -, -, (A#5:mf:24.tenuto), (D#3, G#3:mp:48s.tenuto)
5R
33, 25, -, -, -, (G#5:mf:24.tenuto), -
5R`,
  },

  v2: {
    bars: "Bar 33 — bridge return WITHOUT the E♭ chord (warm-ballad reset)",
    excerpt: `# BRIDGE return — diatonic F-major, no chromatic mediant yet
33, 1, <PHRASE:return>, F, -, (Bb4:mp:12.tenuto), (F2, C3:mp:48s.tenuto)
5R
33, 7, -, -, -, -, (A3:mp:6.legato)
5R
33, 13, -, -, -, (C5:mp:12.tenuto), (C4:mp:6.legato)
5R
33, 19, -, -, -, -, (F4:mp:6.legato)
5R
33, 25, -, -, -, (D5:mp:12.tenuto), (A4:mp:6.legato)
5R
33, 31, -, -, -, -, (F4:mp:6.legato)
5R
33, 37, -, -, -, (F5:mp:12.tenuto), (C4:mp:6.legato)
5R
33, 43, -, -, -, -, (A3:mp:6.legato)`,
  },

  v3: {
    bars: "Bar 33 — chromatic-mediant E♭ chord introduced (Gemini's 'harmonic genius')",
    excerpt: `# E♭ modal-mixture splash — first appearance, will survive every round
33, 1, <PHRASE:return><CHORD:I_F_with_modal_mixture_Eb>, F, -, (Bb4:mp:12.tenuto), (Eb2, Bb3:mp:48s.tenuto)
5R
33, 7, -, -, -, -, (G3:mp:6.legato)
5R
33, 13, -, -, -, (C5:mp:12.tenuto), (Bb3:mp:6.legato)`,
  },

  v4: {
    bars: "Bar 6 — Gm/B♭ (ii6) substituted for the cliché Dm (vi)",
    excerpt: `# Bar 6 — first chord change of verse 1, dodging the I-vi cliché
6, 1, -, Gm/Bb, -, (G4:mp:12.tenuto), (Bb2, F3:mp:48s.tenuto)
5R
6, 13, -, -, -, (A4:mp:12.tenuto), -
5R`,
  },

  v5: {
    bars: "Bar 7 — dotted-quarter + 8th + quarter rhythmic hook",
    excerpt: `# The new theme hook — dotted-quarter / 8th / quarter, the piece's signature
7, 1, <THEME:hook>, F, -, (F5:mp:18.tenuto), (F2, C3:mp:48s.tenuto)
5R
7, 19, -, -, -, (G5:mp:6.legato), (A3:mp:6.legato)
5R
7, 25, -, -, -, (A5:mp:12.tenuto), (C4:mp:6.legato)`,
  },

  v6: null,

  v7: {
    bars: "Bars 41–42 — rolled-block-chord climax (the 'masterstroke of contrast')",
    excerpt: `# Climax — rolled blocks, mf, suspended time. Texture is the climax, not volume.
41, 1, <PHRASE:peak><DYNAMICS:mf><TEXTURE:rolled_block>, -, -, (F6:mf:48s.tenuto), (F2, A2, C3, F3, A3, C4:mf:48s.tenuto)
5R
41, 25, -, -, -, -, (F4, A4, C5:mf:24.tenuto)
5R |
42, 1, <PHRASE:peak2><DYNAMICS:mf><TEXTURE:rolled_block>, -, -, (D6:mf:24.tenuto), (D2, A2, D3, F3, A3:mf:48s.tenuto)
5R
42, 25, -, -, -, (C6:mf:24.tenuto), (D4, F4, A4:mf:24.tenuto)`,
  },

  v8: null,

  v9: {
    bars: "Bar 33 — Ebmaj13 (9, 13 extensions) — Debussy-impressionist branch",
    excerpt: `# v9 — Debussy LH branch. Eb1+Eb2+Bb2+D3+F3+G3+C4 = Ebmaj13 with 9+13
# Result: rich, wide, parallel-ninth pedal-wash. Lost the ballad clarity.
33, 1, <PHRASE:return><CHORD:I_F_with_modal_mixture_Eb><THEME:hook_with_Eb_color>, F, -, (Bb4:mp:18.tenuto), (Eb1, Eb2, Bb2, D3, F3, G3, C4:mp:48s.tenuto)
5R
33, 19, -, -, -, (C5:mp:6.legato), (F4:mp:6.legato)
5R
33, 25, -, -, -, (D5:mp:12.tenuto), (D4:mp:6.legato)`,
  },

  v10: {
    bars: "Bar 33 — strict-pentatonic re-voice with E♭maj7 (E♭1+E♭2+G3+D4)",
    excerpt: `# v10 — only E♭ is non-pentatonic. G and D are 3rd and M7 of E♭ major
# AND members of the F-pentatonic vocabulary. Three voices preserve discipline,
# one voice carries the modal-mixture. Verified by verify_lh_pentatonic.py.
33, 1, <PHRASE:return><CHORD:I_F_with_modal_mixture_Eb><THEME:hook_with_Eb_color>, F, -, (Bb4:mp:18.tenuto), (Eb1, Eb2, G3, D4:mp:48s.tenuto), (F4:mp:18.tenuto)
5R
33, 19, -, -, -, (C5:mp:6.legato), -, (D4:mp:6.legato)
5R
33, 25, -, -, -, (D5:mp:12.tenuto), -, (C4:mp:12.tenuto)
5R
33, 37, -, -, -, (F5:mp:12.tenuto), -, (A3:mp:12.tenuto)`,
  },
};
