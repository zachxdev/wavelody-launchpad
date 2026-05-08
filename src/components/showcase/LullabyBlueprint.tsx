// Phase A blueprint for "The Wandering Lullaby" — the architectural proposal
// the agent wrote BEFORE composing any music. Verbatim from the original task
// transcript (session_id local_a2269947-...). Renders the archetype list, key
// plan, letter→pitch mapping, per-section role descriptions, and the chosen
// MusicDSL feature set.
//
// This is the differentiator narrative for the Lullaby page: the piece was
// architected first, then composed; the score then survived nine rounds of
// critique without re-architecting.

import { Compass } from "lucide-react";

const archetypes: Array<{ letter: string; name: string; description: string }> = [
  {
    letter: "A",
    name: "Lullaby",
    description:
      "Slow, rocking 8th-note bass (compound feel within 4/4); simple stepwise tonic-pedal melody, narrow range, sparse texture.",
  },
  {
    letter: "B",
    name: "Woodland Dance",
    description:
      "Modal-major (Lydian inflection); dotted, jaunty rhythms; woodwind-character single-line tune over a light bouncing bass.",
  },
  {
    letter: "C",
    name: "Celestial",
    description:
      "Harp-style pedaled 16th-note arpeggios spanning two-plus octaves; floating high parallel-sixths melody; lush sustained texture.",
  },
  {
    letter: "D",
    name: "Lyrical Ballad",
    description:
      "Singing parallel-sixths melody with LH counter-melody dialogue; mid-density flowing 8ths.",
  },
  {
    letter: "A′",
    name: "Lullaby Reprise",
    description:
      "Ornamented return — same archetype as A, with parallel-thirds doubling and 16th-note passing tones; hushed coda.",
  },
];

const keyPlan: Array<[string, string, string]> = [
  ["A", "D major", "Home"],
  ["B", "G major", "IV — brighter subdominant lift"],
  ["C", "B minor", "vi — relative minor, dreamy"],
  ["D", "D major", "Return"],
  ["A′", "D major", "Reprise"],
];

const sectionMap: Array<[string, string, string]> = [
  ["A (Lullaby)", "1–12", "12"],
  ["t₁ (D→G pivot)", "13–14", "2"],
  ["B (Woodland Dance)", "15–24", "10"],
  ["t₂ (G→Bm pivot)", "25–26", "2"],
  ["C (Celestial)", "27–38", "12"],
  ["t₃ (Bm→D pivot)", "39–40", "2"],
  ["D (Lyrical Ballad)", "41–52", "12"],
  ["t₄ (cadential)", "53–54", "2"],
  ["A′ (Reprise)", "55–60", "6"],
];

const pitchAxes: Array<[string, string]> = [
  ["A", "melody B4–D5; LH bass D2–A3"],
  ["B", "melody D5–G5; LH bass G2–D4"],
  ["C", "melody F♯5–A5; LH arpeggios B2–B4"],
  ["D", "melody A4–F♯5 (parallel sixths); LH bass D2–D4"],
  ["A′", "melody B4–D6; LH bass D2–D4"],
];

const roles: Array<{ heading: string; rh: string; lh: string }> = [
  {
    heading: "A — Lullaby (mp, sparse, rocking)",
    rh: "Lyrical 4-bar phrase, repeated with variation. Half + dotted-quarter rhythms, narrow stepwise contour, ~2–3 events/bar, all .tenuto.",
    lh: "Rolled D-major triad on beat 1, then root-fifth-third 8th-note rocking (D2–A3-F♯3-A3-F♯3) beats 2–4 — 6/8 lullaby feel inside 4/4. Bass D2 sustained .tenuto.",
  },
  {
    heading: "B — Woodland Dance (mp→mf, light)",
    rh: "Modal-major (G Lydian-inflected) tune, 8th-note stepwise contour with characteristic dotted-8th + 16th lift, ~6 events/bar.",
    lh: "Light \"oompah\" — bass G2/D3 on beats 1+3, mid-register triad (G3,B3,D4) .stac on beats 2+4. 4 events/bar.",
  },
  {
    heading: "C — Celestial (pp w/ sfz peaks, dreamy)",
    rh: "Floating melody in F♯5–A5; half + dotted-quarter, parallel sixths added at phrase peaks (F♯5+A5 → G5+B5). ~2 events/bar.",
    lh: "Continuous 16th-note arpeggios across two octaves, root-5-8-3-5-8 pattern over Bm9 → A → G → D. 16 events/bar — densest texture. Bass root sustained .tenuto.",
  },
  {
    heading: "D — Lyrical Ballad (mf, lyrical peak)",
    rh: "Singing line in parallel sixths (e.g. A4+F♯5 → B4+G5 → A4+F♯5), 4 events/bar, .legato.",
    lh: "Flowing 8th-note arpeggios D2–D4, root-5-8-5 pattern across D–A–Bm–G. 8 events/bar. Mid-register voice (V2) carries occasional counter-melody answering the RH.",
  },
  {
    heading: "A′ — Lullaby Reprise (mp dim. al pp)",
    rh: "A's melody ornamented — parallel thirds doubling, 16th passing tones, octave-up at climax.",
    lh: "Two-octave broken chords D2–D4, root-5-8-3-5 in 8ths. Final two bars: row spacing widened (perceived ritard, since the parser ignores TEMPO markers).",
  },
];

