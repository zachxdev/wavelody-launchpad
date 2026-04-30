import { Pause, Play, Square } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

export type ScoreView = "piano-roll" | "mdsl-grid";

export type AudioStatus = "idle" | "loading" | "ready" | "error";

interface ScoreToolbarProps {
  view: ScoreView;
  onViewChange: (view: ScoreView) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  position: string;
  bar: number;
  totalBars: number;
  audioStatus?: AudioStatus;
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
  audioStatus = "idle",
}: ScoreToolbarProps) => {
  const audioBlocked = audioStatus === "loading" || audioStatus === "error";
  const statusLabel =
    audioStatus === "loading"
      ? "Loading audio…"
      : audioStatus === "error"
        ? "Audio unavailable"
        : null;
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
          disabled={audioBlocked}
          aria-label={isPlaying ? "Pause" : "Play"}
          aria-busy={audioStatus === "loading"}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-foreground transition-colors",
            "hover:bg-secondary",
            audioBlocked && "cursor-not-allowed opacity-40 hover:bg-transparent",
          )}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={audioBlocked}
          aria-label="Stop"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary",
            audioBlocked && "cursor-not-allowed opacity-40 hover:bg-transparent",
          )}
        >
          <Square className="h-3.5 w-3.5" />
        </button>
        <span className="ml-2 font-mono text-xs tabular-nums text-muted-foreground">
          {position}
        </span>
        {statusLabel && (
          <span
            className={cn(
              "ml-2 rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wide",
              audioStatus === "loading"
                ? "bg-secondary/60 text-muted-foreground"
                : "bg-destructive/20 text-destructive-foreground",
            )}
            role="status"
          >
            {statusLabel}
          </span>
        )}
      </div>

      <div className="text-xs text-muted-foreground/60">
        Bar {bar} of {totalBars}
      </div>
    </div>
  );
};

export default ScoreToolbar;
