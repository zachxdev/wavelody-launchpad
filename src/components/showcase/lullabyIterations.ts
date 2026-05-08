// Iteration record for "The Wandering Lullaby" — an original lyrical-fantasy
// piano medley. Ten versions, nine Gemini critique rounds. The framework was
// "apply ALL of Gemini's prescriptions every round" until the critique stopped
// finding structural issues. Real ROI was v1→v6; v7 was the last polish round;
// v8/v9 saw Gemini begin reversing prior prescriptions; v10 is a deliberate
// curated cut (v8 base + Round 9's bar 48-49 hidden-octave fix + raised
// dynamic floors).

export type LullabyIteration = {
  id: string;
  title: string;
  audio: string;
  prescribed: string;
  applied: string;
};

export const lullabyIterations: LullabyIteration[] = [
  {
    id: "v1",
    title: "Initial composition from Phase A blueprint",
    audio: "/showcase/lullaby/v1.mp3",
    prescribed: "n/a — initial composition from the Phase A blueprint.",
    applied:
      "Baseline A-B-C-D-A' medley realised: Lullaby, Woodland Dance, Celestial, Lyrical Ballad, ornamented reprise. All four pivot transitions in place; parallel sixths in C and D; sfz peak at bar 31.",
  },
  {
    id: "v2",
    title: "Big move: Section D recast as transform of Section B",
    audio: "/showcase/lullaby/v2.mp3",
    prescribed:
      "Round 1's headline structural prescription: recast Section D's melody as a thematic transformation of Section B's Woodland Dance, sung in the slow legato parallel-sixth ballad style. The reasoning: A, C, and D already share a lyrical quality while B feels thematically isolated; transforming B's tune into D's voice would unify the medley from a sequence of scenes into a single emotional arc — Section D becomes a 'grand, nostalgic remembrance of the dance' rather than just another beautiful tune.",
    applied:
      "Section D's twelve bars (41–52) rewritten as a slow, sixths-harmonised transformation of the Woodland Dance theme. Pivot transitions and other sections kept intact.",
  },
  {
    id: "v3",
    title: "Voicing and dissonance polish across all sections",
    audio: "/showcase/lullaby/v3.mp3",
    prescribed:
      "Round 2 shifted from structural to surface polish: warm bar 2's Bm with a third; replace the weak G–F♯–E line in bar 11 with a 4-3 suspension figure; clean the C♯5/D4 clash in bar 22; enrich bar 38's A7 to A9; add stepwise contour to Section D's left-hand counter-line (bars 43, 44, 47); soften bar 45's parallel-sixth into a more expressive M7; sustain bar 54's leading tone into the reprise; vary bar 57's LH; and respell the final bar 60 as an open Dmaj9.",
    applied:
      "All nine prescriptions applied — Bm voicing, bar-11 melody, bar-22 cleanup, A9 dominant, Section D counter-line shaping, bar-45 dyad, sustained C♯, varied bar-57 LH, and the open Dmaj9 close.",
  },
  {
    id: "v4",
    title: "Celestial section gets a melody; t1 gets shape",
    audio: "/showcase/lullaby/v4.mp3",
    prescribed:
      "Round 3 targeted Section C's directionlessness and t1's blandness: harmonise bars 27–30 in parallel sixths from the start (instead of bare melody), drop the sfz at bar 31 to a gentler p-tenuto, sharpen bar 38's dominant pull to D with a clear leading tone, push bar 48 to its highest point (F♯6) for a real climax, soften the bar-45 M7 dissonance, substitute Em7 for G in bar 51 for harmonic freshness, shape the bar-14 t1 melody, and add parallel thirds to the reprise ornaments in bars 55–56.",
    applied:
      "All prescriptions applied. Section C now sings in sixths from bar 27; bar 31's sfz softens to p; bar 48 reaches F♯6; reprise picks up parallel thirds.",
  },
  {
    id: "v5",
    title: "Section C breathes; t3 reharmonised to Gmaj7",
    audio: "/showcase/lullaby/v5.mp3",
    prescribed:
      "Round 4 zeroed in on Section C's rhythmic monotony (twelve bars of half notes) and the awkward D7 at bar 39: rewrite bars 27–32 with dotted-quarter / eighth / quarter patterns to make the melody breathe; replace bar 39's D7 with Gmaj7 as a true pivot; restore the broken LH rocking pattern at bars 8 and 12; add a counter-melody to Section D's LH (bars 41, 43, 44); soften bar 45's chromatic; smooth bar 58's bass; thicken the final D-major chord at bar 60.",
    applied:
      "All prescriptions applied — Section C breathes rhythmically; bar 39 becomes Gmaj7; LH rocking restored; Section D LH gains a stepwise counter-line.",
  },
  {
    id: "v6",
    title: "Last big structural fix: bar 43 chromatic LH ascent",
    audio: "/showcase/lullaby/v6.mp3",
    prescribed:
      "Round 5's flagship fix: rewrite bar 43's LH as a smooth ascending stepwise line (E–F♯–G♯–A) into bar 44, replacing the unmotivated G♯3 leap that disrupted Section D's counter-melody. Plus: arpeggiate the static bar-14 D7; thicken bar 22's V chord; vary the Section C arpeggio at bar 28; smooth bar 44 into A-major harmony; invert bar 51's LH for clarity; replace bar 58's pre-cadential half-notes with a lyrical descending sequence in thirds; add a neighbour-tone figure to bar 59.",
    applied:
      "All prescriptions applied. Bar 43's chromatic line and bar 58's descending thirds become defining moments — Gemini will praise both in the next round.",
  },
  {
    id: "v7",
    title: "Polish round — bar 30 chromatic dyad, bar 51 chromatic bass",
    audio: "/showcase/lullaby/v7.mp3",
    prescribed:
      "Round 6 was the last polish pass. The critique started reversing earlier prescriptions: rewrite bar 14 again (this time as a clean A7 V/IV outline); end Section B more confidently with B4 instead of D4 at bar 24; revoice bar 43's LH yet again (now to E–F♯–G♯–A); add a brief solo break in bar 42 to differentiate D from C; activate bar 54's sustained C♯ with a small turn figure; enrich bar 58 with a cadential 6/4; insert a chromatic E5/G♯5 passing dyad at bar 30 to soften a leap.",
    applied:
      "All prescriptions applied. Bar 30's chromatic dyad and bar 51's chromatic bass descent become the moments Gemini singles out as the score's strongest in subsequent rounds.",
  },
  {
    id: "v8",
    title: "Convergence ceiling: critique starts reversing itself",
    audio: "/showcase/lullaby/v8.mp3",
    prescribed:
      "Round 7 found no structural problems. The suggestions are micro-touches and partial reversals of earlier rounds: vary bar 8 with a melodic lift; add an upward skip in bar 21; break the LH arpeggio monotony at bar 32; replace the static repetition at bar 37; revisit bar 44 (yet again — now A2 instead of C♯3); flag a hidden octave between bars 48–49; add a paired-eighth inner voice to bar 51's chromatic bass; introduce a siciliano rhythm at bar 58.",
    applied:
      "All prescriptions applied. The critique's flavour has shifted from 'fix this' to 'try this' — diminishing returns are visible in the score.",
  },
  {
    id: "v9",
    title: "Diminishing returns — bar 48–49 hidden octave flagged",
    audio: "/showcase/lullaby/v9.mp3",
    prescribed:
      "Round 8 echoed Round 7's ceiling — most issues were already-addressed surface tweaks (bar-8 phrase ending, bar-37 repetition, another bar-44 revoicing, bar-48-49 hidden-octave fix, bar-51 inner-voice paired eighths, bar-58 siciliano rhythm). The real headline was the bar 48-49 hidden octave between outer voices weakening the climax — the only prescription that actually adds new musical information.",
    applied:
      "All prescriptions applied. In hindsight only the bar 48–49 fix had real ROI; the rest were the loop's noise floor.",
  },
  {
    id: "v10",
    title: "v10 (surgical) — final cut",
    audio: "/showcase/lullaby/v10.mp3",
    prescribed:
      "The composer stopped applying Gemini wholesale. v10 takes v8 as its base, surgically grafts only the bar 48–49 hidden-octave fix from Round 9, and raises dynamic floors across the whole score. The 'critique-everything-then-curate' loop ends here — taste over compliance once Gemini's ROI flatlined.",
    applied:
      "Curated v8 + bar 48–49 hidden-octave fix + raised dynamic floors. No other Round 9 prescriptions adopted. 60 bars at q=72, 865 notes, 3:26.",
  },
];

export const lullabyFinalIteration =
  lullabyIterations[lullabyIterations.length - 1];

export const lullabySaturationCallout = {
  title: "Where the loop saturated",
  body:
    "Real critique ROI ran v1 through v6. Round 1 produced the only true structural rewrite (Section D as a transform of Section B). Rounds 2–5 were dense bar-level polish. By Round 4–5 Gemini began reversing its own prior prescriptions — bar 14, bar 22, bar 44, bar 45 each got re-prescribed two or three different ways. Rounds 7–9 hit a convergence ceiling: micro-touches, repeated revoicings, and one genuinely useful catch (the bar 48–49 hidden octave). v10 abandoned wholesale acceptance and curated.",
};
