import { ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import { finalIteration } from "@/components/showcase/iterations";
import { verdictPullQuote } from "@/components/showcase/verdict";
import { useReveal } from "@/hooks/useReveal";

const movements = [
  { roman: "I", name: "Lointain", note: "Distant — opening atmosphere" },
  { roman: "II", name: "Cantabile", note: "Singing right hand over sustained bass" },
  { roman: "III", name: "Plus mouvementé", note: "More animated; cross-pulses build" },
  { roman: "IV", name: "Éclat", note: "Burst — three-phase growth to a plateau-f peak" },
  { roman: "V", name: "Retour", note: "Return; recapitulates A B A C in reverse" },
];

const Showcase = () => {
  const descRef = useReveal<HTMLDivElement>();
  const movementsRef = useReveal<HTMLDivElement>();
  const verdictRef = useReveal<HTMLDivElement>();
  const ctaRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav
        rightLink={{ to: "/showcase/how-it-was-made", label: "How it was made" }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center px-6 pt-[52px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(173_80%_40%_/_0.10),_transparent_60%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Wavelody showcase
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            The Living Engine
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            A Ravel-style piano suite, composed by Wavelody.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <AudioPlayer
              src={finalIteration.audio}
              label={`v13 — The Living Engine`}
              durationHint="6:06"
              variant="hero"
            />
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Solo piano · F♯ minor · five movements · 6:06
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
              Five movements, six minutes and six seconds, a single piano in F♯
              minor. The piece is built from a structured letter pattern —{" "}
              <span className="font-mono text-foreground">
                I. Lointain&nbsp;A B A C
              </span>
              ,{" "}
              <span className="font-mono text-foreground">
                II. Cantabile&nbsp;A B A C&nbsp;D E D F
              </span>
              , and so on through{" "}
              <span className="font-mono text-foreground">V. Retour</span> —
              with each letter mapped to a fixed pitch (A = F♯4, B = A4, … N =
              A6). The system then writes the actual music: voicing, harmony,
              rhythm, dynamics, articulation.
            </p>
            <p>
              The harmonic palette is octatonic with parallel ninths and
              polychords (D major over F♯ major; A major over C♯ major). The
              rhythmic surface uses Spanish hemiola, 5:4 and 7:8 cross-pulses
              to break the mechanical pulse the early drafts could never quite
              shake. The fourth movement, Éclat, runs a three-phase growth arc
              — a hushed pulse decay, a fluctuating swell, then a plateau-f
              peak with sforzandi — which is what gave v13 its name.
            </p>
          </div>

          {/* Movement list */}
          <div ref={movementsRef} className="reveal mt-10 space-y-3">
            {movements.map((m) => (
              <div
                key={m.roman}
                className="flex items-baseline gap-4 rounded-lg border border-border/60 bg-card/40 px-5 py-4"
              >
                <span className="w-8 shrink-0 font-mono text-sm text-muted-foreground">
                  {m.roman}.
                </span>
                <span className="font-serif-display text-lg tracking-tight text-foreground">
                  {m.name}
                </span>
                <span className="text-sm text-muted-foreground">— {m.note}</span>
              </div>
            ))}
          </div>

          {/* Verdict pull-quote (Gemini 2.5 Pro) */}
          <aside
            ref={verdictRef}
            data-verdict
            className="reveal mt-12 rounded-xl border border-primary/30 bg-primary/[0.04] p-6 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Quote className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
                  Verdict from Gemini
                </div>
                <blockquote className="mt-3 font-serif-display text-lg leading-snug text-foreground sm:text-xl">
                  &ldquo;{verdictPullQuote.body}&rdquo;
                </blockquote>
                <div className="mt-3 text-sm text-muted-foreground">
                  — {verdictPullQuote.source},{" "}
                  <span className="text-muted-foreground/85">
                    {verdictPullQuote.context}
                  </span>
                </div>
                <Link
                  to="/showcase/verdict"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-transform hover:translate-x-0.5"
                >
                  Read the full assessment
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA — how it was made */}
      <section className="px-6 pb-24 pt-4">
        <div ref={ctaRef} className="reveal mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-8 text-center md:p-12">
            <h3 className="font-serif-display text-3xl tracking-tight">
              Curious how this was made?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Thirteen versions, seven rounds of critique, one engine. Listen
              to the journey from a literal pattern transcription in v1 to The
              Living Engine in v13.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-11 px-6">
                <Link to="/showcase/how-it-was-made">
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
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs text-muted-foreground/70">© 2026 Wavelody.</p>
        </div>
      </footer>
    </div>
  );
};

export default Showcase;
