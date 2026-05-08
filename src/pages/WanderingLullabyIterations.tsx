import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import {
  lullabyIterations,
  lullabySaturationCallout,
} from "@/components/showcase/lullabyIterations";
import { lullabyDslExcerpts } from "@/components/showcase/lullabyDslExcerpts";
import { useReveal } from "@/hooks/useReveal";

const TimelineCard = ({
  iter,
  isFinal,
}: {
  iter: (typeof lullabyIterations)[number];
  isFinal: boolean;
}) => {
  const ref = useReveal<HTMLDivElement>();
  const excerpt = lullabyDslExcerpts[iter.id];
  return (
    <div ref={ref} className="reveal relative pl-12 sm:pl-16">
      {/* Timeline rail dot */}
      <div
        aria-hidden="true"
        className={`absolute left-3 top-2 flex h-6 w-6 items-center justify-center rounded-full border ${
          isFinal
            ? "border-primary bg-primary/15 ring-4 ring-primary/15"
            : "border-border bg-card"
        } sm:left-5`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isFinal ? "bg-primary" : "bg-muted-foreground"
          }`}
        />
      </div>

      <article
        className={`overflow-hidden rounded-xl border ${
          isFinal ? "border-primary/40" : "border-border/60"
        } bg-card/60`}
      >
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border/60 px-5 py-4 sm:px-6">
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-xs uppercase tracking-wider ${
              isFinal
                ? "bg-primary/15 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {iter.id}
          </span>
          <h3 className="font-serif-display text-xl tracking-tight text-foreground">
            {iter.title}
          </h3>
        </header>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <AudioPlayer src={iter.audio} label={`${iter.id} — ${iter.title}`} />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                What Gemini prescribed
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {iter.prescribed}
              </p>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                What was applied
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {iter.applied}
              </p>
            </div>
          </div>

          {excerpt && (
            <details className="group rounded-lg border border-border/60 bg-background/40 px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground">
                <span>
                  View score diff —{" "}
                  <span className="text-foreground/90">{excerpt.bars}</span>
                </span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
              </summary>
              <pre className="mt-3 overflow-x-auto rounded-md border border-border/60 bg-background/70 p-3 font-mono text-[11px] leading-relaxed text-foreground/85 sm:text-xs">
                {excerpt.excerpt}
              </pre>
            </details>
          )}
        </div>
      </article>
    </div>
  );
};

const WanderingLullabyIterations = () => {
  const introRef = useReveal<HTMLDivElement>();
  const saturationRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav rightLink={{ to: "/the-wandering-lullaby", label: "← Listening page" }} />

      {/* Hero */}
      <section className="relative px-6 pb-12 pt-[100px] sm:pt-[120px]">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/the-wandering-lullaby"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            The Wandering Lullaby
          </Link>
          <h1 className="mt-5 font-serif-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Iteration history
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Ten versions. Nine rounds of Gemini critique. The framework here
            differs from The Living Engine: apply <em>all</em> of Gemini's
            prescriptions every round, and iterate until the critique stops
            finding structural issues. v1 was the Phase A blueprint realised in
            DSL; v10 is a deliberately curated final cut.
          </p>
        </div>
      </section>

      {/* Intro framing */}
      <section className="px-6 pb-12">
        <div ref={introRef} className="reveal mx-auto max-w-3xl">
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Each card below paraphrases the round's critique into ~80 words
              and notes what was applied. Where there's a score-as-artifact
              moment worth seeing, the "View score diff" toggle exposes the
              MusicDSL bars that changed. Don't read the loop top to bottom —
              skim to v6 (last big structural fix), then read the saturation
              callout, then v10 (the surgical cut).
            </p>
          </div>
        </div>
      </section>

      {/* Timeline — v1 through v6 */}
      <section className="px-6 pb-12">
        <div className="relative mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[1.5rem] top-2 w-px bg-border/60 sm:left-8"
          />
          <div className="space-y-8">
            {lullabyIterations.slice(0, 6).map((iter) => (
              <TimelineCard key={iter.id} iter={iter} isFinal={false} />
            ))}
          </div>
        </div>
      </section>

      {/* Saturation callout — sits between v6 and v7 */}
      <section className="px-6 pb-12">
        <div ref={saturationRef} className="reveal mx-auto max-w-3xl">
          <aside className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-amber-400/90">
                  Convergence ceiling
                </div>
                <h3 className="mt-2 font-serif-display text-2xl tracking-tight text-foreground">
                  {lullabySaturationCallout.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {lullabySaturationCallout.body}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Timeline — v7 through v10 */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[1.5rem] top-2 w-px bg-border/60 sm:left-8"
          />
          <div className="space-y-8">
            {lullabyIterations.slice(6).map((iter, i, arr) => (
              <TimelineCard
                key={iter.id}
                iter={iter}
                isFinal={i === arr.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Outro: back-link + cross-link to The Living Engine's iteration page */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/the-wandering-lullaby"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Listen
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  Back to The Wandering Lullaby
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
            </Link>
            <Link
              to="/the-living-engine/iterations"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Compare
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  The Living Engine — iteration journey
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40 px-6 py-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs text-muted-foreground/70">© 2026 Wavelody.</p>
        </div>
      </footer>
    </div>
  );
};

export default WanderingLullabyIterations;
