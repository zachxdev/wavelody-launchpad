// Phase A blueprint for "Sky Combat". Same three-stage reveal as Hidden Heart,
// with Stage 2 reframed for this piece's distinct narrative: the conception
// landed, the score-level critique loop landed, but two perceptible
// "broken-disc" loops survived all six Gemini rounds and required human-driven
// surgical fixes (v7 and v8) at a level the score-critique never reached.
//
//   Stage 0 — Gemini's elaboration (textures, harmony, form, hand roles)
//   Stage 1 — Claude's Phase A plan (8 sections, 120 bars at 160 BPM)
//   Stage 2 — Two human-driven course corrections (v1 boring → v7/v8 surgical)

import { Compass, Ear, GitBranch, Lightbulb } from "lucide-react";

const stage0Bullets: Array<{ heading: string; body: string }> = [
  {
    heading: "Continuous 16th-note cascades — three named flavours",
    body:
      "Chopin 'Winter Wind' (Op. 25 No. 11) for elemental fury — chromatic 16ths/32nds in a single line covering a wide register. Lisztian 'Mazeppa' parallel thirds (Transcendental Etude No. 4) for the relentless-drive Threat texture. Rachmaninoff broken-chord storms (Prelude Op. 23 No. 2) for climactic peaks — wide-spanning broken chords + octaves spanning a tenth.",
  },
  {
    heading: "Hand cross-overs as dramatic punctuation, not just virtuosity",
    body:
      "The percussive 'stab': RH busy with driving 16ths, LH leaps OVER to hammer a high dissonant chord — a literal musical lightning strike. Thematic inversion: LH crosses over to take a heroic fragment in the high treble. Use sparingly so the gesture stays shocking.",
  },
  {
    heading: "Octave passages — the voice of raw power",
    body:
      "Unison heroic octaves (Liszt B minor Sonata) for the Hero theme — both hands two octaves apart, cuts through the storm. Broken-octave tremolo (Liszt 'Feux Follets') for shimmering tension at high register pp, or full-keyboard ff before a climax.",
  },
  {
    heading: "Repeated-note drumming — used sparingly",
    body:
      "Balakirev 'Islamey' machine-gun bursts on a single pitch (alternating fingers 3-2-1 or 4-3-2-1). One short burst, not a continuous texture — a rhythmic shock, like a sudden energy discharge from the boss.",
  },
  {
    heading: "Key — B minor / B major modal mixture",
    body:
      "B minor's dark sonority pairs with B major's brilliance (5 sharps). The hero's theme lives in this duality — sudden shifts from B minor turmoil to a clear B major chord 'are the musical equivalent of the sun breaking through the clouds'. Threatening harmonies: A#°7→Bm cycle, Neapolitan C major lurch, parallel chromatic dim7 motion, brief B Phrygian. Heroic harmonies: plagal E→B cadences, modal-mixture sun-breaks.",
  },
  {
    heading: "Form — through-composed narrative, not A-B-A",
    body:
      "Standard A-B-A is too neat for a fight. Use 6 sections + 2 transitions, ~3:00: Gathering Storm (intro) → Threat Emerges → Lull → Hero's Stand → Combat (Development) → Pre-climax tension → Climactic Cross-Fire → Coda. Two differentiated peaks: a 'peak of resolve' (Hero clarity, ff) at the centre, and a 'peak of chaos' (texture/density/dissonance, fff) near the end.",
  },
];

