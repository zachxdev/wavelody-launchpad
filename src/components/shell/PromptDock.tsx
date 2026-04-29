import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface PromptDockProps {
  open: boolean;
  onToggle: () => void;
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
}

const PromptDock = ({ open, onToggle, value, onChange, onGenerate }: PromptDockProps) => {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-t border-border/60 bg-card/40 transition-[height] duration-200",
        open ? "h-[140px]" : "h-8",
      )}
    >
      <div className="flex h-7 shrink-0 items-center justify-between px-4">
        <span className="font-serif-display text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Compose
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Collapse compose dock" : "Expand compose dock"}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </button>
      </div>

      {open && (
        <div className="flex flex-1 items-stretch gap-3 px-4 pb-3">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe the section you want to compose, or select bars to scope-edit…"
            className="flex-1 resize-none bg-background/40 text-sm"
          />
          <div className="flex flex-col justify-end">
            <Button size="sm" onClick={onGenerate} className="h-8 px-4">
              Generate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptDock;
