import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import AudioPlayer from "@/components/showcase/AudioPlayer";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import { useReveal } from "@/hooks/useReveal";

const voices: Array<{ family: string; instruments: string }> = [
  {
    family: "Strings",
    instruments:
      "Violin I (×2, ±2¢ heterophonic detune), Violin II (×2), Viola, Cello, Double Bass",
  },
  {
    family: "Winds",
    instruments: "Piccolo, Flute, Oboe, Clarinet, Bassoon",
  },
  {
    family: "Brass",
    instruments: "French Horn (×2), Trumpet (×2), Trombone, Tuba",
  },
  {
    family: "Piano",
    instruments:
      "Pianoteq Hamburg Steinway D — doubles as percussive timpani-substitute in the lowest register",
  },
];

const features: Array<{ title: string; body: string }> = [
  {
    title: "Three sections deeply rearranged",
    body: "Not a transcription. The Threat section's piano figuration becomes a Stravinsky-style woodwind canon over col-legno tremolo strings; the Climax's broken arpeggios are split canonically across Vn1/Fl/Vn2/Picc with Wagner-style fff brass slabs; Combat D4 becomes a solo violin/viola lyric duet with sigimsae portamento and an offstage horn (distance automation).",
  },
  {
    title: "Two differentiated peaks",
    body: "Hero's Stand at bar 31 — ff brass fanfare in fourths over string tremolo. Climactic Cross-Fire at bars 97–114 — fff full ensemble with sustained dissonance. Bar 115 is a structural silence; the coda climbs from p back to fff for the final B Major tutti at bar 126.",
  },
  {
    title: "Tradition, not pastiche",
    body: "A battle tone-poem in the lineage of Holst's \"Mars\" (col-legno menace), Wagner's \"Ride of the Valkyries\" (brass fanfare in fourths over string tremolo for the Hero theme), Stravinsky's \"Rite of Spring\" (woodwind arabesques and antiphonal blocks), and Prokofiev's \"Battle on the Ice\" (heavy brass slabs + piano-as-percussion at the climax).",
  },
  {
    title: "Restraint, not abundance",
    body: "Ornaments stay coloristic — sigimsae appears only at the Hero bar 32 octave shift and the Combat D4 lyric duet, not sprinkled throughout. Brass is rationed: full force at Hero and Climax, absent or scarce between, so each entrance carries weight. 17 voices does not mean 17 voices always playing.",
  },
  {
    title: "Symphonic miniature",
    body: "126 bars at 160 BPM, ~3:17 — the same length as the solo piano version. A symphonic miniature, not an extended fantasy. Same form, same dramatic clock — different ensemble, different voice.",
  },
  {
    title: "Heterophonic violins",
    body: "Violin I is doubled with a ±2¢ detuned partner, the same heterophonic principle the Modern Asian Hidden Heart uses for its strings — unity-through-variation in the section, not lockstep unison.",
  },
];

const SkyCombatSymphonic = () => {
  const descRef = useReveal<HTMLDivElement>();
  const featuresRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav
        rightLink={{ to: "/sky-combat", label: "← Back to Sky Combat" }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[88vh] items-center justify-center px-6 pt-[52px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(173_80%_40%_/_0.10),_transparent_60%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <Link
            to="/sky-combat"
            className="mb-5 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Sky Combat
          </Link>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Orchestral showcase · symphonic
          </div>
          <h1 className="font-serif-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Sky Combat
            <span className="mt-2 block font-serif-display text-2xl text-muted-foreground sm:text-3xl md:text-4xl">
              Symphonic Arrangement
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] text-lg leading-relaxed text-muted-foreground">
            A 17-voice symphonic arrangement of the original solo piano
            boss-fight piece. Three sections deeply rearranged — not
            transcribed — to avoid mechanical orchestration.
          </p>
          <div className="mx-auto mt-10 max-w-xl">
            <AudioPlayer
              src="/showcase/sky-combat/symphonic.mp3"
              label="Symphonic Arrangement — Sky Combat"
              durationHint="3:17"
              variant="hero"
            />
            <p className="mt-3 text-xs italic text-muted-foreground/80">
              SWAM Solo Strings / Winds / Brass · Pianoteq 9 (Hamburg Steinway
              D Classical) · Concert Hall Ambiente reverb (Large 1, Low
              absorption, Medium-Far mic) · via Reaper headless pipeline. Four
              new SWAM templates added for this piece (Double Bass, Piccolo,
              Tenor Trombone, Tuba).
            </p>
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            17 voices · 126 bars at 160 BPM · ~3:17
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
              The same dramatic clock as the solo piano original — 126 bars at
              160 BPM, ~3:17, two peaks at the Hero's Stand and the Climactic
              Cross-Fire — redistributed across a 17-voice symphonic ensemble.
              Where the original is a single performer at one keyboard, this
              arrangement asks 17 musicians to inhabit the same form together.
              A symphonic miniature, not an extended fantasy.
            </p>
            <p>
              The aim was tradition, not pastiche. The vocabulary is
              borrowed honestly: Holst's col-legno menace, Wagner's brass
              fanfare in fourths over string tremolo, Stravinsky's woodwind
              arabesques and antiphonal blocks, Prokofiev's heavy brass slabs
              with piano-as-percussion at the climax. Three sections are
              deeply rearranged — Threat, Climax, Combat D4 — so the result
              reads as orchestration, not transcription. Restraint is the
              other half of the work: brass is rationed, ornaments stay
              coloristic, and the piano steps back into a percussive role in
              the lowest register.
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
            to="/sky-combat"
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

export default SkyCombatSymphonic;
