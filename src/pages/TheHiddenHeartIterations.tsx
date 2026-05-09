import { ArrowLeft, ArrowRight, GitBranch, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import {
  serenadeIterations,
  serenadeNarrativeCallout,
} from "@/components/showcase/serenadeIterations";
import { serenadeDslExcerpts } from "@/components/showcase/serenadeDslExcerpts";
import { useReveal } from "@/hooks/useReveal";

const VERIFIER_SNIPPET = `# verify_lh_pentatonic.py — discipline as code
# Whitelist: bar 33 is the explicit single-bar modal-mixture exception.
# Eb at any octave is permitted at bar 33 only.
PENTATONIC_LETTERS = {"F", "G", "A", "C", "D"}
WHITELIST: dict[int, set[tuple[str, str]]] = {
    33: {("E", "b")},  # E-flat (any octave) at bar 33 only
}

# For every chord token in V2/V3:
#   - parse pitches; reject any accidental (except whitelisted bar);
#   - reject any letter not in {F, G, A, C, D}.
# Run on smoke-v10-piano-serenade-east-asian-harmonics-musicdsl.txt:
# PASS: LH pentatonic — F/G/A/C/D + bar-33 Eb modal-mixture exception only`;

const TimelineCard = ({
  iter,
}: {
  iter: (typeof serenadeIterations)[number];
}) => {
  const ref = useReveal<HTMLDivElement>();
  const excerpt = serenadeDslExcerpts[iter.id];
  const isBranch = iter.pathKind === "branch";
  const isFinal = iter.id === "v10";
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
              Branch · rejected
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
              to="/the-hidden-heart"
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

const TheHiddenHeartIterations = () => {
  const introRef = useReveal<HTMLDivElement>();
  const calloutRef = useReveal<HTMLDivElement>();
  const verifierRef = useReveal<HTMLDivElement>();

  // Split the timeline at the v8 / v9 boundary so the narrative callout
  // ("where conception meets execution") sits between the main-path loop and
  // the v9 branch. v10 returns to the main path after the callout.
  const beforeCallout = serenadeIterations.filter((i) =>
    ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8"].includes(i.id),
  );
  const afterCallout = serenadeIterations.filter((i) =>
    ["v9", "v10"].includes(i.id),
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav
        rightLink={{ to: "/the-hidden-heart", label: "← Listening page" }}
      />

      {/* Hero */}
      <section className="relative px-6 pb-12 pt-[100px] sm:pt-[120px]">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/the-hidden-heart"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            The Hidden Heart
          </Link>
          <h1 className="mt-5 font-serif-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Iteration history
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Ten versions. Eight Gemini critique rounds. Two rejected branches.
            The narrative isn't linear refinement — it's <em>stop, course-
            correct, branch, return, finalize</em>. v1 was the wrong frame
            entirely; v9 was a beautiful detour that lost the ballad clarity;
            v10 returns to the main path with verifier-enforced pentatonic
            discipline in both hands.
          </p>
        </div>
      </section>

      {/* Intro framing */}
      <section className="px-6 pb-12">
        <div ref={introRef} className="reveal mx-auto max-w-3xl">
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              Each card paraphrases the round and notes what changed in the
              score. Branch cards (v1, v9) are visibly distinct — they are
              part of the story, but not the path the final version took.
              Where there's a focal-bar diff worth seeing, the "View score
              diff" toggle exposes the verbatim MusicDSL. Don't read the loop
              top to bottom — skim v1's banner, jump to v2's reset, then
              skim v3 → v8. Read the conception/execution callout next, then
              v9's branch banner, then v10.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline — v1 through v8 */}
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

      {/* Narrative callout — sits between v8 and v9 */}
      <section className="px-6 pb-12">
        <div ref={calloutRef} className="reveal mx-auto max-w-3xl">
          <aside className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <GitBranch className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
                  Where conception meets execution
                </div>
                <h3 className="mt-2 font-serif-display text-2xl tracking-tight text-foreground">
                  {serenadeNarrativeCallout.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  {serenadeNarrativeCallout.body}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Timeline — v9 (branch) and v10 (final) */}
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

      {/* Verifier callout — discipline as code */}
      <section className="px-6 pb-20">
        <div ref={verifierRef} className="reveal mx-auto max-w-3xl">
          <aside className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
                  Discipline as code
                </div>
                <h3 className="mt-2 font-serif-display text-2xl tracking-tight text-foreground">
                  Pentatonic enforcement, programmatically
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                  v10's strict-pentatonic LH is verified by a small Python
                  script that parses every chord token in V2/V3, enforces the
                  letter set <span className="font-mono text-foreground">{"{F, G, A, C, D}"}</span>,
                  and whitelists E♭ at bar 33 only. If any other accidental
                  appears anywhere in the LH, the script fails. The discipline
                  is not a stylistic preference; it's a contract the score has
                  to satisfy before a render is treated as canonical.
                </p>
                <pre className="mt-5 overflow-x-auto rounded-lg border border-border/60 bg-background/70 p-4 font-mono text-[11px] leading-relaxed text-foreground/85 sm:text-xs">
                  {VERIFIER_SNIPPET}
                </pre>
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
              to="/the-hidden-heart"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Listen
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  Back to The Hidden Heart
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
            </Link>
            <Link
              to="/the-wandering-lullaby/iterations"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Compare
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  The Wandering Lullaby — iteration journey
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

export default TheHiddenHeartIterations;