const LullabyBlueprint = () => {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-10">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Compass className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
            Phase A — architecture first
          </div>
          <h3 className="mt-2 font-serif-display text-2xl tracking-tight text-foreground sm:text-3xl">
            The blueprint, before the music
          </h3>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Before any DSL was written, the agent proposed an architectural
            blueprint: the archetype set, the key plan, the letter-pattern
            macro-structure, and per-section LH/RH roles. Only after the
            blueprint was approved did composition begin. What follows is the
            verbatim proposal.
          </p>
        </div>
      </div>

      {/* Archetypes */}
      <div className="mt-10">
        <h4 className="font-serif-display text-lg tracking-tight text-foreground">
          1. Archetype selection &amp; order — four archetypes plus reprise
        </h4>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-card/60">
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  #
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Archetype
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {archetypes.map((a) => (
                <tr key={a.letter} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-3 align-top font-mono text-foreground">
                    {a.letter}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-foreground">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    {a.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground/85">
          Archetypes chosen to span: introspective → light → ethereal →
          emotional → introspective. No martial, no kinetic, no dark.
        </p>
      </div>

      {/* Key plan */}
      <div className="mt-10">
        <h4 className="font-serif-display text-lg tracking-tight text-foreground">
          2. Key plan — single tonal orbit around D major
        </h4>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {keyPlan.map(([letter, key, gloss]) => (
            <li key={letter} className="flex items-baseline gap-3">
              <span className="w-8 shrink-0 font-mono text-foreground">{letter}</span>
              <span className="w-24 shrink-0 font-medium text-foreground">{key}</span>
              <span>{gloss}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground/85">
          Only one modulation (to vi). All transitions via diatonic pivot
          chords.
        </p>
      </div>

      {/* Macro structure */}
      <div className="mt-10">
        <h4 className="font-serif-display text-lg tracking-tight text-foreground">
          3. Letter-pattern macro structure
        </h4>
        <p className="mt-3 font-mono text-xs leading-relaxed text-foreground/90 sm:text-sm">
          A — t₁ — B — t₂ — C — t₃ — D — t₄ — A′
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-card/60">
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Section
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Bars
                </th>
                <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Length
                </th>
              </tr>
            </thead>
            <tbody>
              {sectionMap.map(([section, bars, length]) => (
                <tr key={section} className="border-b border-border/40 last:border-b-0">
                  <td className="px-4 py-3 align-top font-medium text-foreground">
                    {section}
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-muted-foreground">
                    {bars}
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-muted-foreground">
                    {length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs font-medium leading-relaxed text-foreground/90">
          Total: 60 bars at q=72 ≈ 3:20.
        </p>
      </div>

      {/* Letter → pitch axes */}
      <div className="mt-10">
        <h4 className="font-serif-display text-lg tracking-tight text-foreground">
          4. Letter → pitch axis (D-major frame)
        </h4>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
          {pitchAxes.map(([letter, axis]) => (
            <li key={letter} className="flex items-baseline gap-3">
              <span className="w-8 shrink-0 font-mono text-foreground">{letter}</span>
              <span className="font-mono text-foreground/90">{axis}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Per-section roles */}
      <div className="mt-10">
        <h4 className="font-serif-display text-lg tracking-tight text-foreground">
          5. Per-section LH/RH roles
        </h4>
        <div className="mt-5 space-y-5">
          {roles.map((r) => (
            <div
              key={r.heading}
              className="rounded-xl border border-border/60 bg-background/40 p-5"
            >
              <div className="font-mono text-sm font-medium text-foreground">
                {r.heading}
              </div>
              <dl className="mt-3 space-y-2 text-sm leading-relaxed">
                <div className="flex gap-3">
                  <dt className="w-7 shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    RH
                  </dt>
                  <dd className="text-muted-foreground">{r.rh}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-7 shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    LH
                  </dt>
                  <dd className="text-muted-foreground">{r.lh}</dd>
                </div>
              </dl>
            </div>
          ))}
          <p className="text-xs leading-relaxed text-muted-foreground/85">
            Transitions tᵢ: RH descending stepwise scale fragment, LH pivot-chord
            half notes, mp.
          </p>
        </div>
      </div>

      {/* Tempo & DSL feature set */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-background/40 p-5">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Tempo &amp; duration
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Single file-header <span className="font-mono text-foreground">TEMPO: 72</span>.
            All tempo perception via row spacing. Total ~3:20.
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-background/40 p-5">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            MusicDSL features — used vs avoided
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Use</span>: pp/p/mp/mf/f/sfz dynamics; .tenuto/.legato/.stac articulations; chord notation (P1,P2:dyn:dur); V/V2 voices; row-spacing; sustain s flag.
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Avoid</span> (parser drops): sub-row offsets +M/D ~M/D; J/Y/U curves; #tag curves; in-row &lt;TEMPO:…&gt;.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LullabyBlueprint;
