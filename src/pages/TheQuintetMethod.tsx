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

const motifs: Array<{ tag: string; name: string; body: string }> = [
  {
    tag: "Motif 1",
    name: "Rising arpeggio with 9th",
    body:
      "An ascending chord-tone climb that leans on the 9th — open, lifted, the head's most immediately quotable shape. Trumpet favors it.",
  },
  {
    tag: "Motif 2",
    name: "Descending Dorian scale fragment",
    body:
      "A short stepwise fall through the A Dorian scale. The piece's most idiomatic post-bop gesture. Sax favors it.",
  },
  {
    tag: "Motif 3",
    name: "Descending bridge sigh",
    body:
      "A longer descending phrase from the B section of the head — the form's emotional anchor. Both soloists return to it at structural moments.",
  },
];

const form: Array<{ tag: string; section: string; bars: string; body: string }> =
  [
    {
      tag: "A · A · B · A",
      section: "Head",
      bars: "Bars 1–32",
      body:
        "32-bar AABA melody composed by the LLM first, with three motivic cells explicitly identified before any solo is written. The head isn't material; it's the source the rest of the piece quotes from.",
    },
    {
      tag: "Sax",
      section: "Sax solo",
      bars: "Bars 33–72",
      body:
        "Composed by the LLM with the head as context — and a hard requirement to quote the three motifs. Pitch-sequence analysis verified 27 motif quotes. Sax leans hardest on Motif 2 (Dorian descents).",
    },
    {
      tag: "Trumpet",
      section: "Trumpet solo",
      bars: "Bars 73–112",
      body:
        "Same constraint, different voice — 36 motif quotes verified. Trumpet's bias falls on Motif 1 (rising arpeggio with 9th). Two soloists, two motivic personalities under the same rule.",
    },
    {
      tag: "Trades",
      section: "Sax + trumpet trades",
      bars: "Bars 113–128",
      body:
        "Four-bar phrases alternating between the horns, each phrase quoting the head. The closest the piece gets to conversational call-and-response.",
    },
    {
      tag: "Head out",
      section: "Head paraphrase",
      bars: "Bars 129–144",
      body:
        "Piano restates the theme — paraphrased rather than literal. The listener recognizes 'we're back home' before the surprise resolution arrives.",
    },
  ];

const refinements: Array<{ title: string; body: string }> = [
  {
    title: "Two soloists, two personalities",
    body:
      "The motif-quote bias is deliberate — sax and trumpet weren't given the same prompt. Each soloist's instructions name a preferred motif and let the other two appear as supporting material. The result reads as two players who studied the head differently.",
  },
  {
    title: "Verified, not asserted",
    body:
      "Each solo is post-checked by a pitch-sequence analyzer that counts motif quotes against the LLM's claimed quote count. The brief Gemini critique cycle on v9 caught the 'fake-speaking jazz' problem; the verifier in v10 makes sure the LLM's solo actually contains what it claims.",
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
  const motifsRef = useReveal<HTMLDivElement>();
  const formRef = useReveal<HTMLDivElement>();
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
            Wavelody showcase · piece VII · head-first composition
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            The Quintet Method
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            A hard-bop jazz quintet — piano, bass, drums, sax, trumpet —
            composed head-first. Write the melody and identify its motifs;
            require every solo to quote them; verify the quotes.
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
              A hard-bop quintet in the standard jazz form — head, sax solo,
              trumpet solo, trades, head out. Piano, upright bass, drums,
              tenor sax, trumpet. 144 bars in A Dorian at ~115 BPM. The
              compositional architecture is the interesting part.
            </p>
            <p>
              Nine earlier versions of this piece used a different pipeline —
              an algorithm wrote a dense chord-tone-correct draft, then the
              LLM pruned it for shape, then added back punctuation. The
              result sounded like jazz harmonically and like nothing
              compositionally — chord-tone soup, the verdict was, like a
              comedian fake-speaking the language. The diagnosis was right:
              the soloists weren't <em>saying</em> anything, because there
              was nothing to say. No theme to quote, no motif to develop, no
              ear-memory to reward.
            </p>
            <p>
              v10 throws that architecture out and composes the way a jazz
              writer would. The head goes first; its three motifs are
              identified explicitly; the solos are written under a hard
              requirement to quote them. The pipeline guarantees a piece
              that <em>talks about itself</em>.
            </p>
          </div>
        </div>
      </section>

      {/* The three motifs — the headline */}
      <section className="px-6 pb-20">
        <div ref={motifsRef} className="reveal mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            The three motifs
          </div>
          <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
            What the soloists are required to quote
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The head is composed first. Then three motivic cells are
            identified by name. The two soloists each receive the head, the
            motifs, and a hard instruction: your solo must quote these.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {motifs.map((m) => (
              <div
                key={m.tag}
                className="flex flex-col rounded-xl border border-border/60 bg-card/40 p-6"
              >
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary/90">
                  {m.tag}
                </span>
                <h3 className="mt-3 font-serif-display text-xl tracking-tight text-foreground">
                  {m.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {m.body}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-8 max-w-3xl border-l-2 border-primary/60 pl-5 text-base leading-relaxed text-foreground/90">
            27 motif quotes in the sax solo; 36 in the trumpet solo.{" "}
            <span className="text-muted-foreground">
              Verified after the fact by a pitch-sequence analyzer — not
              taken on the LLM's word that the quotes are there.
            </span>
          </p>
        </div>
      </section>

      {/* Form — head, solos, trades, head out */}
      <section className="px-6 pb-20">
        <div ref={formRef} className="reveal mx-auto max-w-4xl">
          <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
            Standard form, not modal jam
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            HEAD → SAX SOLO → TRUMPET SOLO → TRADES → HEAD OUT. A real jazz
            arrangement with a beginning, soloists who reference home, a
            conversation between them, and a return.
          </p>

          <div className="mt-8 space-y-3">
            {form.map((f) => (
              <div
                key={f.tag}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="w-28 shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-primary/90">
                  {f.tag}
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-serif-display text-lg leading-tight tracking-tight text-foreground">
                      {f.section}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {f.bars}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {f.body}
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
            Composition is half the work. The other half is the choices
            that decide whether the piece reads as samples or as players.
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
            Why head-first composition matters
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                Solos that say something.
              </span>{" "}
              A jazz solo without thematic reference is wallpaper. By
              composing the head first and requiring the solos to quote it,
              the architecture guarantees that each solo is{" "}
              <em>about</em> the piece it sits inside. The listener's
              ear-memory rewards the references it half-recognizes.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Two soloists, two personalities — by design.
              </span>{" "}
              Sax and trumpet receive the same head and the same three
              motifs, but each is given a different motif-preference bias.
              The pitch-sequence analyzer confirms the bias landed: sax
              quotes Motif 2 most, trumpet quotes Motif 1 most. Two players
              who studied the same melody and remembered different parts.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Foundational module, not one-off.
              </span>{" "}
              The pipeline lives in{" "}
              <span className="font-mono text-foreground">
                jazz_head_first_composition.py
              </span>{" "}
              and is the pattern for all future jazz work — different head,
              different motifs, same architecture. The architecture is the
              product; the piece is one rendering of it.
            </p>
            <p className="border-l-2 border-primary/60 pl-5 text-foreground/90">
              Same product thesis as the constraint-prompted Modal Wind:
              structured score generation, with the right tool for each
              layer of the work, scales to fast and consistent music
              creation. For jazz, the right structure is the head.
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
