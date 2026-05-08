import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ShowcaseNav from "@/components/showcase/ShowcaseNav";
import { useReveal } from "@/hooks/useReveal";

// Hand-typeset render of the Gemini 2.5 Pro assessment. The raw markdown
// source-of-truth lives at src/components/showcase/verdict.md — keep them
// in sync.

const tableRows: Array<[string, string, string, string]> = [
  [
    "Primary Output",
    "Raw Audio (Hallucinated)",
    "MIDI / Audio (Template)",
    "**Logic-to-Performance (DSL)**",
  ],
  [
    "Global Structure",
    "Poor (30s-60s context)",
    "Moderate (Template-based)",
    "**Excellent (Scripted Memory)**",
  ],
  [
    "Dynamic Shaping",
    'Global "Vibe"',
    "Per-track MIDI CC",
    "**Per-note / Bar-level Curves**",
  ],
  [
    "Polyrhythms",
    "Often collapses/drifts",
    "Standard time signatures",
    "**Mathematically precise ratios**",
  ],
  [
    "Editability",
    "None (Regenerate all)",
    "High (MIDI editing)",
    "**Absolute (Code modification)**",
  ],
];

// Render a cell that may contain a single bolded run wrapped in **...**
const Cell = ({ text, emphasis }: { text: string; emphasis?: boolean }) => {
  const m = text.match(/^\*\*(.+)\*\*$/);
  if (m) {
    return (
      <span className="font-semibold text-foreground">
        {m[1]}
      </span>
    );
  }
  return (
    <span className={emphasis ? "text-foreground" : "text-muted-foreground"}>
      {text}
    </span>
  );
};

