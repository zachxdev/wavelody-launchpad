import { Button } from "@/components/ui/button";

interface TopBarProps {
  projectName?: string;
  tempo?: number;
  keyName?: string;
  timeSignature?: string;
}

const TopBar = ({
  projectName = "Untitled",
  tempo = 120,
  keyName = "C major",
  timeSignature = "4/4",
}: TopBarProps) => {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border/60 bg-card/40 px-4">
      <div className="flex items-center gap-3">
        <span className="font-serif-display text-base tracking-tight">Wavelody</span>
        <span aria-hidden="true" className="h-4 w-px bg-border/80" />
        <span className="text-sm text-muted-foreground">{projectName}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-serif-display tracking-wide">{tempo} BPM</span>
        <span aria-hidden="true" className="h-3 w-px bg-border/60" />
        <span className="font-serif-display tracking-wide">{keyName}</span>
        <span aria-hidden="true" className="h-3 w-px bg-border/60" />
        <span className="font-serif-display tracking-wide">{timeSignature}</span>
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
