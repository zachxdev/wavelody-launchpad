import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import { useReveal } from "@/hooks/useReveal";

type MasterKey = "studio" | "concert";

const masters: Record<
  MasterKey,
  { src: string; label: string; blurb: string }
> = {
  studio: {
    src: "/showcase/jazz-quintet/studio.mp3",
    label: "Studio master — The Quintet Method",
    blurb:
      "Tighter dynamic range, polished for casual listening on earbuds and laptop speakers.",
  },
  concert: {
    src: "/showcase/jazz-quintet/concert.mp3",
    label: "Concert master — The Quintet Method",
    blurb:
      "Wider dynamic range — ideal for studio monitors or a quiet room with headphones.",
  },
};

const phases: Array<{
  tag: string;
  name: string;
  duration: string;
  body: string;
}> = [
  {
    tag: "Phase 1",
    name: "Algorithmic",
    duration: "~0.3 s",
    body:
      "A deterministic composer emits the full 144-bar score in a few hundred milliseconds. Every note passes a per-bar harmonic constraint filter — either a chord-tone or a scale-tone of the bar's chord. The output is dense, correct, and lifeless on purpose.",
  },
  {
    tag: "Phase 2",
    name: "LLM Prune",
    duration: "~2:25",
    body:
      "Gemini Pro reads the algorithmic dense score and removes 15–30% of notes for melodic shape. Modern jazz favors space. The model isn't writing notes — it's choosing which ones to take away.",
  },
  {
    tag: "Phase 3",
    name: "LLM Add",
    duration: "~1:20",
    body:
      "Gemini adds back, this time targeted: motif statements at structural moments, soloistic flourishes during the sax and trumpet features. Phase 1 wrote the harmony; Phase 2 shaped the line; Phase 3 places the punctuation.",
  },
];

const cycles: Array<{ tag: string; feature: string; body: string }> = [
  {
    tag: "Cycle 1",
    feature: "Piano (soft brushes)",
    body:
      "Piano leads the opening 24 bars over brushed drums. Soft entry, modal A Dorian, the form's home.",
  },
  {
    tag: "Cycle 2",
    feature: "Ensemble groove",
    body:
      "The quintet settles in together. Bass walks, comping under a shared melodic statement before the first solo feature.",
  },
  {
    tag: "Cycle 3",
    feature: "Saxophone",
    body:
      "Sax takes the first solo. Long durations dominate (80%+ of sax notes) so the SWAM CC11 vibrato fade-in has room to develop on each note.",
  },
  {
    tag: "Cycle 4",
    feature: "Trumpet",
    body:
      "Trumpet feature with the same long-note bias. Same harmonic ground; different timbral world.",
  },
  {
    tag: "Cycle 5",
    feature: "All-hands climax",
    body:
      "Drums move from brushes to loud sticks and crashes. The cycle peaks as a full-ensemble statement before the close.",
  },
  {
    tag: "Cycle 6",
    feature: "Piano solo (Erroll Garner-influenced)",
    body:
      "Piano closes the form. Drums return to brushes. The solo borrows Erroll Garner's 'Misty' vocabulary at the score level — 4-on-floor LH chord stabs, octave-doubled RH melody, grace notes, tremolos — kept partial (~70–80% Garner, 20–30% deviation) so the form can resolve back to its own cadence rather than Garner's.",
  },
];

const refinements: Array<{ title: string; body: string }> = [
  {
    title: "White-key / black-key modal mixture",
    body:
      "The piece sits 60% in A Dorian (its home) and 40% in borrowed major chords from outside the home modality. Each switch is a color shift, not a key change — the form stays anchored.",
  },
  {
    title: "Per-cycle drum dynamics",
    body:
      "Brushes in cycles 1 and 6 bracket the form; sticks and crashes peak in cycle 5. Eight specific accent points across the piece — entry crash, brush rolls into the solos, climax crash, a cymbal swell to silence — mark the structural seams.",
  },
  {
    title: "Brass long-note bias",
    body:
      "Sax and trumpet are biased toward long durations (80%+ of their notes) so the SWAM physical-modeling CC11 vibrato fade-in has time to bloom on each note. Short notes read as samples; long notes read as players.",
  },
  {
    title: "Surprise Picardy third",
    body:
      "The last five seconds: the piece resolves to its A minor home, then a chromatic C → C♯ half-step in the melody pivots to A major add9 — a bittersweet major resolution before the final silence. Picardy as a coda gesture, not a structural turn.",
  },
];

