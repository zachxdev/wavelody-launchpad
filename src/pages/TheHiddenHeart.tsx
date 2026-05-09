import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import SerenadeBlueprint from "@/components/showcase/SerenadeBlueprint";
import { useReveal } from "@/hooks/useReveal";

const sections: Array<{ letter: string; name: string; note: string }> = [
  { letter: "I", name: "Intro", note: "Sparse RH single-line over open-fifth pentatonic drones" },
  { letter: "V1", name: "Verse 1", note: "Dotted-quarter + 8th + quarter rhythmic hook over LH eighth-note arpeggios" },
  { letter: "V2", name: "Verse 2", note: "Same melody reharmonised — bar 18's D5/Am 11th-tension is the heart of the piece" },
  { letter: "B", name: "Bridge", note: "Modulates F → B♭ and back; bar 33 E♭maj7 modal-mixture splash" },
  { letter: "C", name: "Chorus", note: "RH soars to F6; bars 41–42 abandon arpeggios for rolled-block-chord climax (mf)" },
  { letter: "Coda", name: "Coda", note: "Fragmented hook descending to an F(add6) over the lowest octave" },
];

const TheHiddenHeart = () => {
  const descRef = useReveal<HTMLDivElement>();
  const sectionsRef = useReveal<HTMLDivElement>();
  const blueprintRef = useReveal<HTMLDivElement>();
  const orchestralRef = useReveal<HTMLDivElement>();
  const ctaRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav
        rightLink={{ to: "/the-hidden-heart/iterations", label: "How it was made" }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center px-6 pt-[52px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(173_80%_40%_/_0.10),_transparent_60%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Showcase
          </Link>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Wavelody showcase · piece III
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            The Hidden Heart
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            An original solo piano love serenade — hidden warmth that can't
            release.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <AudioPlayer
              src="/showcase/serenade/v10-pianoteq.mp3"
              label="v10 — The Hidden Heart"
              durationHint="3:35"
              variant="hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              Rendered with Pianoteq 9 physical-modeling engine (Hamburg Steinway D).
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Solo piano · F major · 54 bars at q=62 · 3:35
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="px-6 py-20">
        <div ref={descRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            About the piece
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              An original slow piano serenade in the warm Western Romantic
              ballad tradition, drawing on East Asian — specifically the gōng
              / major-pentatonic — <em>melodic</em> vocabulary as color.
              Pentatonic discipline holds across both hands; restraint is
              rendered as dynamic compression, a single mf bar that swells out
              and back into mp before the listener can lean in. The piece is
              hidden warmth that can't release.
            </p>
            <p>
              F major tonal center, melody and accompaniment both drawn from
              the F major-pentatonic anhemitonic scale (gōng mode:{" "}
              <span className="font-mono text-foreground">F-G-A-C-D</span>),
              with a single bar 33 modal-mixture exception — an{" "}
              <span className="font-mono text-foreground">E♭maj7</span> anchor
              for harmonic punctuation. Form: Intro — Verse 1 — Verse 2 —
              Bridge — Chorus — Coda. Pentatonic discipline is verifier-
              enforced in v10: an automated check fails the score if any
              pitch outside <span className="font-mono text-foreground">{"{F, G, A, C, D}"}</span>{" "}
              appears in the LH outside bar 33.
            </p>
          </div>

          {/* Section list */}
          <div ref={sectionsRef} className="reveal mt-10 space-y-3">
            {sections.map((s) => (
              <div
                key={s.letter}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-nowrap"
              >
                <span className="w-12 shrink-0 font-mono text-sm text-muted-foreground">
                  {s.letter}.
                </span>
                <span className="font-serif-display text-lg tracking-tight text-foreground">
                  {s.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  — {s.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase A blueprint — 3-stage reveal (the differentiator for this piece) */}
      <section className="px-6 pb-20">
        <div ref={blueprintRef} className="reveal mx-auto max-w-4xl">
          <SerenadeBlueprint />
        </div>
      </section>

      {/* Orchestral showcase — one score, three realizations */}
      <section className="px-6 pb-20">
        <div ref={orchestralRef} className="reveal mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-8 md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Orchestral showcase
            </div>
            <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
              One score, three realizations
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
              The same 54 bars of <em>The Hidden Heart</em>, redistributed
              across two orchestral ensembles. The score above is the work; the
              solo piano render is its first realization. The score is{" "}
              <span className="text-foreground">independent</span> from the
              realization — reorchestrating is a re-distribution problem, not
              a re-composing problem.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <Link
                to="/the-hidden-heart/classical-orchestra"
                className="group flex h-full flex-col rounded-xl border border-border/60 bg-card/60 p-6 transition-colors hover:border-primary/40"
              >
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary/90">
                  Arrangement A
                </span>
                <h3 className="mt-2 font-serif-display text-2xl leading-tight tracking-tight text-foreground">
                  Classical Orchestral Arrangement
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  9-voice classical chamber ensemble — piano, string quartet,
                  woodwind trio, French horn. Continuous expressive texture
                  with hierarchical voice balance and within-note breathing.
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
                  Listen
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>

              <Link
                to="/the-hidden-heart/modern-asian-orchestra"
                className="group flex h-full flex-col rounded-xl border border-border/60 bg-card/60 p-6 transition-colors hover:border-primary/40"
              >
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary/90">
                  Arrangement B
                </span>
                <h3 className="mt-2 font-serif-display text-2xl leading-tight tracking-tight text-foreground">
                  Modern Asian Arrangement
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  8-voice ensemble drawing on Korean traditional aesthetics —
                  heterophonic texture, sigimsae ornamentation, yeobaek
                  negative space carried by pedal-held piano resonance.
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-transform group-hover:translate-x-0.5">
                  Listen
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — how it was made */}
      <section className="px-6 pb-16 pt-4">
        <div ref={ctaRef} className="reveal mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-8 text-center md:p-12">
            <h3 className="font-serif-display text-3xl tracking-tight">
              Curious how this was made?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Ten versions, eight rounds of Gemini critique, two rejected
              branches, one final cut. Where the Lullaby converged via
              score-level micro-prescriptions, this piece's arc is{" "}
              <em>stop, course-correct, branch, return, finalize</em>. See the
              full timeline.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-11 px-6">
                <Link to="/the-hidden-heart/iterations">
                  See the iteration journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-2 text-center">
          <div className="flex items-center justify-center gap-5">
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← All pieces
            </Link>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
            <a
              href="mailto:zach@wavelody.com"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Email
            </a>
          </div>
          <p className="text-xs text-muted-foreground/70">© 2026 Wavelody.</p>
        </div>
      </footer>
    </div>
  );
};

export default TheHiddenHeart;
