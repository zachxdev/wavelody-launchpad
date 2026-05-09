import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import { useReveal } from "@/hooks/useReveal";

const voices: Array<{ family: string; instruments: string }> = [
  { family: "Piano", instruments: "Pianoteq Hamburg Steinway D — pedal-held resonance carries the negative space" },
  { family: "Strings", instruments: "Violin, Cello — sigimsae pitch slides only on these" },
  { family: "Winds", instruments: "Flute, Oboe — breath/vibrato character only" },
  { family: "Brass", instruments: "Trumpet, French Horn — punctuating calls in V1" },
  { family: "Sax", instruments: "Saxophone — heterophonic shadow → solo voice → distant fade" },
];

const features: Array<{ title: string; body: string; korean?: string }> = [
  {
    title: "Heterophonic texture",
    korean: "한국 전통",
    body: "Each voice carries a related-but-not-identical version of the line. Different ornaments per voice on the same melodic skeleton — the unity-through-variation that defines Korean ensemble tradition.",
  },
  {
    title: "Sigimsae ornamentation",
    korean: "시김새",
    body: "Characteristic Korean note-by-note expression. Slide-into-pitch (quarter-tone bend), yo-seong slow-wide vibrato, jul-pi faster narrower vibrato, slide-out-of-pitch on release, breath swells. Strings only get pitch slides; non-string instruments use breath and vibrato character only.",
  },
  {
    title: "Yeobaek negative space",
    korean: "여백",
    body: "Korean tradition's blank space concept. Total silences are rare and structural; the connective tissue is pedal-held piano resonance carrying through what would otherwise be silence. It's a sound and also it isn't. Lingering, thoughtful.",
  },
  {
    title: "Structural arc",
    body: "Trumpet enters with a 4-note pickup at bar 4, plus three punctuating brass calls in V1. Flute carries V1 lead while Violin sits silent. Violin returns dramatically at V2 with a slide-into-pitch entry. Saxophone joins as distant heterophonic shadow throughout.",
  },
  {
    title: "Saxophone fade-out",
    body: "From the chorus through the coda — bars 37–52, a 40-second window — the dry/wet ratio shifts to room-only. The saxophone solo gradually recedes into distance, sounding by piece end as if it were playing from the next room.",
  },
  {
    title: "Bar 41 climax",
    body: "Saxophone altissimo F5 with breath swell and slow-wide vibrato — a single solo voice over Cello drone and Piano pedal-held F-pentatonic chord. A different character from the Classical version's tutti climax — intimacy as peak, not weight.",
  },
];

const TheHiddenHeartModernAsian = () => {
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
            Orchestral showcase · arrangement B
          </div>
          <h1 className="font-serif-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            The Hidden Heart
            <span className="mt-2 block font-serif-display text-2xl text-muted-foreground sm:text-3xl md:text-4xl">
              Modern Asian Arrangement
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            An 8-voice rendering drawing on Korean traditional aesthetics —
            heterophony, sigimsae ornamentation, yeobaek negative space carried
            by pedal-held piano resonance.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <AudioPlayer
              src="/showcase/serenade/orchestral-modern-asian.mp3"
              label="Modern Asian Arrangement — The Hidden Heart"
              durationHint="3:30"
              variant="hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              SWAM physical-modeling solo strings, winds, brass, sax · Pianoteq
              9 (HB Steinway D Classical) · Korean Hall reverb with per-voice
              spatial automation · via Reaper headless pipeline.
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            8 voices · F major · 54 bars at q=62 · ~3:30
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
              The same 54 bars at the same tempo — but rebuilt under a
              different aesthetic. Where the Classical arrangement seeks
              continuous expressive unity, this one is built around{" "}
              <em>heterophony</em> and <em>negative space</em>. Voices share
              the line but ornament it differently. Silence isn't absence — the
              piano's pedal-held resonance carries the room between phrases.
            </p>
            <p>
              The piece's emotional arc reroutes through a saxophone that
              enters as a shadow, takes the foreground at the chorus, and
              spends the coda fading into the next room — the dry/wet balance
              shifting over forty seconds until the listener is straining a
              little to hear it. <em>Lingering, thoughtful.</em>
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
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif-display text-xl tracking-tight text-foreground">
                    {f.title}
                  </h3>
                  {f.korean && (
                    <span className="shrink-0 font-mono text-xs uppercase tracking-[0.14em] text-primary/80">
                      {f.korean}
                    </span>
                  )}
                </div>
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

export default TheHiddenHeartModernAsian;
