// Iteration record for "Sky Combat" — an original solo-piano virtuosic
// aerial-combat piece. B minor / B major modal mixture, 160 BPM, 120 bars,
// ~3:00. Eight versions; six Gemini critique rounds, then two human-driven
// surgical fixes (v7 and v8) that score-level critique alone never surfaced.
//
// Iteration shape:
//
//   v1     — first pass from the Phase A blueprint. Zach: "boring +
//            repetitive" — the sections were correct, the variation wasn't.
//   v2     — Round 1 critique applied + manual variation push. The piece
//            stops being a draft and starts being a piece.
//   v3-v6  — Gemini critique loop. Round 2-4 each move different sections
//            forward (32nd-note machine-gun bursts, climax cross-rhythm
//            restoration, B Major arpeggio coda, accelerating intro,
//            chromatic LH ostinato, ghostly Lull echoes).
//   v7     — first human-driven surgical pass. v3-v6 still had a broken-
//            disc loop in bars 69-76: the "Islamey" drumming texture was
//            kinetic on the surface but each voice's pitch micro-pattern
//            looped identically across the 8 bars. Per-bar variation
//            installed. Zach: "got fixed up to 1:52 or so and then the
//            same repeating pattern" — caught the broken-disc had moved
//            to the next 8 bars.
//   v8     — second human-driven surgical pass. Same fix at 77-84. Render
//            switches from Salamander to Pianoteq. FINAL.

export type SkyCombatIteration = {
  id: string;
  title: string;
  audio: string;
  /** "branch" = visual branch/partial styling; "main" = on the main path. */
  pathKind: "main" | "branch";
  /** Optional banner above the prescribed/applied grid (used for v1, v4). */
  banner?: { label: string; body: string };
  prescribed: string;
  applied: string;
  /** Optional verbatim Zach reaction quote, rendered as a pull-quote. */
  quote?: { speaker: string; text: string };
};

