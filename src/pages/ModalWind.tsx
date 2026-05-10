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
    src: "/showcase/modal-wind/studio.mp3",
    label: "Studio master — Colors of the Modal Wind",
    blurb:
      "Tighter dynamic range, polished for casual listening on earbuds and laptop speakers.",
  },
  concert: {
    src: "/showcase/modal-wind/concert.mp3",
    label: "Concert master — Colors of the Modal Wind",
    blurb:
      "Wider dynamic range — ideal for studio monitors or a quiet room with headphones.",
  },
};

const constraints: Array<{ voice: string; rule: string }> = [
  {
    voice: "Oboe",
    rule:
      "Carries the lyric singing line. No literal repetition allowed — every phrase must develop.",
  },
  {
    voice: "Double Bass",
    rule:
      "Harmonic anchor — the only voice in the ensemble permitted to use repeated patterns.",
  },
  {
    voice: "Piano LH",
    rule:
      "Always a 4-key chord (block press or rapid cascade). No two-note shells, no single notes.",
  },
  {
    voice: "Piano RH",
    rule:
      "Strictly alternates between 4-key and 3-key chords. Density is patterned, harmony is not.",
  },
  {
    voice: "Piano LH+RH combinations",
    rule:
      "π-distribution rule — adjacent uses of any combination must be ≥ 4 bars apart, and no 4-event sequence may recur.",
  },
  {
    voice: "Flute",
    rule:
      "Highlights at the agent's discretion — but silent at the chorus reprise downbeat (bar 45). The implied breath before flooding back.",
  },
  {
    voice: "Clarinet (added v3)",
    rule:
      "Warm middle-register support. Silent at INTRO, DROP, and CODA — only colors the body of the piece.",
  },
];

const versions: Array<{ tag: string; title: string; body: string }> = [
  {
    tag: "v1",
    title: "Rule-based composition (~18 min compose)",
    body:
      "Strict-rule scaffold produces a working ballad in D Aeolian. Gemini critique: 'brilliant orchestration of a chord progression — but not yet a living, breathing song.'",
  },
  {
    tag: "v2",
    title: "Gemini-revised — emotional commitment",
    body:
      "Adds a textural valley DROP section, a driving PRE-CHORUS BUILD anacrusis, and a bar 41 climax with full sustain pedal and flute D7 doubling. +1 minute total length.",
  },
  {
    tag: "v3",
    title: "Clarinet added, flute expanded",
    body:
      "Warm clarinet middle-register lines, eighteen sustained flute lines, and the 'highlight by absence' moment at bar 45 — flute drops out at the chorus reprise downbeat.",
  },
  {
    tag: "v4",
    title: "Realism filter introduced",
    body:
      "Per-note jitter across five dimensions (timing, velocity, duration, pitch, CC11 noise), π-distributed and phase-decorrelated per voice. Resolves the 'MIDI feel' criticism.",
  },
  {
    tag: "v5",
    title: "Studio-ready dual master",
    body:
      "Realism strength tuned to 1.5. Two final masters emit from one render — a studio cut for casual listening and a concert cut for monitors.",
  },
];

