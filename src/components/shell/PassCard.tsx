import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export type PassStatus = "ready" | "pending" | "running";

export interface Pass {
  id: string;
  title: string;
  voices: string[];
  status: PassStatus;
}

interface PassCardProps {
  pass: Pass;
  selected: boolean;
  onSelect: () => void;
  onRerun: () => void;
}

const statusDotClass = (status: PassStatus) => {
  switch (status) {
    case "ready":
      return "bg-primary";
    case "running":
      return "bg-primary animate-pulse";
    case "pending":
    default:
      return "bg-muted-foreground/40";
  }
};

const PassCard = ({ pass, selected, onSelect, onRerun }: PassCardProps) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group w-full rounded-md border bg-card/40 p-3 text-left transition-colors",
        selected
          ? "border-primary/60 bg-primary/5"
          : "border-border/60 hover:border-border hover:bg-card/60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn("h-2 w-2 shrink-0 rounded-full", statusDotClass(pass.status))}
          />
          <span className="font-serif-display text-sm tracking-tight">{pass.title}</span>
        </div>
        <span
          role="button"
          tabIndex={0}
          aria-label={`Re-run ${pass.title}`}
          onClick={(e) => {
            e.stopPropagation();
            onRerun();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onRerun();
            }
          }}
          className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100"
        >
          <RefreshCw className="h-3 w-3" />
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {pass.voices.map((voice) => (
          <span
            key={voice}
            className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {voice}
          </span>
        ))}
      </div>
    </button>
  );
};

export default PassCard;
