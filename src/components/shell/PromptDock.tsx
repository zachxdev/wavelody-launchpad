// Prompt dock — the sole input surface for both compose and edit flows.
//
// Mode is implicit: when the workspace selection covers a (voice, bar
// range) the dock shows an Edit button + scope chip; otherwise it shows
// Generate. The actual API calls and state machine live in Workspace; the
// dock just renders props and reports clicks.

import { ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type PromptDockStatus =
  | { kind: "idle" }
  | { kind: "composing"; attempt: number; preview: string }
  | { kind: "editing" }
  | { kind: "rendering" }
  | { kind: "error"; message: string };

export interface EditScope {
  voice: string;
  startBar: number;
  endBar: number;
}

interface PromptDockProps {
  open: boolean;
  onToggle: () => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Active when a (voice, bar-range) selection is live. */
  editScope: EditScope | null;
  onClearScope: () => void;
  status: PromptDockStatus;
}

const PromptDock = ({
  open,
  onToggle,
  value,
  onChange,
  onSubmit,
  editScope,
  onClearScope,
  status,
}: PromptDockProps) => {
  const inEditMode = editScope !== null;
  const submitDisabled =
    status.kind === "composing" ||
    status.kind === "editing" ||
    status.kind === "rendering" ||
    value.trim().length === 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!submitDisabled) onSubmit();
    }
  };

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col border-t border-border/60 bg-card/40 transition-[height] duration-200",
        open ? "h-[180px]" : "h-8",
      )}
    >
      <div className="flex h-7 shrink-0 items-center justify-between px-4">
        <span className="flex items-center gap-2 font-serif-display text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {inEditMode ? "Edit" : "Compose"}
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Collapse compose dock" : "Expand compose dock"}
          className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {open ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {open && (
        <div className="flex flex-1 flex-col gap-2 px-4 pb-3">
          {inEditMode && (
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10.5px] text-foreground/80">
                voice {editScope.voice} · bars {editScope.startBar}
                {editScope.endBar !== editScope.startBar
                  ? `–${editScope.endBar}`
                  : ""}
              </span>
              <button
                type="button"
                aria-label="Clear edit scope"
                onClick={onClearScope}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <div className="flex flex-1 items-stretch gap-3">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                inEditMode
                  ? "Describe the edit (e.g. \"sustain longer\", \"step down to A4\")…"
                  : "Describe the section you want to compose, or select bars to scope-edit…"
              }
              className="flex-1 resize-none bg-background/40 text-sm"
            />
            <div className="flex flex-col justify-end">
              <Button
                size="sm"
                onClick={onSubmit}
                disabled={submitDisabled}
                className="h-8 px-4"
              >
                {inEditMode ? "Edit" : "Generate"}
              </Button>
            </div>
          </div>

          <PromptStatus status={status} />
        </div>
      )}
    </div>
  );
};

const PromptStatus = ({ status }: { status: PromptDockStatus }) => {
  if (status.kind === "idle") {
    return (
      <p className="text-[10.5px] text-muted-foreground/60">
        ⌘/Ctrl + Enter to submit.
      </p>
    );
  }
  if (status.kind === "composing") {
    return (
      <p className="truncate font-mono text-[10.5px] text-muted-foreground">
        Composing (attempt {status.attempt})…{" "}
        <span className="text-foreground/40">{status.preview}</span>
      </p>
    );
  }
  if (status.kind === "editing") {
    return (
      <p className="text-[10.5px] text-muted-foreground">Editing voice…</p>
    );
  }
  if (status.kind === "rendering") {
    return <p className="text-[10.5px] text-muted-foreground">Rendering…</p>;
  }
  return (
    <p className="text-[10.5px] text-destructive">
      {status.message}
    </p>
  );
};

export default PromptDock;
