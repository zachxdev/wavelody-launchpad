import { FileText, Layers, Award, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccessCodeForm from "@/components/landing/AccessCodeForm";
import { useReveal } from "@/hooks/useReveal";

const features = [
  {
    icon: FileText,
    title: "Inspectable score",
    body: "See the symbolic notation the model produces. Edit it. Re-render only what changed.",
  },
  {
    icon: Layers,
    title: "Voice-level control",
    body: "Regenerate the bass without touching the melody. Surgical edits, not re-rolls.",
  },
  {
    icon: Award,
    title: "Patent-pending notation",
    body: "MusicDSL: a symbolic format purpose-built for AI music. Norwegian patent filed April 2026.",
  },
];

const scrollToAccess = () => {
  document.getElementById("access")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Index = () => {
  const featuresRef = useReveal<HTMLDivElement>();
  const videoRef = useReveal<HTMLDivElement>();
  const accessRef = useReveal<HTMLDivElement>();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top nav */}
      <header className="absolute inset-x-0 top-0 z-30">
        <nav className="mx-auto flex h-[52px] max-w-6xl items-center justify-between px-6">
          <a href="/" className="font-serif-display text-xl tracking-tight">
            Wavelody
          </a>
          <a
            href="mailto:access@wavelody.com"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Request access
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center justify-center px-6 pt-[52px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_hsl(173_80%_40%_/_0.08),_transparent_60%)]"
        />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif-display text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            AI music composition with an editable score.
          </h1>
          <p className="mx-auto mt-6 max-w-[600px] text-base leading-relaxed text-muted-foreground">
            Wavelody generates music as a symbolic score the AI can read, you can edit, and
            the render engine plays back. Every note addressable. Every voice swappable.
            The structural layer end-to-end audio generators don't have.
          </p>
          <div className="mt-10">
            <Button size="lg" onClick={scrollToAccess} className="h-11 px-6">
              Enter access code
            </Button>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="px-6 py-20">
        <div
          ref={featuresRef}
          className="reveal mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-3"
        >
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-serif-display text-lg tracking-tight">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo video */}
      <section className="px-6 py-20">
        <div ref={videoRef} className="reveal mx-auto max-w-4xl">
          <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-card">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(173_80%_40%_/_0.18),_transparent_70%),linear-gradient(135deg,_hsl(240_20%_8%),_hsl(240_18%_4%))]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-serif-display text-3xl tracking-tight opacity-90 sm:text-4xl">
                Wavelody
              </span>
            </div>
            <button
              type="button"
              aria-label="Play demo video"
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-background/70 backdrop-blur transition-transform group-hover:scale-105">
                <Play className="h-6 w-6 translate-x-[1px] fill-foreground text-foreground" />
              </span>
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            60-second demo of the inspectable score and scoped editing.
          </p>
        </div>
      </section>

      {/* Access code */}
      <section id="access" className="px-6 py-20">
        <div ref={accessRef} className="reveal">
          <AccessCodeForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 px-6 py-10">
        <div className="mx-auto max-w-6xl space-y-2 text-center">
          <a
            href="mailto:zach@wavelody.com"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Email
          </a>
          <p className="text-xs text-muted-foreground/70">© 2026 Wavelody.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
