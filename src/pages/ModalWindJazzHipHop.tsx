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
    src: "/showcase/modal-wind-jazz-hiphop/studio.mp3",
    label: "Studio master — Colors of the Modal Wind (jazz hip-hop)",
    blurb:
      "Tighter dynamic range, polished for casual listening on earbuds and laptop speakers.",
  },
  concert: {
    src: "/showcase/modal-wind-jazz-hiphop/concert.mp3",
    label: "Concert master — Colors of the Modal Wind (jazz hip-hop)",
    blurb:
      "Wider dynamic range — ideal for studio monitors or a quiet room with headphones.",
  },
};

const celloSubsystem: Array<{ title: string; body: string }> = [
  {
    title: "Per-note bow articulation modeling",
    body:
      "Every cello note carries an explicit bow profile — attack character, bow speed, bow pressure, change-direction timing. Not a single articulation parameter per note; an envelope of bow physics across the note's life.",
  },
  {
    title: "5+ simultaneous SWAM CC streams",
    body:
      "Expression, vibrato rate, vibrato depth, bow position, and dynamics CCs are all driven in parallel from the cello composer subsystem, phase-decorrelated so the cello doesn't read as a synth pad.",
  },
  {
    title: "Deep-bellow range composition",
    body:
      "Composed for the cello's chest-resonance range — C2 to G3 — where the instrument has its idiomatic timbral weight. The piano lead floats above; the cello is the room the piano lives in.",
  },
  {
    title: "Instruments take turns",
    body:
      "The piece's voice-leading rule is anti-simultaneity. When the piano leads, the cello holds or rests. When the cello speaks, the piano steps back. The texture is conversation, not chord-on-chord.",
  },
];

const versions: Array<{ tag: string; title: string; body: string }> = [
  {
    tag: "v1–v5",
    title: "First five iterations — getting the form right",
    body:
      "From a Korean-language brief — '3:50 piano lead, cello background, modal minor'. Early versions establish form and harmony, with cello as a sustained drone behind the piano.",
  },
  {
    tag: "v6–v10",
    title: "Cello starts to speak",
    body:
      "Cello moves from drone to a counter-voice — short phrase punctuations behind the piano line. The instrument-take-turns rule starts to emerge as the texture clarifies.",
  },
  {
    tag: "v11–v14",
    title: "First realism crisis",
    body:
      "Listening back, the cello reads as a synth pad rather than a player. The realism problem is identified — single CC streams aren't enough to carry physical-modeling cello realism.",
  },
  {
    tag: "v15–v17",
    title: "Cello subsystem",
    body:
      "The cello gets its own composer subsystem: per-note bow articulation, multiple parallel SWAM CC streams, deep-bellow range constraints. Each iteration tightens the bow profile.",
  },
  {
    tag: "v18",
    title: "Cello subsystem reference take",
    body:
      "Stable cello subsystem; full instruments-take-turns texture. The cello story closes; the piano right hand becomes the next iteration target.",
  },
  {
    tag: "v19",
    title: "Modal scale awareness in the right hand",
    body:
      "The piano RH learns to track the chord progression's modal mixture — Lydian over borrowed major chords, harmonic minor over Am(maj9), and so on. The modal moments stop sounding accidental and start sounding inhabited.",
  },
  {
    tag: "v20",
    title: "White-key / black-key phase mirror",
    body:
      "A black-key landing in the first half of the form gets a Lydian #11 echo over a Cmaj9 in the second half — a quiet symmetry that pays off the earlier color shift without underlining it.",
  },
  {
    tag: "v21",
    title: "Final master",
    body:
      "Climax LH voicing fix — a quartal voicing was producing non-chord-tones over a Bb7#11 peak, now properly voiced. Final cello realism polish: per-note SWAM detail across CC11 (capped under the 63 threshold), vibrato fade-in on CC1, per-note vibrato rate on CC19, and a post-peak sustain envelope at the climax.",
  },
];

const ModalWindJazzHipHop = () => {
  const heroRef = useReveal<HTMLDivElement>();
  const descRef = useReveal<HTMLDivElement>();
  const celloRef = useReveal<HTMLDivElement>();
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
            Wavelody showcase · piece VI · jazz hip-hop
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            Colors of the Modal Wind
            <span className="mt-2 block font-serif-display text-2xl text-muted-foreground sm:text-3xl md:text-4xl">
              Jazz Hip-Hop
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            Piano lead, cello shadow, modal minor. Composed from a
            Korean-language brief — twenty-one iterations refining cello
            realism and the piano's modal-scale awareness.
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
              durationHint="3:53"
              variant="hero"
              groupKey="modal-wind-jazz-hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              {master.blurb}
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Piano · cello · modal minor · 3:53
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
              The piece started as a Korean-language brief from my wife —
              'piano lead, cello background, modal minor, around three-fifty'.
              Short brief, long road. The piano part came together quickly;
              the cello took eighteen iterations. Three more passes after
              that pulled the piano right hand into the chord progression's
              modal mixture so the harmony stopped sounding accidental.
            </p>
            <p>
              The challenge wasn't writing notes for the cello — the
              composer's first cello pass sounded fine on paper. The problem
              was that physical-modeling cello, played from a single MIDI CC
              track, reads as a synth pad. Real cellists do dozens of things
              per note: where the bow contacts the string, how fast the bow
              moves, when the bow changes direction, how vibrato sits over
              the note. Capturing that needed more than a composer prompt —
              it needed its own subsystem.
            </p>
          </div>
        </div>
      </section>

      {/* Cello subsystem — the headline story */}
      <section className="px-6 pb-20">
        <div ref={celloRef} className="reveal mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            The cello subsystem
          </div>
          <h2 className="font-serif-display text-3xl tracking-tight md:text-4xl">
            What it took to make the cello sound like a cello
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Eighteen versions on the cello alone, but the work clusters into
            four ideas. Each one was a v-N moment where the cello suddenly
            sounded more like an instrument than a sample.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {celloSubsystem.map((c) => (
              <div
                key={c.title}
                className="rounded-xl border border-border/60 bg-card/40 p-6"
              >
                <h3 className="font-serif-display text-xl tracking-tight text-foreground">
                  {c.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sister piece note */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-8 md:p-10">
            <h2 className="font-serif-display text-2xl tracking-tight md:text-3xl">
              Same title, different world
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A sister piece — also called <em>Colors of the Modal Wind</em> —
              exists as a rule-based chamber ballad: oboe, double bass, piano,
              flute, clarinet, D Aeolian, constraint-prompted under a strict
              per-voice rule set. Same title, two compositions, two
              productions, one shared idea of what 'the Modal Wind' is.
            </p>
            <div className="mt-6">
              <Link
                to="/the-modal-wind"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-transform hover:translate-x-0.5"
              >
                Listen to the rule-based ballad version
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Iteration history */}
      <section className="px-6 pb-20">
        <div ref={iterationsRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            Twenty-one versions — cello realism, then modal awareness
          </h2>
          <div className="mt-8 space-y-3">
            {versions.map((v) => (
              <div
                key={v.tag}
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="w-20 shrink-0 font-mono text-sm uppercase tracking-[0.18em] text-primary/90">
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

export default ModalWindJazzHipHop;
