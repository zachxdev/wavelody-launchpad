// Iteration record for "The Hidden Heart" — an original solo-piano love
// serenade. F major-pentatonic vocabulary in both hands with a single bar 33
// E♭maj7 modal-mixture exception. Ten versions, eight Gemini critique rounds.
//
// Unlike the Lullaby (which converged via score-level micro-prescriptions),
// this piece's arc is "stop, course-correct, branch, return, finalize":
//
//   v1     — wrong conception (dark Japanese-In horror ambience). REJECTED.
//   v2     — RESET. Reframed as warm F-major-pentatonic ballad.
//   v3-v8  — Gemini critique loop. v7 was the most-praised round; Gemini
//            then reversed itself in v8. Two repeated Gemini pushes were
//            REJECTED across the loop: lower the dynamic floor below mp,
//            and add non-pentatonic melody notes — both would have erased
//            the piece's defining character.
//   v9     — Debussy LH overhaul branch (extended ninth/13th voicings).
//            REJECTED — didn't have the feel.
//   v10    — final. Strict pentatonic in both hands; verifier-enforced.

export type SerenadeIteration = {
  id: string;
  title: string;
  audio: string;
  /** "branch" = visual branch/rejected styling; "main" = on the main path. */
  pathKind: "main" | "branch";
  /** Optional banner above the prescribed/applied grid (used for v1, v2, v9). */
  banner?: { label: string; body: string };
  prescribed: string;
  applied: string;
  /** Optional verbatim Zach reaction quote, rendered as a pull-quote. */
  quote?: { speaker: string; text: string };
};

