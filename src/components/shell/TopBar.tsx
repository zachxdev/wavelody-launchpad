import { Button } from "@/components/ui/button";

const TopBar = () => {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/60 bg-card/40 px-4">
      <div className="flex items-center gap-3">
        <span className="font-serif-display text-base tracking-tight">Wavelody</span>
        <span aria-hidden="true" className="h-4 w-px bg-border/80" />
        <span className="text-sm text-muted-foreground">Untitled Jazz Trio</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-serif-display tracking-wide">120 BPM</span>
        <span aria-hidden="true" className="h-3 w-px bg-border/60" />
        <span className="font-serif-display tracking-wide">C major</span>
        <span aria-hidden="true" className="h-3 w-px bg-border/60" />
        <span className="font-serif-display tracking-wide">4/4</span>
      </div>

      <div className="flex items-center">
        <Button size="sm" className="h-8 px-4">
          Render
        </Button>
      </div>
    </header>
  );
};

export default TopBar;
