// Phase A blueprint for "The Hidden Heart". Differentiated from the other
// pieces by a NEW first step: Gemini elaborated on the harmonic palette
// BEFORE Claude composed. This component renders the three-stage reveal of
// that process:
//
//   Stage 0 — Gemini's harmonic elaboration (initial recommendation)
//   Stage 1 — Claude's Phase A plan (architecture from Gemini's elaboration)
//   Stage 2 — The reframe (after v1 listening test failed the brief)
//
// The three stages are the editorial point of the page: the piece's
// conception was negotiated, not assumed. Gemini gave a frame; Claude
// committed to it; v1 audio falsified it; Zach reframed; v2 onward live in
// the new frame.

import { Compass, GitBranch, Lightbulb, RotateCcw } from "lucide-react";

const stage0Bullets: Array<{ heading: string; body: string }> = [
  {
    heading: "Tonic: C♯",
    body:
      "Black-key pentatonic on a grand piano gives a 'naturally warmer, more mellow sound than the white keys'. Low C♯ has a profound bell-like sustain perfect for the drone-tonic device.",
  },
  {
    heading: "Primary mode — Japanese In on C♯",
    body:
      "C♯ – D – F♯ – G♯ – A. Anhemitonic pentatonic with two semitones (C♯-D, G♯-A); avoids the leading tone, prevents goal-oriented Western cadences. 'Floating, yearning' — ideal for restrained, unresolved passion.",
  },
  {
    heading: "Color modes — Kumoi-joshi & Ryo",
    body:
      "Kumoi-joshi (C♯-D♯-E-G♯-A♯) for memory-of-a-stolen-glance dreamlike passages. Ryo / Lydian-pentatonic (raised 4) for ONE moment only — the 'blinding flash of revealed emotion' at the climax, before suppression returns.",
  },
  {
    heading: "Voice-leading — parallel 4ths/5ths, drone tonic, hexatonic clusters",
    body:
      "Parallel 4ths/5ths render the 'formal distance' between the lovers harmonically. Drone tonic (low C♯ or open C♯-G♯) anchors the 'unchanging oppressive reality'. Hexatonic clusters (In + foreign E-natural) for sharp, poignant peaks of compressed passion.",
  },
  {
    heading: "Form — Contained Lyrical Arch (A → B → A′)",
    body:
      "Through-composed single emotional arc. A: Hidden Space (drone + hesitant single line). B: Unspoken Fire (parallel 4ths chords, hexatonic clusters at peaks, controlled forte). A′ / Coda: Resignation. End on an open fifth or single high C♯ that fades — the piece does NOT cadence.",
  },
  {
    heading: "Hand roles — Western Romantic textures, East Asian pitch content",
    body:
      "LH = the unchanging world (drone, slow widely-spaced Chopin-esque arpeggios built from In-scale notes). RH = the passionate heart (hesitant lyrical line in restrained sections; harmonized in 4ths/5ths at the climax). The 'what' is East Asian; the 'how' is Western.",
  },
];

const stage1Sections: Array<{ letter: string; name: string; bars: string; gloss: string }> = [
  {
    letter: "A1",
    name: "Hidden Gaze",
    bars: "1–10",
    gloss: "C♯ In · ppp/pp · drone + single line",
  },
  {
    letter: "A2",
    name: "First Touch",
    bars: "11–18",
    gloss: "C♯ In · pp/p · drone + slow arpeggio pickup",
  },
  {
    letter: "t1",
    name: "Held Breath",
    bars: "19–20",
    gloss: "Kumoi pivot · ppp · modal-mixture cluster",
  },
  {
    letter: "B1",
    name: "Whispered Confession",
    bars: "21–30",
    gloss: "In + Kumoi · p/mp · parallel 4ths, slow chord rise",
  },
  {
    letter: "B2",
    name: "The Unspoken Fire",
    bars: "31–38",
    gloss: "Ryo flash + hexatonic · mp/mf w/ sfz spikes",
  },
  {
    letter: "t2",
    name: "The Falling",
    bars: "39–40",
    gloss: "In descent · p/pp · parallel 5ths sliding home",
  },
  {
    letter: "A′",
    name: "Resigned Farewell",
    bars: "41–50",
    gloss: "C♯ In · pp/ppp · fragmented theme, higher octave",
  },
  {
    letter: "Z",
    name: "Frozen in Time (coda)",
    bars: "51–52",
    gloss: "Open 5th · ppp · single high C♯, fade to silence",
  },
];