const stage1Sections: Array<{ letter: string; name: string; bars: string; gloss: string }> = [
  {
    letter: "I",
    name: "Gathering Storm",
    bars: "1–8",
    gloss: "Low B pedal · pp/mp · high broken-octave tremolo + rising dim7 arpeggio",
  },
  {
    letter: "A",
    name: "Threat Emerges",
    bars: "9–24",
    gloss: "Mazeppa thirds RH · mf/f · jagged Boss theme LH + Neapolitan C6 stabs",
  },
  {
    letter: "t1",
    name: "Lull",
    bars: "25–28",
    gloss: "Texture thins · mp · breath before Hero",
  },
  {
    letter: "B",
    name: "Hero's Stand",
    bars: "29–44",
    gloss: "Unison heroic octaves · f/ff · B Major modal mixture, FIRST PEAK",
  },
  {
    letter: "D",
    name: "Combat (Development)",
    bars: "45–84",
    gloss: "5 episodes · Winter-Wind / role-inversion / Rachmaninoff / Islamey / broken-oct tremolo",
  },
  {
    letter: "t2",
    name: "Pre-climax",
    bars: "85–92",
    gloss: "Chromatic dim7 climb LH + full-keyboard sweeps RH · f → fff",
  },
  {
    letter: "X",
    name: "Climactic Cross-Fire",
    bars: "93–108",
    gloss: "Polychord crisis · fff · 3 cross-overs/bar at 101-104, MAIN PEAK",
  },
  {
    letter: "C",
    name: "Coda",
    bars: "109–120",
    gloss: "Triumphant B Major · pp→fff · ascending sweep + 5+ octave final hammer",
  },
];

const stage2Loop1: Array<[string, string]> = [
  ["Symptom (v1)", "All eight sections present, all virtuosic textures present, all cross-overs land. Sounds repetitive."],
  ["What the score had", "Same Mazeppa thirds wave-shape every 2 bars. Hero on the beat. Climax LH anchored. Coda fragmented up-and-down."],
  ["Diagnosis (Round 1)", "Section-internal patterns are uniform. Frame is right; texture inside the frame needs variation."],
  ["Fix (v2)", "Gradual intro assembly, dotted-quarter Hero syncopation, off-beat climax LH cross-rhythm, single ascending coda. Plus manual: parallel thirds → sixths variation, four-phase Hero arc, 5 distinct Combat episodes."],
];

const stage2Loop2: Array<[string, string]> = [
  ["Symptom (v6)", "Six rounds of score-level critique landed cleanly. Listening test: ~1:50 of relentless variation, then a perceptible broken-disc loop kicks in at bar 69 — the 8 bars of Islamey drumming."],
  ["What Gemini saw", "The 32nd-note machine-gun bursts are correctly kinetic. The texture skeleton is right. No score-level critique flagged the section as repetitive."],
  ["What the ear heard", "Each voice's pitch micro-pattern looped identically across 8 bars. The dynamic envelope alternated, the pitch content did not. Score-correct ≠ ear-correct."],
  ["Fix (v7)", "Per-bar variation: RH cluster centre-pitch shifts up a step at bar 70, octave-up at bars 75-76. LH bass rhythm AND voicing change per bar. LH mid attack-count envelope: 4-4-5-6-1-0-4-4 (deliberate density curve, including a silent bar 74)."],
  ["Symptom (after v7)", "Zach: 'got fixed up to 1:52 or so and then the same repeating pattern' — the broken-disc had moved to bars 77-84 (broken-octave tremolo)."],
  ["Fix (v8 — final)", "Same surgical principle one section later. Tremolo morphs across the 8 bars instead of looping; LH walks chromatically F#3 → F3 → E3 → D#3 → D3 → C#3 → C3 → B2."],
];

