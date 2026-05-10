import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import { useReveal } from "@/hooks/useReveal";

type OrchestralCard = {
  href: string;
  piece: string;
  arrangement: string;
  oneLiner: string;
  audioSrc: string;
  audioLabel: string;
  durationHint: string;
};

const cards: OrchestralCard[] = [
  {
    href: "/the-hidden-heart/classical-orchestra",
    piece: "The Hidden Heart",
    arrangement: "Classical Orchestral",
    oneLiner:
      "9-voice classical chamber arrangement — piano, string quartet, woodwind trio, French horn.",
    audioSrc: "/showcase/serenade/orchestral-classical.mp3",
    audioLabel: "Classical Orchestral — The Hidden Heart",
    durationHint: "3:30",
  },
  {
    href: "/the-hidden-heart/modern-asian-orchestra",
    piece: "The Hidden Heart",
    arrangement: "Modern Asian",
    oneLiner:
      "8-voice Korean-traditional aesthetic — heterophony, sigimsae, yeobaek negative space, saxophone fade.",
    audioSrc: "/showcase/serenade/orchestral-modern-asian.mp3",
    audioLabel: "Modern Asian — The Hidden Heart",
    durationHint: "3:30",
  },
  {
    href: "/sky-combat/symphonic",
    piece: "Sky Combat",
    arrangement: "Symphonic",
    oneLiner:
      "17-voice full orchestra — strings, woodwind quintet, full brass, piano-as-percussion in the lineage of Holst, Wagner, Stravinsky, Prokofiev.",
    audioSrc: "/showcase/sky-combat/symphonic.mp3",
    audioLabel: "Symphonic — Sky Combat",
    durationHint: "3:17",
  },
];

const ROTATION_MS = 6000;
const GROUP_KEY = "orchestral-round-robin";

const OrchestralRoundRobin = () => {
  const sectionRef = useReveal<HTMLDivElement>();
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-rotate while not paused.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActiveIdx((i) => (i + 1) % cards.length);
    }, ROTATION_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  // Pause auto-rotation when user is interacting with any audio in the group.
  useEffect(() => {
    const onPlayInGroup = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!target || target.tagName !== "AUDIO") return;
      if (containerRef.current?.contains(target)) {
        setPaused(true);
      }
    };
    document.addEventListener("play", onPlayInGroup, true);
    return () => document.removeEventListener("play", onPlayInGroup, true);
  }, []);

  const goTo = (idx: number) => {
    setActiveIdx(((idx % cards.length) + cards.length) % cards.length);
    setPaused(true);
  };

  return (
    <section
      ref={sectionRef}
      className="reveal px-6 pb-20"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Orchestral showcase
          </div>
          <h2 className="font-serif-display text-3xl tracking-tight sm:text-4xl">
            Now also as orchestral arrangements
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            The same scores, rebuilt for ensembles. Three realizations rotating
            below — hover to hold one, click any card to open it.
          </p>
        </div>

        <div
          ref={containerRef}
          className="flex flex-col gap-5 md:flex-row md:items-stretch"
        >
          {cards.map((card, idx) => {
            const isActive = idx === activeIdx;
            return (
              <article
                key={card.href}
                aria-current={isActive ? "true" : undefined}
                className={[
                  "group relative flex flex-1 flex-col rounded-2xl border bg-card/60 p-6 transition-all duration-500 ease-out",
                  isActive
                    ? "scale-[1.025] border-primary/50 bg-card/80 shadow-[0_0_60px_-20px_hsl(173_80%_40%/0.55)] md:scale-[1.04]"
                    : "scale-100 border-border/60 opacity-80 hover:opacity-100",
                ].join(" ")}
              >
                <div className="flex items-baseline gap-3">
                  <span
                    className={[
                      "font-mono text-xs uppercase tracking-[0.18em] transition-colors",
                      isActive ? "text-primary" : "text-primary/70",
                    ].join(" ")}
                  >
                    {card.piece}
                  </span>
                </div>
                <h3 className="mt-2 font-serif-display text-2xl leading-tight tracking-tight text-foreground">
                  {card.arrangement}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {card.oneLiner}
                </p>

                <div className="mt-5">
                  <AudioPlayer
                    src={card.audioSrc}
                    label={card.audioLabel}
                    durationHint={card.durationHint}
                    groupKey={GROUP_KEY}
                  />
                </div>

                <div className="mt-6 flex flex-1 items-end">
                  <Link
                    to={card.href}
                    onClick={() => setPaused(true)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-transform hover:translate-x-0.5"
                  >
                    Open
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Manual navigation: arrows + dot indicators */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous arrangement"
            onClick={() => goTo(activeIdx - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            {cards.map((card, idx) => (
              <button
                key={card.href}
                type="button"
                aria-label={`Show ${card.piece} — ${card.arrangement}`}
                aria-current={idx === activeIdx ? "true" : undefined}
                onClick={() => goTo(idx)}
                className={[
                  "h-2 rounded-full transition-all duration-300",
                  idx === activeIdx
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted hover:bg-muted-foreground/40",
                ].join(" ")}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Next arrangement"
            onClick={() => goTo(activeIdx + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/60 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OrchestralRoundRobin;