const ModalWind = () => {
  const heroRef = useReveal<HTMLDivElement>();
  const descRef = useReveal<HTMLDivElement>();
  const constraintsRef = useReveal<HTMLDivElement>();
  const codeRef = useReveal<HTMLDivElement>();
  const whyRef = useReveal<HTMLDivElement>();
  const iterationsRef = useReveal<HTMLDivElement>();

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
            Wavelody showcase · piece V · constraint-prompted
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            Colors of the Modal Wind
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            The first showcase composed entirely under strict compositional
            rules. We didn't ask the LLM to compose freely — we gave it a rule
            set, and let the rules do half the creative work.
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
              durationHint="3:58"
              variant="hero"
              groupKey="modal-wind-hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              {master.blurb}
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Oboe · double bass · piano · flute · clarinet · D Aeolian · 3:58
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
              An original chamber ballad in D Aeolian — oboe-led melody over
              piano, double bass, flute, and clarinet. Through-composed with a
              textural valley DROP, a driving pre-chorus anacrusis, and a bar
              41 climax that opens into a chorus reprise via the "implied
              breath" at bar 45.
            </p>
            <p>
              The thing that makes this piece different from the four catalog
              showcases isn't its harmony or its instrumentation — it's the
              method. Every voice was bound by an explicit compositional rule
              before the LLM wrote a single note. The rules are not advice in
              a prompt; they are scaffolding the composer cannot escape from.
            </p>
          </div>
        </div>
      </section>

      {/* Constraints — the headline story */}
      <section className="px-6 pb-20">
        <div ref={constraintsRef} className="reveal mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            The rule set
          </div>
          <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
            Constraint prompting, voice by voice
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Each instrument is governed by a strict rule. The composer chooses
            <em> what </em>to play within the rule's frame; the rule decides
            the kind of role the voice can take.
          </p>

          <div className="mt-8 space-y-3">
            {constraints.map((c) => (
              <div
                key={c.voice}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="w-56 shrink-0 font-mono text-sm uppercase tracking-[0.12em] text-foreground">
                  {c.voice}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {c.rule}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Code-block visualization */}
      <section className="px-6 pb-20">
        <div ref={codeRef} className="reveal mx-auto max-w-4xl">
          <div className="rounded-xl border border-border/60 bg-card/70 p-6 md:p-8">
            <div className="mb-3 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-red-400/70" />
              <span className="h-2 w-2 rounded-full bg-yellow-400/70" />
              <span className="h-2 w-2 rounded-full bg-green-400/70" />
              <span className="ml-2">rules.py</span>
            </div>
            <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-foreground/90">
{`RULES = {
    "oboe":          "lyric melody, no literal repetition",
    "double_bass":   "harmonic anchor, REPEATED PATTERNS ALLOWED (only voice)",
    "piano_lh":      "always 4-key chord (block or cascade)",
    "piano_rh":      "alternate 4-key and 3-key chords",
    "piano_combos":  "pi-distribution: no clusters, no patterned recurrence",
    "flute":         "highlights + strategic absence at bar 45 (implied breath)",
    "clarinet":      "warm middle support, silent at INTRO/DROP/CODA",
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Why constraint prompting matters */}
      <section className="px-6 pb-20">
        <div ref={whyRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            Why constraint prompting matters
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Speedup.</span>{" "}
              Rule-based composition cut Claude's compose time roughly in half
              compared with the unconstrained Tier-D pieces in the catalog.
              The rules absorb the dimensions of the decision space that don't
              matter for the piece's identity, so the model concentrates its
              budget on the dimensions that do.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Style consistency.
              </span>{" "}
              The rules guarantee a coherent aesthetic — no Beyer-style
              mechanical variety, no genre drift. Two compositions written
              under the same rule set sit recognizably in the same world even
              though their melodies are unrelated.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Reproducibility.
              </span>{" "}
              The constraints are encoded in code, not buried in a freeform
              prompt. Future compositions in this style use exactly the same
              rules; the rules can be unit-tested.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Creative leverage.
              </span>{" "}
              Paradoxically, more constraints produce more creative depth.
              When the rule pins down density, repetition discipline, and
              voice roles, the composer's remaining decisions — melodic
              contour, harmonic motion, where to land — get all the
              attention. The page's center of gravity shifts away from
              arbitrary choices toward the choices that make the piece feel
              like a piece.
            </p>
            <p className="border-l-2 border-primary/60 pl-5 text-foreground/90">
              This is Wavelody's product thesis: structured score generation,
              with style templates as constraints, scales to fast and
              consistent music creation.
            </p>
          </div>
        </div>
      </section>

      {/* Iteration history */}
      <section className="px-6 pb-20">
        <div ref={iterationsRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            Five versions to studio-ready
          </h2>
          <div className="mt-8 space-y-3">
            {versions.map((v) => (
              <div
                key={v.tag}
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="w-12 shrink-0 font-mono text-sm uppercase tracking-[0.18em] text-primary/90">
                  {v.tag}
                </span>
                <div>
                  <div className="font-serif-display text-lg leading-tight tracking-tight text-foreground">
                    {v.title}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {v.body}
                  </p>
                </div>
              </div>
            ))}
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

export default ModalWind;
