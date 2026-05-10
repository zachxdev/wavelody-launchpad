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
    src: "/showcase/kpop-3-4-style/studio.mp3",
    label: "Studio master — 3!4! Style",
    blurb:
      "Tighter dynamic range, polished for casual listening on earbuds and laptop speakers.",
  },
  concert: {
    src: "/showcase/kpop-3-4-style/concert.mp3",
    label: "Concert master — 3!4! Style",
    blurb:
      "Wider dynamic range — ideal for studio monitors or a quiet room with headphones.",
  },
};

const styleParts: Array<{ part: string; rule: string }> = [
  {
    part: "Melody",
    rule:
      "Composed by Claude under the style template's contour and rhythmic conventions. Free-write inside a tight per-section spec.",
  },
  {
    part: "Chord track",
    rule:
      "K-pop-idiomatic progressions including harmonic substitutions — bVI on the bridge, the surprise that earns the chorus return.",
  },
  {
    part: "Accompaniment",
    rule:
      "Derived algorithmically from the chord track — bass, pad, arpeggiator, lead voicings all read the chord track rather than being free-composed.",
  },
  {
    part: "Drums",
    rule:
      "Dilla-style snare push (slight backbeat displacement) layered against a straight kick grid. Sidechain ducking pulls the pad under the kick for the breathing effect.",
  },
  {
    part: "Banjeon edits",
    rule:
      "반전 — Korean for 'reversal / surprise'. Thirteen banjeon edits per Gemini's critique of v3: section transitions, unexpected accents, brief drop-outs that earn the next section.",
  },
];

const versions: Array<{ tag: string; title: string; body: string }> = [
  {
    tag: "v1",
    title: "Decomposed style template",
    body:
      "First pass under the new template architecture — melody from Claude, accompaniment derived algorithmically from the chord track. Working draft of the form.",
  },
  {
    tag: "v2",
    title: "Lead + pad voicing pass",
    body:
      "Refined lead synth voicings; pad voicings widened in the chorus, narrowed in the verse. First Dilla-style snare push experiments.",
  },
  {
    tag: "v3",
    title: "Section-shape commitments",
    body:
      "Pre-chorus → chorus build clarified; bridge harmonic motion locked. Gemini critique: 'sections sound the same — nothing surprising happens.'",
  },
  {
    tag: "v4",
    title: "Thirteen banjeon edits",
    body:
      "Thirteen 반전 (surprise) edits at the section seams and within the chorus. Drop-outs, unexpected accents, harmonic substitutions including a bVI on the bridge.",
  },
  {
    tag: "v5",
    title: "Mix + sidechain pass",
    body:
      "Sidechain ducking pulls the pad under the kick — the breathing effect that defines modern K-pop production. Bass tucked in, lead brought forward.",
  },
  {
    tag: "v6",
    title: "Final master",
    body:
      "Final realism + mixing pass on both studio and concert cuts. Stable reference render for the decomposed-template piece.",
  },
];

const KpopThreeFourStyle = () => {
  const heroRef = useReveal<HTMLDivElement>();
  const descRef = useReveal<HTMLDivElement>();
  const partsRef = useReveal<HTMLDivElement>();
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
            Wavelody showcase · piece VII · decomposed style template
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            3!4! Style
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            A K-pop production built from a decomposed style template — the
            melody is freely composed by Claude, the accompaniment is derived
            algorithmically from the chord track.
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
              durationHint="2:55"
              variant="hero"
              groupKey="three-four-style-hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              {master.blurb}
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Synth lead · pad · bass · drums · K-pop production · 2:55
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
              A 2:55 K-pop production in the modern radio template — verse,
              pre-chorus build, chorus, post-chorus hook, bridge, final
              chorus. The thing this piece demonstrates isn't the result so
              much as the <em>architecture</em> behind it.
            </p>
            <p>
              The genre is decomposed into parts the LLM is good at (melodic
              shape, lyric phrasing, dramatic structure) and parts an
              algorithm is better at (chord-driven accompaniment, sidechained
              pad voicings, bass placement). Each part is solved by the tool
              that fits. The whole is greater than what either could do
              alone.
            </p>
          </div>
        </div>
      </section>

      {/* Style template parts */}
      <section className="px-6 pb-20">
        <div ref={partsRef} className="reveal mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            The decomposition
          </div>
          <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
            What Claude composed, what the algorithm derived
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Each row is a part of the production. The rule decides whether
            Claude writes it freely or whether the algorithm reads the chord
            track and emits it deterministically.
          </p>

          <div className="mt-8 space-y-3">
            {styleParts.map((p) => (
              <div
                key={p.part}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="w-40 shrink-0 font-mono text-sm uppercase tracking-[0.12em] text-foreground">
                  {p.part}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {p.rule}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why decomposed templates matter */}
      <section className="px-6 pb-20">
        <div ref={whyRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            Why decomposed templates matter
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Genre fidelity.</span>{" "}
              An LLM asked to write K-pop end-to-end produces a passable
              imitation. An LLM asked to compose only the melody, while the
              accompaniment is derived from a chord track via genre-specific
              rules, produces a piece that <em>sits in the genre</em>. The
              decomposition encodes what the genre demands and gives Claude
              the freedom to be creative inside that frame.
            </p>
            <p>
              <span className="font-medium text-foreground">Banjeon, not Beyer.</span>{" "}
              Korean producers talk about{" "}
              <span className="font-mono text-foreground">반전</span> —
              reversal, surprise, the moment the song flips. Gemini's critique
              of v3 was 'sections sound the same — nothing surprising
              happens'. Thirteen banjeon edits later, the piece earns its
              chorus returns.
            </p>
            <p>
              <span className="font-medium text-foreground">
                Reproducibility across pieces.
              </span>{" "}
              The K-pop template is encoded; the next K-pop piece uses
              exactly the same accompaniment derivation, the same chord-track
              vocabulary, the same drum-mix philosophy. Claude composes a
              different melody on top.
            </p>
            <p className="border-l-2 border-primary/60 pl-5 text-foreground/90">
              Different genre, same product thesis: structured score
              generation with style templates as constraints scales to fast
              and consistent music creation.
            </p>
          </div>
        </div>
      </section>

      {/* Iteration history */}
      <section className="px-6 pb-20">
        <div ref={iterationsRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            Six versions to final master
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

export default KpopThreeFourStyle;
