import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import OrchestralRoundRobin from "@/components/showcase/OrchestralRoundRobin";
import { finalIteration } from "@/components/showcase/iterations";
import { lullabyFinalIteration } from "@/components/showcase/lullabyIterations";
import { serenadeFinalIteration } from "@/components/showcase/serenadeIterations";
import { skyCombatFinalIteration } from "@/components/showcase/skyCombatIterations";
import { useReveal } from "@/hooks/useReveal";

type ShowcaseCard = {
  href: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  audioSrc: string;
  audioLabel: string;
  durationHint: string;
  meta: string;
  groupKey: string;
  footnote?: string;
};

const cards: ShowcaseCard[] = [
  {
    href: "/the-living-engine",
    number: "I",
    title: "The Living Engine",
    tagline: "A Ravel-style piano suite — five movements in F♯ minor.",
    description:
      "Built from a 31-letter macro pattern. Octatonic harmony, 5:4 and 7:8 cross-pulses, a three-phase growth arc in Mvt IV. Thirteen versions, seven Gemini critique rounds.",
    audioSrc: finalIteration.audio,
    audioLabel: "v13 — The Living Engine",
    durationHint: "6:06",
    meta: "Solo piano · F♯ minor · 5 movements · 6:06",
    groupKey: "catalog",
  },
  {
    href: "/the-wandering-lullaby",
    number: "II",
    title: "The Wandering Lullaby",
    tagline: "An original lyrical-fantasy piano medley in D-major orbit.",
    description:
      "Five sections — Lullaby, Woodland Dance, Celestial, Lyrical Ballad, Reprise — architected before any note was composed. Ten versions, nine Gemini rounds, one surgical final cut.",
    audioSrc: lullabyFinalIteration.audio,
    audioLabel: "v10 (surgical) — The Wandering Lullaby",
    durationHint: "3:26",
    meta: "Solo piano · D major · 5 sections · 3:26",
    groupKey: "catalog",
  },
  {
    href: "/the-hidden-heart",
    number: "III",
    title: "The Hidden Heart",
    tagline: "An original solo piano love serenade — restrained warmth in F.",
    description:
      "F major-pentatonic gōng vocabulary in both hands with a single bar 33 E♭ modal-mixture exception. Restraint as dynamic compression: an mp floor, a single mf bar at the climax. Ten versions, two rejected branches, verifier-enforced pentatonic discipline.",
    audioSrc: serenadeFinalIteration.audio,
    audioLabel: "v10 — The Hidden Heart",
    durationHint: "3:35",
    meta: "Solo piano · F major · pentatonic discipline · 3:35",
    groupKey: "catalog",
    footnote: "Now also as orchestral arrangements — Classical and Modern Asian.",
  },
  {
    href: "/sky-combat",
    number: "IV",
    title: "Sky Combat",
    tagline: "An original virtuosic piano piece in the aerial-combat tradition.",
    description:
      "B minor / B major modal mixture, 160 BPM, 120 bars, ~3066 notes. Mazeppa parallel thirds, Rachmaninoff broken-chord storms, Islamey machine-gun drumming, hand cross-overs as dramatic punctuation. Eight versions, six Gemini critique rounds, two pivotal human-driven surgical fixes.",
    audioSrc: skyCombatFinalIteration.audio,
    audioLabel: "v8 — Sky Combat",
    durationHint: "3:02",
    meta: "Solo piano · B minor / B major · 120 bars at 160 BPM · 3:02",
    groupKey: "catalog",
  },
  {
    href: "/the-modal-wind",
    number: "V",
    title: "Colors of the Modal Wind",
    tagline: "An original chamber ballad — composed under strict compositional rules.",
    description:
      "The first showcase composed entirely under strict constraint prompting. Oboe carries a non-repeating lyric line; double bass is the only voice allowed to repeat patterns; piano LH is always a 4-key chord; piano RH alternates 4-key and 3-key. The rules do half the creative work — and the LLM composes roughly twice as fast, with stronger style consistency.",
    audioSrc: "/showcase/modal-wind/studio.mp3",
    audioLabel: "v7 studio — Colors of the Modal Wind",
    durationHint: "3:58",
    meta: "Oboe · double bass · piano · flute · clarinet · D Aeolian · 3:58",
    groupKey: "catalog",
    footnote: "Constraint-prompted composition — also available as a jazz hip-hop arrangement.",
  },
  {
    href: "/the-modal-wind-jazz-hiphop",
    number: "VI",
    title: "Colors of the Modal Wind",
    tagline: "A jazz hip-hop arrangement — piano lead, cello shadow, modal minor.",
    description:
      "Composed from a Korean-language brief — 3:50 piano lead, cello background, modal minor. Eighteen iterations refining cello realism; the cello eventually got its own subsystem (per-note bow articulation, 5+ simultaneous SWAM CC streams, deep-bellow range composition). The piece showcases instruments taking turns rather than playing simultaneously.",
    audioSrc: "/showcase/modal-wind-jazz-hiphop/studio.mp3",
    audioLabel: "v18 studio — Colors of the Modal Wind (jazz hip-hop)",
    durationHint: "3:53",
    meta: "Piano · cello · modal minor · 3:53",
    groupKey: "catalog",
    footnote: "Sister arrangement to the rule-based ballad — same title, different world.",
  },
];