const SkyCombatBlueprint = () => {
  return (
    <div className="space-y-12">
      {/* Page-level intro */}
      <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
              Phase A — architecture before the music
            </div>
            <h3 className="mt-2 font-serif-display text-2xl tracking-tight text-foreground sm:text-3xl">
              How this piece's conception was negotiated
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Gemini elaborated on the textural and harmonic resources of the
              virtuosic-aerial-combat tradition before any composition began.
              Claude wrote a section-by-section Phase A plan against that
              elaboration. v1 realised the plan faithfully — and the plan was
              right. The course corrections came later, at a level the score-
              critique loop never reached. Three stages, in order.
            </p>
          </div>
        </div>
      </div>

      {/* Stage 0 — Gemini's elaboration */}
      <section className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
              Stage 0 — Gemini's elaboration
            </div>
            <h4 className="mt-2 font-serif-display text-xl tracking-tight text-foreground sm:text-2xl">
              Named techniques, harmonic vocabulary, narrative form
            </h4>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Asked to elaborate on virtuosic textures, harmonic vocabulary,
              form, and hand roles for an aerial-combat boss-fight piano piece,
              Gemini returned a detailed compositional specification — each
              recommended texture grounded in a named etude. Excerpted bullets:
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stage0Bullets.map((b) => (
            <div
              key={b.heading}
              className="rounded-xl border border-border/60 bg-background/40 p-5"
            >
              <div className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-foreground">
                {b.heading}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {b.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs leading-relaxed text-muted-foreground/85">
          Source: <span className="font-mono text-foreground/80">boss_fight_gemini_elaboration.txt</span>.
          Excerpted; emphasis preserved.
        </p>
      </section>

      {/* Stage 1 — Claude's Phase A plan */}
      <section className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GitBranch className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
              Stage 1 — Claude's Phase A plan
            </div>
            <h4 className="mt-2 font-serif-display text-xl tracking-tight text-foreground sm:text-2xl">
              120 bars at 160 BPM, 8 sections, two differentiated peaks
            </h4>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Working from Gemini's elaboration, Claude wrote the section list,
              bar-mapping, cross-over choreography, and per-section LH/RH role
              descriptions that v1 would compose against. Letter macro:{" "}
              <span className="font-mono text-foreground">
                I-I A-A-A-A B-B-B-B D-D-D-D-D X-X-X C-C
              </span>
              . Range B1–B6 standard, with sweeps reaching A0–E7 at climaxes
              for "altitude". Cross-over choreography: bars 16/20/24 (Boss
              stabs), 40 (Hero answer), 56/63/66 (Combat), 101-104 (climax
              barrage).
            </p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border/60">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-card/60">
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Section
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Bars
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Texture · dynamic · function
                </th>
              </tr>
            </thead>
            <tbody>
              {stage1Sections.map((s) => (
                <tr key={s.letter} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-3 align-top font-mono text-foreground">
                    {s.letter}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-foreground">
                    {s.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top font-mono text-muted-foreground">
                    {s.bars}
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {s.gloss}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground/85">
          LH role: low-register rhythmic ostinatos, bass anchor, often the main
          thematic material. RH role: high-register cascades, shimmering
          tremolos, parallel thirds/sixths. Hands unify for unison heroic
          octaves and dense interlocking climax chords. Source:{" "}
          <span className="font-mono text-foreground/80">boss_fight_phase_a_plan.md</span>.
        </p>
      </section>

      {/* Stage 2 — Two human-driven course corrections */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6 sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
            <Ear className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/90">
              Stage 2 — Two human-driven course corrections
            </div>
            <h4 className="mt-2 font-serif-display text-xl tracking-tight text-foreground sm:text-2xl">
              The score was right. The ear caught what score-critique missed.
            </h4>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Eight versions; six rounds of Gemini score-level critique drove
              the piece from a competent draft to a kinetic, varied workout.
              But two human-driven passes were load-bearing — the kind of
              correction that score-level critique alone never surfaced. The
              same lesson as The Hidden Heart, in a different register: there
              the failure mode was conception (horror vs love); here, it's
              rendering perception (a score that looks varied can sound looped).
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-amber-500/30 bg-background/40 p-5">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
              Correction 1 — v1 was "boring + repetitive"
            </div>
            <h5 className="mt-2 font-serif-display text-lg tracking-tight text-foreground">
              Section-internal patterns needed variation
            </h5>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed">
              {stage2Loop1.map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <span className="w-32 shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {k}
                  </span>
                  <span className="text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-background/40 p-5">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-amber-300">
              Correction 2 — v6 had "broken-disc" loops the ear could hear
            </div>
            <h5 className="mt-2 font-serif-display text-lg tracking-tight text-foreground">
              Per-bar pitch development inside kinetic textures
            </h5>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed">
              {stage2Loop2.map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <span className="w-32 shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {k}
                  </span>
                  <span className="text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <blockquote className="mt-6 rounded-lg border-l-2 border-amber-400/60 bg-background/40 px-5 py-3 text-sm italic leading-relaxed text-foreground/90">
          "Got fixed up to 1:52 or so and then the same repeating pattern."
          <span className="mt-1 block not-italic text-xs uppercase tracking-[0.18em] text-muted-foreground">
            — Zach, after listening to v7
          </span>
        </blockquote>
      </section>
    </div>
  );
};

export default SkyCombatBlueprint;