const stage2RowsBefore: Array<[string, string]> = [
  ["Tonic", "C♯"],
  ["Primary mode", "Japanese In (C♯-D-F♯-G♯-A) — anhemitonic, no leading tone"],
  ["Form", "A → B → A′ contained lyrical arch (52 bars)"],
  ["Restraint", "Textural starvation — drone + silence + ppp dynamic floor"],
  ["Climax", "sfz hexatonic clusters + Ryo flash (G-natural raised-4)"],
  ["Reading after v1 audio", "Dark, suspended, ambient. The forbidden, none of the love."],
];

const stage2RowsAfter: Array<[string, string]> = [
  ["Tonic", "F (warm Western Romantic)"],
  ["Primary mode", "F major-pentatonic gōng (F-G-A-C-D) — melodic vocabulary, both hands"],
  ["Form", "Intro / Verse 1 / Verse 2 / Bridge / Chorus / Coda (54 bars)"],
  ["Restraint", "Dynamic compression — mp floor, single-bar mf climax, no ppp until coda"],
  ["Climax", "Rolled-block chordal arrival (texture, not volume) — bars 41-42"],
  [
    "Touchstones",
    "Liszt (Liebestraum), Chopin (nocturne), Debussy (Clair de lune), Ravel (Pavane) + impressionist piano arrangement style of Chinese cinematic love ballads",
  ],
];

const SerenadeBlueprint = () => {
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
              Phase A — blueprint before the music
            </div>
            <h3 className="mt-2 font-serif-display text-2xl tracking-tight text-foreground sm:text-3xl">
              How this piece's conception was negotiated
            </h3>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Unlike the other two pieces, this one's harmonic palette was
              proposed by Gemini before Claude composed any music. Claude wrote
              its Phase A plan against that proposal; v1 was the proposal
              realised. The v1 listening test failed the brief, and the
              conception was reframed before composition continued. Three
              stages, in order.
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
              Stage 0 — Gemini's harmonic elaboration
            </div>
            <h4 className="mt-2 font-serif-display text-xl tracking-tight text-foreground sm:text-2xl">
              The harmonic palette, recommended before any composition
            </h4>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Asked to elaborate on East Asian harmonic resources for a
              forbidden-love serenade, Gemini returned a detailed harmonic
              proposal: scales, voice-leading devices, a form, a tonic, and a
              hand-role plan. Excerpted bullets:
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
          Source: <span className="font-mono text-foreground/80">serenade_gemini_elaboration.txt</span>.
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
              Architecture committed against Gemini's frame
            </h4>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Working from Gemini's elaboration, Claude wrote the section list,
              key plan, letter-pattern, and per-section LH/RH role descriptions
              that v1 would compose against. The form Gemini suggested (A → B →
              A′) was expanded into eight micro-sections so the emotional beats
              would have space to register at the slow tempo.
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
                  Mode · dynamic · texture
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
          LH role across the score: drone tonic + slow Chopin-esque arpeggios
          built from In-scale notes; RH role: hesitant lyrical line, harmonized
          in 4ths/5ths only at the central climax. Source: Phase A plan in the
          original task transcript.
        </p>
      </section>

      {/* Stage 2 — The reframe */}
      <section className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6 sm:p-10">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/90">
              Stage 2 — The reframe
            </div>
            <h4 className="mt-2 font-serif-display text-xl tracking-tight text-foreground sm:text-2xl">
              v1 audio falsified the conception. Reset the frame.
            </h4>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              v1 was Stages 0 + 1 executed faithfully. The listening test
              failed the brief on conception, not on craft. Forbidden love is
              not scary — it's tender warmth that can't be released. The dark
              In/Kumoi modal coloring rendered the forbidden, but never the
              love. Conception switched from C♯ Japanese-In dark-modal to F
              major-pentatonic warm-ballad; from textural-starvation restraint
              to dynamic-compression restraint.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-background/40 p-5">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Frame v1 (committed, then falsified)
            </div>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed">
              {stage2RowsBefore.map(([k, v]) => (
                <li key={k} className="flex gap-3">
                  <span className="w-32 shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
                    {k}
                  </span>
                  <span className="text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-primary/30 bg-background/40 p-5">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
              Frame v2 (the reframe — onward to v10)
            </div>
            <ul className="mt-3 space-y-3 text-sm leading-relaxed">
              {stage2RowsAfter.map(([k, v]) => (
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
          "Where is the love? The restraint? It feels more like a dark horror
          ambience piece than forbidden love."
          <span className="mt-1 block not-italic text-xs uppercase tracking-[0.18em] text-muted-foreground">
            — Zach, after listening to v1
          </span>
        </blockquote>
      </section>
    </div>
  );
};

export default SerenadeBlueprint;
