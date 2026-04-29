import { Pause, Play, Square } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type ScoreView = "piano-roll" | "mdsl-grid";

interface ScoreToolbarProps {
  view: ScoreView;
  onViewChange: (view: ScoreView) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  position: string;
  bar: number;
  totalBars: number;
}

const ScoreToolbar = ({
  view,
  onViewChange,
  isPlaying,
  onTogglePlay,
  onStop,
  position,
  bar,
  totalBars,
}: ScoreToolbarProps) => {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/60 bg-background px-3">
      <div>
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => {
            if (v === "piano-roll" || v === "mdsl-grid") onViewChange(v);
          }}
          className="gap-0 rounded-md border border-border/60 bg-card/40 p-0.5"
        >
          <ToggleGroupItem
            value="piano-roll"
            size="sm"
            className="h-7 rounded-sm px-3 text-xs data-[state=on]:bg-secondary data-[state=on]:text-foreground"
          >
            Piano Roll
          </ToggleGroupItem>
          <ToggleGroupItem
            value="mdsl-grid"
            size="sm"
            className="h-7 rounded-sm px-3 text-xs data-[state=on]:bg-secondary data-[state=on]:text-foreground"
          >
            MDSL Grid
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-foreground transition-colors",
            "hover:bg-secondary",
          )}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={onStop}
          aria-label="Stop"
          className="flex h-7 w-7 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
        <span className="ml-2 font-mono text-xs tabular-nums text-muted-foreground">
          {position}
        </span>
      </div>

      <div className="text-xs text-muted-foreground/60">
        Bar {bar} of {totalBars}
      </div>
    </div>
  );
};

export default ScoreToolbar;
