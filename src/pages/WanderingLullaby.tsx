import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import LullabyBlueprint from "@/components/showcase/LullabyBlueprint";
import VerdictCallout from "@/components/showcase/VerdictCallout";
import { useReveal } from "@/hooks/useReveal";

const sections = [
  { letter: "A", name: "Lullaby", note: "Tonic-pedal, narrow stepwise RH, rocking LH" },
  { letter: "B", name: "Woodland Dance", note: "G Lydian-inflected, dotted rhythms, light \"oompah\" LH" },
  { letter: "C", name: "Celestial", note: "B minor, harp-style 16th-arpeggio LH, parallel-sixths floating melody" },
  { letter: "D", name: "Lyrical Ballad", note: "RH parallel sixths, LH 8ths with V2 counter-melody — recasts B's contour" },
  { letter: "A′", name: "Reprise", note: "Ornamented lullaby, parallel thirds + 16th passing tones, dim. al pp" },
];

const WanderingLullaby = () => {
  const descRef = useReveal<HTMLDivElement>();
  const sectionsRef = useReveal<HTMLDivElement>();
  const blueprintRef = useReveal<HTMLDivElement>();
  const ctaRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav
        rightLink={{ to: "/the-wandering-lullaby/iterations", label: "How it was made" }}
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
            Wavelody showcase · piece II
          </div>
          <h1 className="font-serif-display text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[5rem]">
            The Wandering Lullaby
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            An original lyrical-fantasy piano medley, composed by Wavelody.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <AudioPlayer
              src="/showcase/lullaby/v10-pianoteq.mp3"
              label="v10 (surgical) — The Wandering Lullaby"
              durationHint="3:26"
              variant="hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              Rendered with Pianoteq 9 physical-modeling engine (Hamburg Steinway D).
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Solo piano · D major · 60 bars at q=72 · 865 notes · 3:26
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
              An original solo piano medley in the lyrical-fantasy /
              adventure-soundtrack tradition — sweet, melodious,
              lullaby-rooted. All material is original; nothing is quoted from
              any source. Five sections in a single D-major orbit, with one
              modulation to vi (B minor) for the central Celestial section.
            </p>
            <p>
              The macro-structure is a five-letter pattern{" "}
              <span className="font-mono text-foreground">A — B — C — D — A′</span>{" "}
              with four pivot transitions. Section D was composed not as a
              fresh idea but as a thematic transformation of Section B's
              Woodland Dance, recast in the slow legato parallel-sixth ballad
              style — a structural commitment that turns the piece from a
              sequence of scenes into a single emotional arc.
            </p>
          </div>

          {/* Section list */}
          <div ref={sectionsRef} className="reveal mt-10 space-y-3">
            {sections.map((s) => (
              <div
                key={s.letter}
                className="flex items-baseline gap-4 rounded-lg border border-border/60 bg-card/40 px-5 py-4"
              >
                <span className="w-8 shrink-0 font-mono text-sm text-muted-foreground">
                  {s.letter}.
                </span>
                <span className="font-serif-display text-lg tracking-tight text-foreground">
                  {s.name}
                </span>
                <span className="text-sm text-muted-foreground">— {s.note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase A blueprint callout — the differentiator */}
      <section className="px-6 pb-20">
        <div ref={blueprintRef} className="reveal mx-auto max-w-4xl">
          <LullabyBlueprint />
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
              Ten versions, nine rounds of Gemini critique, one curated final
              cut. The framework: apply every prescription each round until the
              critique stops finding structural issues — then notice when it
              starts reversing itself.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="h-11 px-6">
                <Link to="/the-wandering-lullaby/iterations">
                  See the iteration journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Reserved verdict slot — renders nothing while no verdict is set,
          but the page tree already accommodates one. */}
      <section className="px-6 pb-16">
        <VerdictCallout verdict={null} />
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

export default WanderingLullaby;