const ShowcaseCardView = ({ card }: { card: ShowcaseCard }) => {
  const ref = useReveal<HTMLDivElement>();
  return (
    <article
      ref={ref}
      className="reveal group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-7 transition-colors hover:border-primary/40 sm:p-8"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary/90">
          Piece {card.number}
        </span>
      </div>
      <h2 className="mt-3 font-serif-display text-3xl leading-tight tracking-tight text-foreground sm:text-[2.5rem]">
        {card.title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-foreground/90">
        {card.tagline}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {card.description}
      </p>

      <div className="mt-6">
        <AudioPlayer
          src={card.audioSrc}
          label={card.audioLabel}
          durationHint={card.durationHint}
          groupKey={card.groupKey}
        />
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {card.meta}
        </p>
      </div>

      {card.footnote && (
        <p className="mt-4 text-xs italic text-muted-foreground/80">
          {card.footnote}
        </p>
      )}

      <div className="mt-7 flex flex-1 items-end">
        <Link
          to={card.href}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-transform hover:translate-x-0.5"
        >
          Open
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};

const Index = () => {
  const introRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="absolute inset-x-0 top-0 z-30">
        <nav className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-6">
          <Link to="/" className="font-serif-display text-xl tracking-tight">
            Wavelody
          </Link>
          <Link
            to="/access"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Speedrun access
          </Link>
        </nav>
      </header>

      {/* Hero / framing */}
      <section className="relative px-6 pb-12 pt-[112px] sm:pt-[140px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(173_80%_40%_/_0.10),_transparent_60%)]"
        />
        <div ref={introRef} className="reveal mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Wavelody — showcase
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Score-first, sound second.
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-base leading-relaxed text-muted-foreground sm:text-lg">
            Six original compositions, each built end-to-end through
            structured score generation — four through free composition with
            AI critique, and two arrangements of the same "Modal Wind" theme
            built through constraint prompting and decomposed templates.
            Click in to hear the work — and the process.
          </p>
        </div>
      </section>

      {/* Catalog cards */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <ShowcaseCardView key={card.href} card={card} />
          ))}
        </div>
      </section>

      {/* Orchestral arrangements — auto-rotating round-robin */}
      <OrchestralRoundRobin />

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-2 text-center">
          <div className="flex items-center justify-center gap-5">
            <a
              href="mailto:zach@wavelody.com"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Email
            </a>
            <span aria-hidden="true" className="text-muted-foreground/40">
              ·
            </span>
            <Link
              to="/access"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Speedrun access
            </Link>
          </div>
          <p className="text-xs text-muted-foreground/70">© 2026 Wavelody.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