export const serenadeIterations: SerenadeIteration[] = [
  {
    id: "v1",
    title: "Wrong conception — horror ambience",
    audio: "/showcase/serenade/v1.mp3",
    pathKind: "branch",
    banner: {
      label: "Branch — rejected",
      body:
        "v1 took Gemini's harmonic elaboration literally: Japanese In on C♯ as the primary mode, Kumoi-joshi pivot, Ryo flash at the climax, hexatonic clusters with sfz spikes, and a low C♯ drone holding the texture in place for ~80% of the score. The result wasn't restrained love — it was dark, suspended, ambient. The frame itself was wrong, not the execution.",
    },
    prescribed:
      "Phase A blueprint realised: 52-bar contained lyrical arch (A1 / A2 / t1 / B1 / B2 / t2 / A′ / Z) on C♯, Japanese In primary mode with Kumoi-joshi and Ryo color modes, parallel 4ths in B1, parallel 5ths in t2, low C♯ drone for ~80% of the piece, sfz hexatonic clusters at bars 31 & 34, Ryo flash bars 32–33, fragmented A′ an octave up, coda fading on a high G♯6 ghost note over an open C♯1+G♯1 fifth.",
    applied:
      "Score executed exactly as planned. Listening test failed the brief on conception, not on craft. The drone made the harmony static; the sfz clusters read as spasms rather than passion; the Ryo flash sounded like a quotation from another piece. The piece never inhabited 'love' — it inhabited 'forbidden' alone.",
    quote: {
      speaker: "Zach",
      text:
        "Where is the love? The restraint? It feels more like a dark horror ambience piece than forbidden love.",
    },
  },
  {
    id: "v2",
    title: "RESET — warm ballad with major pentatonic",
    audio: "/showcase/serenade/v2.mp3",
    pathKind: "main",
    banner: {
      label: "Reset point",
      body:
        "Conception switched from C♯ Japanese-In dark-modal to F major-pentatonic warm-ballad. Touchstones: Liszt (Liebestraum), Chopin (nocturne), Debussy (Clair de lune), Ravel (Pavane) — plus the impressionist-piano arrangement style of Chinese cinematic love ballads. The melody draws from the F major-pentatonic gōng mode (F-G-A-C-D); the harmony underneath is warm Western I-vi-IV-V variants. Restraint is rendered as dynamic compression — mp floor, single-bar mf climax — not textural starvation.",
    },
    prescribed:
      "Reset the conception. Forbidden love is not scary; it is tender warmth that can't be released. Build a slow piano love ballad in the warm Western Romantic tradition with East Asian color contributed by major-pentatonic melodic inflection (F gōng: F-G-A-C-D). Form: Intro / Verse 1 / Verse 2 / Bridge / Chorus / Coda. 62 BPM. Dynamic floor mp, single mf bar at the climax.",
    applied:
      "Full reset: 54-bar verse-chorus ballad in F at 62 BPM. RH melody pentatonic throughout; LH eighth-note arpeggios over I-vi-IV-V variants. Climax at bar 41 = single mf bar over an F-major rolled block, immediately back to mp at bar 42. Coda fades on an F(add6) over the lowest octave.",
  },
  {
    id: "v3",
    title: "Gemini loop begins — secondary dominants + bar 33 E♭",
    audio: "/showcase/serenade/v3.mp3",
    pathKind: "main",
    prescribed:
      "Round 1 (on v2): rewrite the chorus to abandon arpeggios for rolled block chords with the RH F6 sustained ('the moment of suspended time'); modulate the bridge through a true pivot rather than a hard cut from F to B♭; reharmonise verse 2 with secondary dominants and chromatic mediants instead of repeating verse 1; treat the climax as textural transformation rather than dynamic increase.",
    applied:
      "All three landed. Bar 33 E♭ chord introduced as a chromatic-mediant 'splash of color' before the chorus return — Gemini will praise this bar for the rest of the loop. Bars 41–42 rewritten as rolled block chords (Gemini: 'masterstroke of contrast, suspended time'). Verse 2 reharmonised with iii / ii substitutions for tonal contrast.",
  },
  {
    id: "v4",
    title: "Bar 6 ii6 substitution — and two guardrail rejections",
    audio: "/showcase/serenade/v4.mp3",
    pathKind: "main",
    prescribed:
      "Round 2: substitute Gm/B♭ (ii6) for the expected Dm (vi) at bar 6 to dodge the I-vi cliché; soften the bridge transition with a common-chord pivot; vary the LH eighth-note pattern in verse 1 to avoid 'metronomic engine'. Plus two pushes that were REJECTED: (1) lower the dynamic floor below mp into p/pp territory because 'mp following an mp floor is not a climax'; (2) introduce non-pentatonic melody notes for 'tension and color' (an E or a B suggested explicitly).",
    applied:
      "Bar 6 ii6 substitution applied; bridge pivot smoothed; LH pattern varied. Both guardrail pushes refused: lowering the floor would erase the warm-ballad character (which is the *whole* reframe from v1), and breaking pentatonic discipline would erase the East Asian color (which is the brief). Restraint as dynamic compression is the design, not a bug.",
  },
  {
    id: "v5",
    title: "New theme hook + LH counter-melody dialogue",
    audio: "/showcase/serenade/v5.mp3",
    pathKind: "main",
    prescribed:
      "Round 3 attacked the verse melody as 'pleasant pentatonic noodling — singable, but forgettable. No hooks, no defining interval, no rhythmic identity.' Prescription: rewrite the main theme with a memorable rhythmic hook (dotted-quarter + 8th + quarter); have the LH answer the RH at end-of-phrase rather than running eighth-notes underneath; give bar 18 the D5-over-Am poignant 11th tension that 'recasts the familiar melody in a more vulnerable light.'",
    applied:
      "Dotted-quarter + 8th + quarter rhythmic hook installed in verses 1 & 2. LH gains a real counter-melody at bars 14, 18, 22 — actual call-and-response with the RH rather than passing tones. Bar 18 D5/Am tension becomes the 'where the piece becomes art' moment Gemini singles out for three rounds running.",
  },
  {
    id: "v6",
    title: "Pentatonic discipline restored at bar 24",
    audio: "/showcase/serenade/v6.mp3",
    pathKind: "main",
    prescribed:
      "Round 4 was mostly polish (vary the LH bar 8, dotted hook integrated into the chorus, F7 voicing in bar 38 widened). The single load-bearing item: a real bug — bar 24 contained an E4 RH melody note, which violates the F-pentatonic vocabulary that the entire piece's identity rests on. Gemini flagged it as 'unforgivable, a betrayal of the piece's core premise.'",
    applied:
      "Bar 24 E4 corrected to a pentatonic note. All other Round 4 polish applied. From here forward the verifier discipline is in the human's head, not yet in code — but the rule is now load-bearing: any non-pentatonic note anywhere in the score is treated as a bug, with one explicit exception (the bar 33 E♭).",
  },
  {
    id: "v7",
    title: "Conceptual win — Gemini capitulates on the dynamic technique",
    audio: "/showcase/serenade/v7.mp3",
    pathKind: "main",
    prescribed:
      "Round 5 was the only round where Gemini explicitly affirmed the design choice it had been pushing back on for three rounds. Specifically: 'The restraint is felt in the refusal to push into forte. The mf is the perfect dynamic. It's full-throated but intimate. Don't let anyone tell you to change it.' Other items: rewrite bar 37's chorus opening LH voicing for richer color; integrate the dotted-quarter hook fully through the chorus instead of switching to scalar passage-work.",
    applied:
      "All landed. The chorus dotted hook is now thematically continuous with the verse — no gear-shift into 'apotheosis passage-work'. Bar 37 LH widened. v7 is the most-praised version of the run; bars 18, 33 and 41 all called out as the score's strongest moments simultaneously.",
  },
  {
    id: "v8",
    title: "Bridge rewritten — and Gemini reverses itself",
    audio: "/showcase/serenade/v8.mp3",
    pathKind: "main",
    prescribed:
      "Round 6 reversed Round 5's capitulation: 'You've mistaken timidity for restraint.' Same dynamic envelope, opposite verdict — classic ceiling oscillation. Substantive prescription: rewrite the bridge entirely (new contrasting thematic material, different rhythmic character, kill the arpeggios for those eight bars to set up the chorus's textural arrival). Plus the recurring drumbeat: lower the dynamic floor below mp.",
    applied:
      "Bridge rewritten with new thematic contour, hymn-like LH block chords on beats 1 and 3, and a more sustained register. Floor-lowering refused again — the affirmed-then-reversed pattern is the diagnostic signal that the loop has run out of structural finds.",
  },
  {
    id: "v9",
    title: "Debussy LH overhaul — branch that didn't land",
    audio: "/showcase/serenade/v9.mp3",
    pathKind: "branch",
    banner: {
      label: "Branch — rejected",
      body:
        "Branched off v7 (not v8). RH byte-identical to v7. LH rebuilt with extended-chord vocabulary in the spirit of Debussy's 'Pagodes' — Fmaj9, Gm11, B♭maj9, C13 progressions; parallel ninths through the bridge; an 8-note Fmaj13 voicing under the bar 41 climax; an Ebmaj13 (with 9 and 13 extensions) at bar 33 instead of v7's E♭maj7. The conception was 'pentatonic gōng melody floats over impressionist parallel-extended-chord harmony' — what Zach had been describing across the run. Round 9 was not pushed to Gemini.",
    },
    prescribed:
      "Branch from v7 with an LH-only overhaul. RH unchanged. LH harmonic vocabulary upgraded to Debussy-impressionist: parallel ninth/eleventh/thirteenth chords, wider register span (LH lives F1–F4), pedal-wash sustain, F1 deep-bass anchor + extended-chord cushion above. Goal: get the piece's harmonic environment closer to Zach's ear, given Gemini had been pulling in different directions for several rounds.",
    applied:
      "All applied. Listened back end-to-end. The richer harmony added impressionist color but lost the warm-ballad clarity that v7 had — the F1 + 8-note Fmaj13 cushion under the bar 41 climax muddied the rolled-block masterstroke. Branch abandoned, not merged forward.",
    quote: {
      speaker: "Zach",
      text: "This one pass didn't give it the feel I wanted.",
    },
  },
  {
    id: "v10",
    title: "Final — strict pentatonic both hands + bar 33 E♭ exception",
    audio: "/showcase/serenade/v10.mp3",
    pathKind: "main",
    prescribed:
      "Return to v7 as the base. RH unchanged again. LH rebuilt a third time with one new constraint: BOTH hands strictly pentatonic. Pitches restricted to {F, G, A, C, D} at any octave — no E, no B, no B♭, no E♭, no sharps — with one explicit single-bar exception at bar 33 (E♭maj7 modal-mixture chord, voiced E♭1 + E♭2 + G3 + D4 — the harmonic moment Gemini had praised across seven critique rounds). LH complexity sourced not from chord-extension stacks (those required non-pentatonic notes) but from rhythmic variety per section, two-voice independence in V2/V3, imitative hook echoes, and wider register exploitation (F1–A4).",
    applied:
      "Discipline enforced programmatically — see verify_lh_pentatonic.py: parses every chord token in V2/V3, whitelists E♭ at bar 33 only, fails on any other accidental or non-pentatonic letter. Verifier currently passes. Density envelope by section: intro ~6 events/bar; V1 ~10; V2 ~13; bridge ~17 (16th-note sweeps); chorus ~14 (block rolls); coda ~6 → ~3. Tempo, length (54 bars × 3.871s ≈ 3:35), and dynamic envelope (mp floor / single-bar mf peak / pp coda) preserved from v7.",
    quote: {
      speaker: "Zach",
      text:
        "This is perfect! It strayed from original request but it turned out to be a good composition.",
    },
  },
];

export const serenadeFinalIteration =
  serenadeIterations[serenadeIterations.length - 1];

export const serenadeNarrativeCallout = {
  title: "Where conception meets execution",
  body:
    "The Lullaby converged via score-level micro-prescriptions and saw a saturation ceiling around v6. The Hidden Heart is qualitatively different: it encountered TWO fundamental conception errors that no amount of score-level critique could fix. v1 was the wrong frame entirely (dark horror ambience instead of warm restrained love); v9 was a beautiful detour that lost the ballad clarity. Both required human re-direction, not Gemini critique. This is the limit of automated score critique: it can refine within a frame but cannot tell you when the frame itself is wrong. The agent's ability to REJECT Gemini's repeated pushes — lower the dynamic floor below mp; add non-pentatonic melody notes — was the load-bearing decision. Honest engineering > applying every prescription.",
};