const TheQuintetMethod = () => {
  const heroRef = useReveal<HTMLDivElement>();
  const descRef = useReveal<HTMLDivElement>();
  const phasesRef = useReveal<HTMLDivElement>();
  const cyclesRef = useReveal<HTMLDivElement>();
  const refinementsRef = useReveal<HTMLDivElement>();
  const whyRef = useReveal<HTMLDivElement>();

  const [active, setActive] = useState<MasterKey>("studio");
  const master = masters[active];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav />

      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center px-6 pt-[52px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(173_80%_40%_/_0.10),_transparent_60%)]"
        />
        <div ref={heroRef} className="reveal mx-auto max-w-3xl text-center">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Showcase
          </Link>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Wavelody showcase · piece VII · 3-phase pipeline
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            The Quintet Method
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            A hard-bop jazz quintet — piano, bass, drums, sax, trumpet —
            composed in three phases: an algorithm writes the dense score,
            the LLM prunes it for shape, then adds back the punctuation.
          </p>

          <div className="mx-auto mt-10 max-w-xl">
            {/* Master switcher */}
            <div
              role="tablist"
              aria-label="Choose master"
              className="mb-3 inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 p-1 text-xs font-medium uppercase tracking-[0.18em]"
            >
              {(Object.keys(masters) as MasterKey[]).map((key) => {
                const isActive = key === active;
                return (
                  <button
                    key={key}
                    role="tab"
                    type="button"
                    aria-selected={isActive}
                    onClick={() => setActive(key)}
                    className={
                      isActive
                        ? "rounded-full bg-primary px-4 py-1.5 text-primary-foreground"
                        : "rounded-full px-4 py-1.5 text-muted-foreground transition-colors hover:text-foreground"
                    }
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            <AudioPlayer
              key={active}
              src={master.src}
              label={master.label}
              durationHint="5:16"
              variant="hero"
              groupKey="quintet-method-hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              {master.blurb}
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Piano · bass · drums · sax · trumpet · A Dorian · ~115 BPM · 5:16
          </p>
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-20">
        <div ref={descRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            About the piece
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              A hard-bop quintet in the modern post-Davis lineage — piano,
              upright bass, drums, tenor sax, trumpet. Six cycles of 24 bars
              each, through-composed rather than AABA. Each cycle hands the
              lead to a different voice; the piece ends with an Erroll
              Garner-influenced piano solo and a surprise Picardy third in
              the final five seconds.
            </p>
            <p>
              The thing this piece argues for isn't the result so much as the
              architecture. <em>The Quintet Method</em> is a three-phase
              composition pipeline — algorithm, then prune, then add — that
              writes the full piece in roughly two and a half minutes of
              compute. That's 3.76× faster than asking the LLM to compose
              from scratch, with comparable quality and noticeably better
              harmonic discipline (every note is a chord-tone or scale-tone
              of its bar).
            </p>
          </div>
        </div>
      </section>

      {/* The 3-phase pipeline — the headline */}
      <section className="px-6 pb-20">
        <div ref={phasesRef} className="reveal mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            The pipeline
          </div>
          <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
            Algorithm, then prune, then add
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Three phases, three different jobs. Each one is the cheapest tool
            that can do the work — and skipping any of them visibly degrades
            the result.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {phases.map((p) => (
              <div
                key={p.tag}
                className="flex flex-col rounded-xl border border-border/60 bg-card/40 p-6"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary/90">
                    {p.tag}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {p.duration}
                  </span>
                </div>
                <h3 className="mt-3 font-serif-display text-xl tracking-tight text-foreground">
                  {p.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl border-l-2 border-primary/60 pl-5 text-base leading-relaxed text-foreground/90">
            Total composition time: roughly two and a half minutes for a
            five-minute piece. <span className="text-muted-foreground">
              3.76× faster than pure-LLM composition; comparable quality;
              stronger harmonic correctness from the algorithmic constraint
              filter.
            </span>
          </p>
        </div>
      </section>

      {/* The six cycles */}
      <section className="px-6 pb-20">
        <div ref={cyclesRef} className="reveal mx-auto max-w-4xl">
          <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
            Six cycles, six features
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The 144 bars divide into six 24-bar cycles. The harmony repeats;
            the lead voice doesn't. Each cycle hands the foreground to a
            different player, and the drums shift dynamics around them.
          </p>

          <div className="mt-8 space-y-3">
            {cycles.map((c) => (
              <div
                key={c.tag}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="w-24 shrink-0 font-mono text-sm uppercase tracking-[0.12em] text-primary/90">
                  {c.tag}
                </span>
                <div className="flex-1">
                  <div className="font-serif-display text-lg leading-tight tracking-tight text-foreground">
                    {c.feature}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Refinements */}
      <section className="px-6 pb-20">
        <div ref={refinementsRef} className="reveal mx-auto max-w-4xl">
          <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
            What the LLM can't see — and the score has to encode
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Beyond the three-phase pipeline, the score carries instructions
            the engine plays back literally. These are the choices that
            decide whether the piece reads as samples or as players.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {refinements.map((r) => (
              <div
                key={r.title}
                className="rounded-xl border border-border/60 bg-card/40 p-6"
              >
                <h3 className="font-serif-display text-xl tracking-tight text-foreground">
                  {r.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why this matters */}
      <section className="px-6 pb-20">
        <div ref={whyRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            Why a 3-phase pipeline matters
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                Harmonic correctness, for free.
              </span>{" "}
              The algorithmic phase has a per-bar constraint filter — every
              note is a chord-tone or scale-tone of its bar's chord. The LLM
              never has the chance to write a wrong note; it only chooses
              which correct ones to keep.
            </p>
            <p>
              <span className="font-medium text-foreground">Speedup.</span>{" "}
              ~2:30 of compute for a 5-minute piece. The algorithm carries
              the volume; the LLM carries the shape. Both phases are doing
              what they're good at and nothing else.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Prune-then-add, not write-then-edit.
              </span>{" "}
              The LLM never sees a blank score. It sees a dense, harmonically
              correct draft and reasons about <em>shape</em>. Editing is a
              cheaper cognitive task than composition; the LLM's strength is
              taste, not arithmetic.
            </p>
            <p className="border-l-2 border-primary/60 pl-5 text-foreground/90">
              Same product thesis as the constraint-prompted Modal Wind:
              structured score generation, with the cheapest tool doing each
              layer of the work, scales to fast and consistent music
              creation.
            </p>
          </div>
        </div>
      </section>

      {/* Back link */}
      <section className="px-6 pb-16 pt-4">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-transform hover:-translate-x-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to The Showcase
          </Link>
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

export default TheQuintetMethod;
