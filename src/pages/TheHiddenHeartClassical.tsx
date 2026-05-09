import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import { useReveal } from "@/hooks/useReveal";

const voices: Array<{ family: string; instruments: string }> = [
  { family: "Piano", instruments: "Pianoteq Hamburg Steinway D Classical" },
  { family: "Strings", instruments: "Violin I, Violin II, Viola, Cello" },
  { family: "Winds", instruments: "Flute, Oboe, Clarinet" },
  { family: "Brass", instruments: "French Horn" },
];

const features: Array<{ title: string; body: string }> = [
  {
    title: "Hierarchical voice balance",
    body: "Continuous expressive texture across nine voices, with section-aware role hierarchy: Piano leads the verses, Oboe carries the bridge, Violin I + Flute crown the chorus.",
  },
  {
    title: "Within-note breathing",
    body: "Every sustained note breathes via per-instrument-family CC11 wave overlay — strings smoother sinusoidal, winds with breath catches, brass with stronger amplitude. Notes are alive, not stationary.",
  },
  {
    title: "Phase-decorrelated voices",
    body: "Each instrument carries its own undulation pattern. The result reads as independent players rather than a single unified texture — the ensemble breathes as a chamber group, not a synth pad.",
  },
  {
    title: "Bar 41 wave apex",
    body: "Tutti ensemble peak — Horn low F under Piano rolled F-pentatonic chord. Weight, not volume.",
  },
];

const TheHiddenHeartClassical = () => {
  const descRef = useReveal<HTMLDivElement>();
  const featuresRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav
        rightLink={{ to: "/the-hidden-heart", label: "← Back to The Hidden Heart" }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center px-6 pt-[52px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(173_80%_40%_/_0.10),_transparent_60%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <Link
            to="/the-hidden-heart"
            className="mb-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            The Hidden Heart
          </Link>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Orchestral showcase · arrangement A
          </div>
          <h1 className="font-serif-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            The Hidden Heart
            <span className="mt-2 block font-serif-display text-2xl text-muted-foreground sm:text-3xl md:text-4xl">
              Classical Orchestral Arrangement
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            A 9-voice classical chamber rendering — piano, string quartet,
            woodwind trio, French horn. Continuous expressive texture, every
            note breathing.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <AudioPlayer
              src="/showcase/serenade/orchestral-classical.mp3"
              label="Classical Orchestral Arrangement — The Hidden Heart"
              durationHint="3:30"
              variant="hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              SWAM physical-modeling solo strings, winds, brass · Pianoteq 9
              (HB Steinway D Classical) · Korean Hall reverb · via Reaper
              headless pipeline.
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            9 voices · F major · 54 bars at q=62 · ~3:30 · peak −3 dBFS · DR ~30 dB
          </p>
        </div>
      </section>

      {/* Voices + description */}
      <section className="px-6 py-20">
        <div ref={descRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            About this arrangement
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              Where the original is a single performer at one keyboard, this
              arrangement redistributes the same score across nine voices. The
              piano keeps its hero role through the verses; the orchestra
              widens the harmonic field around it. Same bars, same tempo, same
              pentatonic discipline — a true rearrangement, not a variation.
            </p>
            <p>
              The aim is the chamber-music ideal: nine independent musicians
              listening to each other, not a single texture. Per-voice phase
              decorrelation and family-specific breath profiles do the work
              that, in a hall, the players would do unconsciously.
            </p>
          </div>

          {/* Voices */}
          <div className="mt-10 space-y-3">
            {voices.map((v) => (
              <div
                key={v.family}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-nowrap"
              >
                <span className="w-24 shrink-0 font-mono text-sm uppercase tracking-[0.14em] text-muted-foreground">
                  {v.family}
                </span>
                <span className="text-sm text-foreground">{v.instruments}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="px-6 pb-20">
        <div ref={featuresRef} className="reveal mx-auto max-w-4xl">
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border/60 bg-card/40 p-6"
              >
                <h3 className="font-serif-display text-xl tracking-tight text-foreground">
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-3 text-center">
          <Link
            to="/the-hidden-heart"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View the original solo piano version
            <span aria-hidden="true">→</span>
          </Link>
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

export default TheHiddenHeartClassical;