export const skyCombatIterations: SkyCombatIteration[] = [
  {
    id: "v1",
    title: "Initial composition from Phase A",
    audio: "/showcase/sky-combat/v1.mp3",
    pathKind: "main",
    prescribed:
      "Realise the Phase A blueprint as written: 120-bar through-composed boss-fight arc in B minor / B major modal mixture, 160 BPM, eight sections (Intro / Threat / Lull / Hero / Combat × 5 development episodes / Pre-climax / Climactic Cross-Fire / Coda). Mazeppa parallel thirds in the Threat, unison heroic octaves for Theme B, Rachmaninoff broken-chord storms in Combat, polychord crisis at the main climax, full-keyboard B-Major sweep in the coda.",
    applied:
      "Score executed against the plan. All eight sections present at the right bar counts; cross-overs land where the blueprint specified; the polychord at bar 96 stacks correctly. But the section-internal patterns are too uniform: the intro tremolo is a metronomic 16th-note pulse, the Hero theme lands squarely on the beat, the climax LH chords anchor instead of clashing, the coda sweep is fragmented up-and-down rather than a single ascending gesture. The frame is right; the texture inside the frame is repetitive.",
    quote: {
      speaker: "Zach",
      text: "A bit boring and too many repetitions, okay as first attempt.",
    },
  },
  {
    id: "v2",
    title: "Gemini Round 1 + variation push",
    audio: "/showcase/sky-combat/v2.mp3",
    pathKind: "main",
    prescribed:
      "Round 1 (on v1): rebuild the intro as a gradually-assembling tremolo (B6 alone in bar 1, add F#6 in bar 2, add B5 in bar 3, dissonant C6 'lightning flash'); install dotted-quarter + 8th syncopation across the Hero theme so it pushes against the beat; restore the Neapolitan C6 cross-over stabs; displace the climax LH chords to off-beats (1, 10, 22, 34) for cross-rhythmic chaos; rewrite the coda sweep as a single continuous ascent. Plus a manual variation push on top: parallel thirds → sixths in the Threat for textural relief, four-phase Hero development arc instead of two, sharply differentiated Combat episodes, surprise GP/p-to-ff jolts.",
    applied:
      "All eight Gemini prescriptions landed. The Hero now has heroic momentum instead of feeling hymn-like. The climax has its first taste of cross-rhythmic violence. The intro genuinely 'gathers' instead of switching on. On top, the variation push: Threat thirds become a thirds/sixths alternation; Hero theme expanded into a four-phase development arc; Combat episodes (D1-D5) given distinct rhythmic identities (Winter-Wind cascades / role inversion / Rachmaninoff storms / Islamey drumming / broken-octave tremolo).",
  },
  {
    id: "v3",
    title: "Gemini Round 2 — kinetic refinements",
    audio: "/showcase/sky-combat/v3.mp3",
    pathKind: "main",
    prescribed:
      "Round 2 (on v2): the Islamey drumming bars 69-76 are still 16th notes — must be true 32nd-note machine-gun bursts (dur=1.5 at RES=48, but the parser silently drops fractional beats, so RESOLUTION must be raised to 96 first); replace the on-beat quarter-note bass under the Rachmaninoff storms with a syncopated chromatic line; rewrite bars 6-8 as escalating diminished arpeggios instead of a static tremolo; add octave-leap accents in the Threat; rewrite the coda sweep as one continuous unbroken ascent.",
    applied:
      "RESOLUTION raised from 48 to 96 — a header-level technical fix that unblocked the entire Round 2 prescription set. 32nd-note bursts at bars 69-76 finally have machine-gun violence. Chromatic LH bass installed under the storms. Bars 5-8 escalate via C°7 / C#°7 / D°7 arpeggios climbing in register and dynamic. Climax LH transformation applied. (Two side-effects discovered later: the climax LH would regress in v4, and the coda sweep got rewritten as a chromatic scale rather than an arpeggio.)",
  },
  {
    id: "v4",
    title: "Surgical 3-voice texture for bars 69-76",
    audio: "/showcase/sky-combat/v4.mp3",
    pathKind: "branch",
    banner: {
      label: "Branch · partial fix",
      body:
        "First attempt at fixing the bar-69-76 'broken-disc' feel. The texture skeleton was applied correctly — three rhythmic strata stacked: RH 32nd-note machine-gun cluster, LH bass 32nd-note pulses, LH mid sf stabs. But each voice's pitch content looped identically across all 8 bars: the RH played the same A5/G#5/B5/C6/A#5 cluster bar after bar, only the dynamics shifted. The work led directly to v5 and was kept on the path, but the broken-disc ear-feel was not yet solved at the right level.",
    },
    prescribed:
      "Round 3 (on v3): vary the RH stabs in the Threat (use a 32nd-note run in bar 12, an octave-down leap in bar 18, a 32nd-note cluster in bar 22 — diversify the boss's attacks); add a high-register shimmering arpeggio accompaniment under the Hero so the 'sky' texture doesn't vanish; widen the bar 120 final chord to a 5+ octave grand-piano voicing; restore the chaotic LH cross-rhythm at the climax (had regressed to a single sustained whole-note in v3); stop the v3 chromatic-scale coda and rewrite as a B Major arpeggio. Manually layered on top: build a 3-voice texture skeleton at bars 69-76 to break the visible repetition (RH 32nd-note cluster + LH bass + LH mid sf stabs).",
    applied:
      "Gemini prescriptions landed cleanly: the Boss feels intelligent and varied, the Hero re-inhabits the sky texture, the final chord shatters across 5+ octaves, the climax cross-rhythm restored. The 3-voice 69-76 skeleton was applied — but only the dynamic envelope alternated across bars; the pitch micro-patterns were identical. Reading the actual DSL lines later confirmed: bar 69, bar 70, bar 71 all played the same A5-G#5-B5-C6-A#5 RH sequence. The skeleton was rhythmically right, melodically static. Branch leads directly into v5; the broken-disc ear-feel survives.",
  },
  {
    id: "v5",
    title: "Bug fixes: climax LH regression + coda",
    audio: "/showcase/sky-combat/v5.mp3",
    pathKind: "main",
    prescribed:
      "Round 4 (on v4): the climax LH had regressed to a single sustained whole-note per bar (a 'metronome of doom') — restore the v2 cross-rhythmic displacement (chords on beats 1, 19, 43, 67 — long-short-long-short); the coda sweep had been written as a series of repeated 32nd-notes (B0, B0, B0, B0, D#1, D#1, D#1, D#1...) — rewrite as a true unbroken ascent without repeats; introduce 'flickering' rhythmic irregularity into the bars 1-4 tremolo so the storm doesn't feel mechanical; displace the bar 16/20/24 cross-over stabs onto unpredictable beats.",
    applied:
      "All landed. Climax cross-rhythm restored — bars 93-100 are unhinged again. Coda sweep rewritten as a true ascending B-Major scale (a tonal bug that Round 5 will catch). Bar 1-4 tremolo flickers with a small 32nd-note burst in bar 2 and a stutter in bar 3. The Threat stabs now displace: bar 16 keeps the established beat-91 stab, bar 20 moves it to beat 73, bar 24 to beat 88 — three different attack timings, the Boss stops being predictable.",
  },
  {
    id: "v6",
    title: "Gemini Round 4 — final score-level polish",
    audio: "/showcase/sky-combat/v6.mp3",
    pathKind: "main",
    prescribed:
      "Round 5 (on v5): the v5 'B Major scale' coda is tonally weak — must be a B Major ARPEGGIO (B/D#/F# only, no passing tones) so the gesture says BM TRIUMPH rather than dissolving into atonal wash; install rhythmic acceleration in bars 6-8 (16ths → 16th-note triplets → 32nd notes — the storm must accelerate, not just escalate); diversify the Hero accompaniment with soaring arpeggio flourishes at bars 32, 36, 40, 44; double the rhythmic activity in the pre-climax ramp at bars 85-92 (two chord-stabs per bar, two sweep gestures per bar); the LH under the Islamey drumming needs a chromatic syncopated ostinato instead of an on-beat fragment loop; replace the generic Lull (bars 25-26) with ghostly fragmented echoes of the Boss theme; bridge the bar 44 first peak into the Combat without a full-stop.",
    applied:
      "Bars 6-8 now accelerate (16ths → triplets → 32nds — frantic). Hero gets octave-leap accents at 32/36/40/44. Pre-climax doubled in density at 85-92. LH under bars 69-76 drumming becomes a chromatic syncopated ostinato. Bars 25-26 become ghostly Boss-theme stabs at pp. Bar 44 chord shortened from full-bar to dotted-half with an A#°7 'shadow' filling the final beat. The bar 117-119 coda sweep now ascends in 16th notes (rhythm fixed) but as a B-Major SCALE rather than an arpeggio — Round 5 will catch this, the score-level critique loop has run out of structural finds, and the scale-vs-arpeggio preference would be the next correction in a continuing loop.",
  },
  {
    id: "v7",
    title: "Per-bar variation for bars 69-76 (real fix)",
    audio: "/showcase/sky-combat/v7.mp3",
    pathKind: "main",
    prescribed:
      "Human-driven, not Gemini-driven. v6 sounded ~1:50 of relentless variation, then a perceptible broken-disc loop kicked in around bar 69 — the 8 bars of Islamey drumming. The score-level critique loop had been happy with the kinetic 32nd-note bursts; the ear was not. Fix: each voice's pitch content must develop ACROSS the 8 bars, not loop within them. RH: cluster centre-pitch shifts up a step at bar 70 and again per bar; final two bars (75-76) move up an octave. LH bass: rhythm AND voicing change per bar. LH mid: attack count varies 4 → 4 → 5 → 6 → 1 → 0 → 4 → 4 across the 8 bars (deliberate density envelope, not a fixed pattern).",
    applied:
      "Per-bar variation installed. Bar 69: A5/G#5/B5/C6/A#5 cluster. Bar 70: shifts to B5/A5/C6/D6 (centre-pitch up a step). Bar 71-74: continues stepping. Bars 75-76: cluster moves up an octave. LH mid attack-count envelope holds: 4-4-5-6-1-0-4-4 across the 8 bars (bar 74 is silent in LH-mid — the breath inside the storm). Each voice now a developing TUNE across 8 bars instead of a static loop. Score-diff verified by reading bar 69 vs bar 71 vs bar 76 lines side-by-side.",
    quote: {
      speaker: "Zach",
      text: "Got fixed up to 1:52 or so and then the same repeating pattern.",
    },
  },
  {
    id: "v8",
    title: "Per-bar variation for bars 77-84 + Pianoteq render",
    audio: "/showcase/sky-combat/v8.mp3",
    pathKind: "main",
    banner: {
      label: "Final · Pianoteq render",
      body:
        "Same surgical principle as v7 extended to the next 8-bar episode. v7 had fixed the broken-disc at 69-76; Zach's ear caught that bars 77-84 (broken-octave tremolo) had now become the broken-disc. Tremolo morphs across bars: B5-B6 → A#5-D6 → B5-A6 → F#5-D#6 → G5-D6 → 3-pitch rotation → ascending scale dissolution → sf+silence. LH bass walks F#3 → F3 → E3 → D#3 → D3 → C#3 → C3 → B2 — a chromatic descent that cancels the static ostinato. Render switches from Salamander to Pianoteq 9.1.2 (HB Steinway D Classical). Sky Combat is the first piece composed AND rendered with Pianoteq from final-render onward.",
    },
    prescribed:
      "Human-driven, not Gemini-driven. After v7 the broken-disc moved: the bars 77-84 broken-octave tremolo (which had survived all six Gemini rounds because at score-level it was 'correctly' a B5-B6 shimmer) became the new perceptible loop. Same fix at the next level: morph the tremolo across the 8 bars. Switch the final render from Salamander to Pianoteq for the canonical version.",
    applied:
      "Tremolo morphology installed (RH and LH walking line above). Listening test confirms the broken-disc feel is gone end-to-end; the entire combat development now reads as one continuous 40-bar arc with rising stakes rather than alternating textures with internal loops. Pianoteq 9.1.2 render at -3.99 dBFS peak. The two human-driven passes (v7 and v8) caught what six rounds of score-level critique had missed: kinetic surface texture is not the same as developing material.",
    quote: {
      speaker: "Zach",
      text: "Much better now.",
    },
  },
];

export const skyCombatFinalIteration =
  skyCombatIterations[skyCombatIterations.length - 1];

export const skyCombatNarrativeCallout = {
  title: "Why two of the iteration rounds were human-driven",
  body:
    "Six rounds of Gemini score-level critique drove the piece from a competent draft to a kinetic, varied, structurally complete piano workout. But two perceptible 'broken-disc' loops survived all six rounds — the bars 69-76 Islamey drumming and the bars 77-84 broken-octave tremolo — because at score-level, those passages were 'correctly' kinetic. Both the Gemini critique and the agent's first 3-voice fix attempt (v4) verified the texture skeleton, missed that each voice's micro-pattern looped identically across the 8 bars. Only Zach's ear caught it. Same finding as The Hidden Heart, different register: Hidden Heart's failure mode was conception (horror vs love); Sky Combat's was rendering perception (a score that looks varied can sound looped). Score-level critique can refine within a frame; it cannot tell you when the listener's perceptual frame is different from the score's syntactic frame.",
};
