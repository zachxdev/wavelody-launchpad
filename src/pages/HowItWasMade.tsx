import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import { iterations } from "@/components/showcase/iterations";
import { useReveal } from "@/hooks/useReveal";

const TimelineCard = ({
  iter,
  isFinal,
}: {
  iter: (typeof iterations)[number];
  isFinal: boolean;
}) => {
  const ref = useReveal<HTMLDivElement>();
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
          <span className="ml-auto text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {iter.stage}
          </span>
        </header>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <AudioPlayer src={iter.audio} label={`${iter.id} — ${iter.title}`} />

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                What drove this
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {iter.driver}
              </p>
            </div>
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                What changed musically
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {iter.changes}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

const HowItWasMade = () => {
  const introRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav rightLink={{ to: "/showcase", label: "← Back to showcase" }} />

      {/* Hero */}
      <section className="relative px-6 pb-12 pt-[100px] sm:pt-[120px]">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/showcase"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            The Living Engine
          </Link>
          <h1 className="mt-5 font-serif-display text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            How it was made
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Thirteen versions. Seven rounds of critique. One engine. The piece
            you heard on the previous page is v13 — but it didn't start there.
            What follows is the iteration trail: the prompts and critique that
            drove each rewrite, and what changed musically as a result.
          </p>
        </div>
      </section>

      {/* Intro framing */}
      <section className="px-6 pb-12">
        <div ref={introRef} className="reveal mx-auto max-w-3xl">
          <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-sm leading-relaxed text-muted-foreground">
            <p>
              v1 was a literal pattern transcription — Zach gave the engine a
              31-letter alphabetical pattern and asked for a three-minute solo
              piano piece. The result sounded, in his words, "like a Beyer
              piece." Versions 2 through 6 lived inside a tighter prompt loop
              ("more floral", "make it Ravel", "make it Chopin") that
              eventually established the five-movement French-titled form.
              From v7 onwards, every change was driven by an external Gemini
              critique pass that scored the previous version against
              Ravel-style benchmarks and returned a numbered list of
              prescriptions. v13 implements Gemini Round 7 — the round where
              the critique stopped finding structural complaints.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 pb-24">
        <div className="relative mx-auto max-w-3xl">
          {/* Vertical rail */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-[1.5rem] top-2 w-px bg-border/60 sm:left-8"
          />
          <div className="space-y-8">
            {iterations.map((iter, i) => (
              <TimelineCard
                key={iter.id}
                iter={iter}
                isFinal={i === iterations.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Outro CTAs — back to showcase + read the verdict */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/showcase"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Listen
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  Back to The Living Engine
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
            </Link>
            <Link
              to="/showcase/verdict"
              className="group rounded-xl border border-primary/40 bg-primary/[0.04] p-5 transition-colors hover:bg-primary/[0.08]"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-primary/90">
                Independent assessment
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight text-foreground">
                  Read the full Gemini verdict
                </span>
                <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
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

export default HowItWasMade;
