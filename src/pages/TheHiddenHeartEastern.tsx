import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import { useReveal } from "@/hooks/useReveal";

const features: Array<{ title: string; body: string }> = [
  {
    title: "Pan-East-Asian palette",
    body:
      "Where the Modern Asian arrangement is specifically Korean — heterophony, sigimsae, yeobaek — this arrangement opens the lens wider across an East Asian sound world. Same F-pentatonic skeleton; different ornament vocabulary.",
  },
  {
    title: "Negative space, longer",
    body:
      "The Korean arrangement uses pedal-held piano resonance to carry silence between phrases. This one stretches the same idea further — at ~4:40 it is the longest of the three orchestral takes, with extended room-only passages between phrases.",
  },
  {
    title: "Same form, third realization",
    body:
      "Same bar count, same tempo, same key as the solo piano original and the other two orchestral arrangements. The score is the work; this is a third independent realization of it. Reorchestrating is a redistribution problem, not a recomposing problem.",
  },
  {
    title: "Bar 41 climax — different gesture",
    body:
      "Where the Classical arrangement peaks with tutti weight and the Modern Asian arrangement peaks with a saxophone altissimo F5 over piano pedal-held F-pentatonic, this version's climax takes a third path — slower, breath-led, and more sustained through the bar 45 'implied breath' moment.",
  },
];

const TheHiddenHeartEastern = () => {
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
            Orchestral showcase · arrangement C
          </div>
          <h1 className="font-serif-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            The Hidden Heart
            <span className="mt-2 block font-serif-display text-2xl text-muted-foreground sm:text-3xl md:text-4xl">
              Eastern Arrangement
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            A pan-East-Asian rendering — dizi flute, erhu, guzheng, shakuhachi
            character. Wider ornament vocabulary, longer negative space, plucked
            sweeps at the structural pivots.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <AudioPlayer
              src="/showcase/serenade/orchestral-eastern.mp3"
              label="Eastern Arrangement — The Hidden Heart"
              durationHint="4:40"
              variant="hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              SWAM physical-modeling solo strings and winds · Pianoteq 9
              (HB Steinway D Classical) · Concert Hall reverb with extended
              tail · via Reaper headless pipeline.
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            F major · 54 bars at q=62 · ~4:40
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="px-6 py-20">
        <div ref={descRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            About this arrangement
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              The third orchestral realization of the same 54 bars. Where the
              Classical arrangement aims at chamber-music unity and the Modern
              Asian arrangement zooms in specifically on Korean tradition, this
              version opens the lens wider — an East Asian ornament palette
              over the same F-pentatonic skeleton.
            </p>
            <p>
              The piece sits in the same key, at the same tempo, with the same
              bar-by-bar form. What changes is the way each voice attacks,
              decays, and connects — breath-led winds, slide-led strings, and
              a longer tolerance for silence between phrases. This is the
              longest of the three orchestral takes by design.
            </p>
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

export default TheHiddenHeartEastern;
