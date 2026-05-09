import { ArrowLeft, ArrowRight, Ear, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import {
  skyCombatIterations,
  skyCombatNarrativeCallout,
} from "@/components/showcase/skyCombatIterations";
import { skyCombatDslExcerpts } from "@/components/showcase/skyCombatDslExcerpts";
import { useReveal } from "@/hooks/useReveal";

const TimelineCard = ({
  iter,
}: {
  iter: (typeof skyCombatIterations)[number];
}) => {
  const ref = useReveal<HTMLDivElement>();
  const excerpt = skyCombatDslExcerpts[iter.id];
  const isBranch = iter.pathKind === "branch";
  const isFinal = iter.id === "v8";
  return (
    <div ref={ref} className="reveal relative pl-12 sm:pl-16">
      {/* Timeline rail dot */}
      <div
        aria-hidden="true"
        className={`absolute left-3 top-2 flex h-6 w-6 items-center justify-center rounded-full border sm:left-5 ${
          isBranch
            ? "border-amber-500/50 bg-amber-500/10 ring-4 ring-amber-500/10"
            : isFinal
              ? "border-primary bg-primary/15 ring-4 ring-primary/15"
              : "border-border bg-card"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isBranch
              ? "bg-amber-400"
              : isFinal
                ? "bg-primary"
                : "bg-muted-foreground"
          }`}
        />
      </div>

      <article
        className={`overflow-hidden rounded-xl border bg-card/60 ${
          isBranch
            ? "border-l-2 border-l-amber-500/60 border-y-amber-500/25 border-r-amber-500/25"
            : isFinal
              ? "border-primary/40"
              : "border-border/60"
        }`}
      >
        <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-border/60 px-5 py-4 sm:px-6">
          <span
            className={`rounded-md px-2 py-0.5 font-mono text-xs uppercase tracking-wider ${
              isBranch
                ? "bg-amber-500/15 text-amber-300"
                : isFinal
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {iter.id}
          </span>
          {isBranch && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">
              <GitBranch className="h-3 w-3" aria-hidden="true" />
              Branch · partial fix
            </span>
          )}
          <h3 className="font-serif-display text-xl tracking-tight text-foreground">
            {iter.title}
          </h3>
        </header>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          {iter.banner && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${
                isBranch
                  ? "border-amber-500/30 bg-amber-500/[0.04] text-foreground/90"
                  : "border-primary/30 bg-primary/[0.04] text-foreground/90"
              }`}
            >
              <div
                className={`mb-1 text-xs font-medium uppercase tracking-[0.16em] ${
                  isBranch ? "text-amber-300" : "text-primary"
                }`}
              >
                {iter.banner.label}
              </div>
              <p>{iter.banner.body}</p>
            </div>
          )}

          <AudioPlayer src={iter.audio} label={`${iter.id} — ${iter.title}`} />
          {isFinal && (
            <Link
              to="/sky-combat"
              className="inline-flex items-center gap-1 text-xs italic text-muted-foreground transition-colors hover:text-foreground"
            >
              Listen in Pianoteq
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                What was prescribed / what drove this
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {iter.prescribed}
              </p>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                What changed musically
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {iter.applied}
              </p>
            </div>
          </div>

          {iter.quote && (
            <blockquote className="rounded-lg border-l-2 border-foreground/30 bg-background/40 px-5 py-3 text-sm italic leading-relaxed text-foreground/90">
              "{iter.quote.text}"
              <span className="mt-1 block not-italic text-xs uppercase tracking-[0.18em] text-muted-foreground">
                — {iter.quote.speaker}
              </span>
            </blockquote>
          )}

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

const SkyCombatIterations = () => {
  const introRef = useReveal<HTMLDivElement>();
  const calloutRef = useReveal<HTMLDivElement>();
  const renderNoteRef = useReveal<HTMLDivElement>();

  // Split the timeline at the v6 / v7 boundary — the narrative callout
  // ("why two of the iteration rounds were human-driven") sits between the
  // Gemini critique loop (v1-v6) and the two human-driven surgical passes
  // (v7-v8) that solved what score-level critique never surfaced.
  const beforeCallout = skyCombatIterations.filter((i) =>
    ["v1", "v2", "v3", "v4", "v5", "v6"].includes(i.id),
  );
  const afterCallout = skyCombatIterations.filter((i) =>
    ["v7", "v8"].includes(i.id),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav
        rightLink={{ to: "/sky-combat", label: "← Listening page" }}
      />

      {/* Hero */}
      <section className="relative px-6 pb-12 pt-[100px] sm:pt-[120px]">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/sky-combat"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Sky Combat
          </Link>
          <h1 className="mt-5 font-serif-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Iteration history — Sky Combat
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Eight versions, mostly Gemini-driven score critique — but with two
            pivotal human-feedback moments where Zach's ear caught what score-
            level critique missed. v1 was correct on the page and boring to
            the ear; v6 was kinetic on the page and looped to the ear. Same
            failure mode at two different levels of granularity.
          </p>
        </div>
      </section>

      {/* Intro framing */}
      <section className="px-6 pb-12">
        <div ref={introRef} className="reveal mx-auto max-w-3xl">
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Each card paraphrases the round and notes what changed in the
              score. v4 is marked as a branch / partial fix — the texture
              skeleton landed, the per-voice pitch development did not. v4's
              work led directly into v5 and was kept on the path; the actual
              broken-disc fix came at v7 (and again at v8 for the next 8-bar
              episode). Where there's a focal-bar diff worth seeing, the "View
              score diff" toggle exposes the verbatim MusicDSL.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline — v1 through v6 (Gemini critique loop) */}
      <section className="px-6 pb-12">
        <div className="relative mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[1.5rem] top-2 w-px bg-border/60 sm:left-8"
          />
          <div className="space-y-8">
            {beforeCallout.map((iter) => (
              <TimelineCard key={iter.id} iter={iter} />
            ))}
          </div>
        </div>
      </section>

      {/* Narrative callout — sits between v6 and v7 */}
      <section className="px-6 pb-12">
        <div ref={calloutRef} className="reveal mx-auto max-w-3xl">
          <aside className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Ear className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
                  Where score-critique runs out of finds
                </div>
                <h3 className="mt-2 font-serif-display text-2xl tracking-tight text-foreground">
                  {skyCombatNarrativeCallout.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {skyCombatNarrativeCallout.body}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Timeline — v7 (human surgical) and v8 (final + Pianoteq) */}
      <section className="px-6 pb-12">
        <div className="relative mx-auto max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[1.5rem] top-2 w-px bg-border/60 sm:left-8"
          />
          <div className="space-y-8">
            {afterCallout.map((iter) => (
              <TimelineCard key={iter.id} iter={iter} />
            ))}
          </div>
        </div>
      </section>

      {/* Pianoteq render note */}
      <section className="px-6 pb-20">
        <div ref={renderNoteRef} className="reveal mx-auto max-w-3xl">
          <aside className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <GitBranch className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
                  Pianoteq enters at v8
                </div>
                <h3 className="mt-2 font-serif-display text-2xl tracking-tight text-foreground">
                  First piece composed and rendered with Pianoteq from final-render onward
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  v1 through v7 of Sky Combat use the Salamander sample bank.
                  v8 is the first Pianoteq render — physical-modeling rather
                  than samples, Hamburg Steinway D Classical preset, peak
                  -3.99 dBFS. The other three pieces (Living Engine, Wandering
                  Lullaby, Hidden Heart) had Pianoteq retrofitted onto the
                  hero-page final only; their iteration history stays Salamander
                  end to end. Sky Combat is the first piece where Pianoteq
                  joined the workflow at finalisation.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Outro: back-link + cross-link to other iteration pages */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/sky-combat"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Listen
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  Back to Sky Combat
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
            </Link>
            <Link
              to="/the-hidden-heart/iterations"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Compare
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  The Hidden Heart — iteration journey
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

export default SkyCombatIterations;