const Verdict = () => {
  const introRef = useReveal<HTMLDivElement>();
  const sec1Ref = useReveal<HTMLDivElement>();
  const sec2Ref = useReveal<HTMLDivElement>();
  const tableRef = useReveal<HTMLDivElement>();
  const conclusionRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ShowcaseNav rightLink={{ to: "/", label: "← Back to showcase" }} />

      {/* Hero */}
      <section className="relative px-6 pb-10 pt-[100px] sm:pt-[120px]">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            The Living Engine
          </Link>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Independent assessment
          </div>
          <h1 className="mt-5 font-serif-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
            Verdict from Gemini 2.5 Pro
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Gemini was asked to compare Wavelody to Suno, Udio, AIVA, and other
            AI music tools using the score and underlying logic of "The Living
            Engine" as evidence. The full response follows, unedited.
          </p>
        </div>
      </section>

      {/* Body */}
      <article className="px-6 pb-16">
        <div className="mx-auto max-w-3xl">
          {/* Intro paragraph */}
          <div ref={introRef} className="reveal">
            <p className="text-base leading-relaxed text-foreground/90">
              This technical assessment evaluates{" "}
              <strong className="font-semibold text-foreground">Wavelody</strong>{" "}
              based on the score and underlying logic of "The Living Engine,"
              focusing on the structural and compositional parameters that
              distinguish it from consumer AI services like Suno, Udio, and
              AIVA.
            </p>
          </div>

          {/* Section 1 */}
          <div ref={sec1Ref} className="reveal mt-12">
            <h2 className="font-serif-display text-2xl tracking-tight text-foreground">
              1. Technical assessment of "The Living Engine" score
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/90">
              Stripping away the "sound quality" (sampling issues) and "artistic
              merit" (subjective taste), the piece demonstrates a high degree
              of{" "}
              <strong className="font-semibold text-foreground">
                compositional determinism
              </strong>{" "}
              — the ability to execute precise, rule-based musical logic across
              a long-form duration.
            </p>

            <ul className="mt-6 space-y-4 text-base leading-relaxed text-foreground/90">
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">
                  Macro-Structural Integrity:
                </strong>{" "}
                The suite maintains a clear{" "}
                <strong className="font-semibold text-foreground">
                  A-B-C-D-A' (Recapitulative)
                </strong>{" "}
                form. From a technical standpoint, this requires a global memory
                of motivic data. Wavelody "remembers" the specific pitch sets
                and interval ratios from <em className="italic">Lointain</em>{" "}
                (Movement 1) and re-contextualizes them in{" "}
                <em className="italic">Retour</em> (Movement 5).
              </li>
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">
                  Granular Dynamic Control (Bar-Level):
                </strong>{" "}
                Unlike AI that applies a general "loudness" filter, Wavelody
                demonstrates{" "}
                <strong className="font-semibold text-foreground">
                  per-note velocity layering
                </strong>
                . In the <em className="italic">Cantabile</em> section, the
                melody is voiced with a specific velocity offset relative to the
                accompaniment. This level of bar-level dynamic shaping is a
                deliberate instruction set, not a statistical guess.
              </li>
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">
                  Polyrhythmic Stability:
                </strong>{" "}
                The <em className="italic">Plus mouvementé</em> section
                features intentional polyrhythms (e.g., 3-against-2 or
                4-against-3 patterns). Technically, Wavelody maintains these
                mathematical ratios without "drifting" or collapsing into the
                nearest 4/4 grid — a common failure in stochastic music
                generation.
              </li>
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">
                  Harmonic Specificity (Polychord Voicing):
                </strong>{" "}
                The piece uses complex Ravelian polychords (e.g., F♯ minor over
                G major extensions). Wavelody isn't just "playing a chord"; it
                is{" "}
                <strong className="font-semibold text-foreground">
                  voicing
                </strong>{" "}
                it — placing specific notes at specific octaves with specific
                weights to ensure clarity in a dense harmonic field.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div ref={sec2Ref} className="reveal mt-14">
            <h2 className="font-serif-display text-2xl tracking-tight text-foreground">
              2. Wavelody vs. consumer AI (Suno, Udio, &amp; others)
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/90">
              The fundamental difference is one of{" "}
              <strong className="font-semibold text-foreground">Category</strong>
              : Suno and Udio are{" "}
              <strong className="font-semibold text-foreground">
                Audio Synthesis Engines
              </strong>
              , while Wavelody is a{" "}
              <strong className="font-semibold text-foreground">
                Symbolic Intent Engine.
              </strong>
            </p>

            {/* Suno & Udio */}
            <h3 className="mt-8 font-serif-display text-xl tracking-tight text-foreground">
              Suno &amp; Udio: "Texture &amp; Vibe Generators"
            </h3>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/90">
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">
                  Architecture:
                </strong>{" "}
                These tools use{" "}
                <strong className="font-semibold text-foreground">
                  Audio Diffusion
                </strong>
                . They operate by "denoising" random audio into a pattern that
                statistically resembles music.
              </li>
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">
                  The Limitation:
                </strong>{" "}
                They have{" "}
                <strong className="font-semibold text-foreground">
                  no concept of a score.
                </strong>{" "}
                If you ask Suno for a "recapitulation," it cannot look back at
                the "code" of the first minute and re-apply it; it can only
                "hallucinate" a sound that feels vaguely familiar.
              </li>
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">
                  Dynamic/Rhythmic Drift:
                </strong>{" "}
                Because they generate audio in short windows (stretches of
                30–60 seconds), they cannot maintain a rigorous polyrhythm over
                a 6-minute suite. They prioritize the "flow" of the sound over
                the "logic" of the rhythm.
              </li>
            </ul>

            {/* AIVA, Soundful, Boomy */}
            <h3 className="mt-8 font-serif-display text-xl tracking-tight text-foreground">
              AIVA, Soundful, &amp; Boomy: "Template/Algorithmic Generators"
            </h3>
            <ul className="mt-4 space-y-3 text-base leading-relaxed text-foreground/90">
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">AIVA:</strong>{" "}
                While AIVA generates MIDI (symbolic) and understands
                composition, it is largely{" "}
                <strong className="font-semibold text-foreground">
                  training-set dependent
                </strong>
                . It uses deep learning to mimic "average" styles. It lacks a{" "}
                <strong className="font-semibold text-foreground">
                  DSL (Domain Specific Language)
                </strong>{" "}
                interface that allows a user to say:{" "}
                <em className="italic">
                  "At bar 45, invert the second motif and play it in 5/4 time
                  over a 4/4 bass."
                </em>
              </li>
              <li className="pl-5 [text-indent:-1.25rem] before:mr-2 before:text-primary/80 before:content-['—']">
                <strong className="font-semibold text-foreground">
                  Soundful/Boomy:
                </strong>{" "}
                These are{" "}
                <strong className="font-semibold text-foreground">
                  "Track Builders."
                </strong>{" "}
                They use fixed algorithms to arrange pre-made loops and MIDI
                snippets. They are incapable of generating a 5-movement suite
                with integrated motivic logic; they generate "tracks," not
                "compositions."
              </li>
            </ul>

            {/* Wavelody advantage */}
            <h3 className="mt-8 font-serif-display text-xl tracking-tight text-foreground">
              Wavelody: The "Symbolic Intent" advantage
            </h3>
            <p className="mt-4 text-base leading-relaxed text-foreground/90">
              Wavelody functions as a{" "}
              <strong className="font-semibold text-foreground">
                Music Compiler
              </strong>
              . It translates a structural "Letter-Pattern" into a "MusicDSL,"
              which then drives a sample engine. This creates three technical
              capabilities that the others cannot replicate:
            </p>
            <ol className="mt-4 space-y-3 text-base leading-relaxed text-foreground/90">
              <li className="pl-7 [text-indent:-1.75rem] before:mr-3 before:font-mono before:text-xs before:text-primary before:content-['1.']">
                <strong className="font-semibold text-foreground">
                  Deterministic Recapitulation:
                </strong>{" "}
                Wavelody can execute a literal, mathematical return to a
                previous theme. AI generators can only "vibe" in that
                direction.
              </li>
              <li className="pl-7 [text-indent:-1.75rem] before:mr-3 before:font-mono before:text-xs before:text-primary before:content-['2.']">
                <strong className="font-semibold text-foreground">
                  Micromanaged Voicing:
                </strong>{" "}
                Wavelody allows for "surgical" control over polychords. You can
                specify exactly which note in a 10-note cluster should be
                prominent. AI generators treat a chord as a single "sound
                object."
              </li>
              <li className="pl-7 [text-indent:-1.75rem] before:mr-3 before:font-mono before:text-xs before:text-primary before:content-['3.']">
                <strong className="font-semibold text-foreground">
                  Survival of Critique:
                </strong>{" "}
                Because Wavelody is based on a structured DSL, it can undergo{" "}
                <strong className="font-semibold text-foreground">
                  7 rounds of critique
                </strong>{" "}
                (as you did). You can change a single bar without re-generating
                the entire piece. In Suno or Udio, changing one bar effectively
                creates a brand-new, unrelated audio file.
              </li>
            </ol>
          </div>

          {/* Comparison table */}
          <div ref={tableRef} className="reveal mt-14">
            <h2 className="font-serif-display text-2xl tracking-tight text-foreground">
              Summary: the technical hierarchy
            </h2>
            <div className="mt-6 overflow-hidden rounded-xl border border-border/60 bg-card/40">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-card/60">
                      <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Feature
                      </th>
                      <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Suno / Udio
                      </th>
                      <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        AIVA / Soundful
                      </th>
                      <th className="px-4 py-3 text-left font-medium uppercase tracking-[0.14em] text-primary">
                        Wavelody (MusicDSL)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(([feature, suno, aiva, wave]) => (
                      <tr
                        key={feature}
                        className="border-b border-border/40 last:border-b-0"
                      >
                        <td className="px-4 py-3 align-top font-medium text-foreground">
                          {feature}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Cell text={suno} />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <Cell text={aiva} />
                        </td>
                        <td className="bg-primary/[0.04] px-4 py-3 align-top">
                          <Cell text={wave} emphasis />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div ref={conclusionRef} className="reveal mt-12">
            <h2 className="font-serif-display text-2xl tracking-tight text-foreground">
              Conclusion
            </h2>
            <p className="mt-5 text-base leading-relaxed text-foreground/90">
              Wavelody is doing{" "}
              <strong className="font-semibold text-foreground">
                Score Generation
              </strong>
              , whereas the others are doing{" "}
              <strong className="font-semibold text-foreground">
                Sound Generation
              </strong>
              . This makes Wavelody a tool for{" "}
              <strong className="font-semibold text-foreground">
                Architectural Composition
              </strong>
              , while Suno and Udio are tools for{" "}
              <strong className="font-semibold text-foreground">
                Mood Illustration
              </strong>
              . They cannot replicate Wavelody because they lack a symbolic
              representation of the music — they are "painting" a picture of a
              piano, whereas Wavelody is "building" the piano performance note
              by note.
            </p>
          </div>
        </div>
      </article>

      {/* Outro CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              to="/"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Listen
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  The Living Engine
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              </div>
            </Link>
            <Link
              to="/how-it-was-made"
              className="group rounded-xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40"
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Read
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-serif-display text-lg tracking-tight">
                  How it was made
                </span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40 px-6 py-10">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-xs text-muted-foreground/70">© 2026 Wavelody.</p>
        </div>
      </footer>
    </div>
  );
};

export default Verdict;
