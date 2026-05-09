import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import SkyCombatBlueprint from "@/components/showcase/SkyCombatBlueprint";
import { useReveal } from "@/hooks/useReveal";

const sections: Array<{ letter: string; name: string; note: string }> = [
  { letter: "I", name: "Gathering Storm", note: "Bars 1-8 · low B pedal vs high broken-octave tremolo, accelerating dim7 arpeggios into the Threat" },
  { letter: "A", name: "Threat Emerges", note: "Bars 9-24 · Mazeppa parallel-thirds RH, jagged Boss theme LH, three Neapolitan C6 cross-over stabs at unpredictable beats" },
  { letter: "t1", name: "Lull", note: "Bars 25-28 · texture thins to ghostly Boss-theme echoes — the breath before the Hero" },
  { letter: "B", name: "Hero's Stand", note: "Bars 29-44 · unison heroic octaves in B major, FIRST PEAK at bar 44 (Hero clarity, ff)" },
  { letter: "D", name: "Combat (Development)", note: "Bars 45-84 · five differentiated episodes — Winter-Wind / role-inversion / Rachmaninoff / Islamey / morphing tremolo" },
  { letter: "t2", name: "Pre-climax", note: "Bars 85-92 · chromatic dim7 climb LH + full-keyboard sweeps RH, doubled rhythmic activity, f → fff" },
  { letter: "X", name: "Climactic Cross-Fire", note: "Bars 93-108 · polychord crisis, three cross-over stabs/bar at 101-104, MAIN PEAK (Combat chaos, fff)" },
  { letter: "C", name: "Coda", note: "Bars 109-120 · triumphant B major restatement, ascending full-keyboard sweep, two final B major hammers across 5+ octaves" },
];

const SkyCombat = () => {
  const descRef = useReveal<HTMLDivElement>();
  const sectionsRef = useReveal<HTMLDivElement>();
  const blueprintRef = useReveal<HTMLDivElement>();
  const ctaRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav
        rightLink={{ to: "/sky-combat/iterations", label: "How it was made" }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center px-6 pt-[52px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(173_80%_40%_/_0.10),_transparent_60%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Showcase
          </Link>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Wavelody showcase · piece IV
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            Sky Combat
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            An original virtuosic piano piece, composed by Wavelody.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <AudioPlayer
              src="/showcase/sky-combat/v8.mp3"
              label="v8 — Sky Combat"
              durationHint="3:02"
              variant="hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              Rendered with Pianoteq 9 physical-modeling engine (Hamburg Steinway D).
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Solo piano · B minor / B major · 120 bars at 160 BPM · ~3066 notes · 3:02
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="px-6 py-20">
        <div ref={descRef} className="reveal mx-auto max-w-3xl">
          <h2 className="font-serif-display text-3xl tracking-tight">
            About the piece
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
            <p>
              An original solo piano piece in the virtuosic-aerial-combat
              tradition — relentless 16th-note cascades, hand cross-overs as
              dramatic punctuation, octave passages, and two differentiated
              climactic peaks (Hero clarity at bar 44, Combat chaos at bars
              101-104). 120 bars at 160 BPM, ~3 minutes.
            </p>
            <p>
              B minor tonal center with B major modal mixture for the heroic
              passages — the duality is the dramatic engine. Threatening
              harmonies are A#°7→Bm cycles, Neapolitan lurches (C major →
              F#7), and parallel chromatic dim7 motion; heroic harmonies are
              plagal E→B cadences and sun-break shifts to B major. Eight
              sections through-composed:{" "}
              <span className="font-mono text-foreground">
                Intro / Threat / Lull / Hero / Combat (×5 episodes) /
                Pre-climax / Climactic Cross-Fire / Coda
              </span>
              . Range B1–B6 for most of the piece, with sweeps reaching A0–E7
              at climaxes for "altitude". Drawn on the aerial-combat boss-music
              tradition — Liszt etudes, Chopin Op. 25 No. 11, Rachmaninoff
              prelude in B♭, and contemporary game-music aerial-boss themes.
            </p>
          </div>

          {/* Section list */}
          <div ref={sectionsRef} className="reveal mt-10 space-y-3">
            {sections.map((s) => (
              <div
                key={s.letter}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-card/40 px-5 py-4 sm:flex-nowrap"
              >
                <span className="w-12 shrink-0 font-mono text-sm text-muted-foreground">
                  {s.letter}.
                </span>
                <span className="font-serif-display text-lg tracking-tight text-foreground">
                  {s.name}
                </span>
                <span className="text-sm text-muted-foreground">
                  — {s.note}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase A blueprint — 3-stage reveal */}
      <section className="px-6 pb-20">
        <div ref={blueprintRef} className="reveal mx-auto max-w-4xl">
          <SkyCombatBlueprint />
        </div>
      </section>

      {/* CTA — how it was made */}
      <section className="px-6 pb-16 pt-4">
        <div ref={ctaRef} className="reveal mx-auto max-w-3xl">
          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 to-card/40 p-8 text-center md:p-12">
            <h3 className="font-serif-display text-3xl tracking-tight">
              Curious how this was made?
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Eight versions, six rounds of Gemini critique, and two pivotal
              human-driven passes that caught what score-level critique alone
              never surfaced — kinetic on the page, looped to the ear. See the
              full timeline.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-11 px-6">
                <Link to="/sky-combat/iterations">
                  See the iteration journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
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

export default SkyCombat;
