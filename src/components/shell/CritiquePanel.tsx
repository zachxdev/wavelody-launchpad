// Critique panel — collapsible row of Gemini suggestions on the most
// recent rendered piece. Shown beside the prompt dock so the user can
// glance at suggested fixes while the audio plays back.
//
// Each suggestion displays the location, the issue, and the suggested
// fix. The fix string may contain inline `code` spans (the Gemini schema
// nudges the model to express MusicDSL diffs in backticks). The panel
// renders those as styled spans but does not auto-apply them — applying
// a suggestion means the user has to (a) select the suggested location,
// (b) type a follow-up edit prompt, and (c) hit Generate. Auto-apply is
// out of scope for Phase 8b.

import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useState } from "react";
import type { CritiqueSuggestion } from "../../../api/types";
import { cn } from "@/lib/utils";

interface CritiquePanelProps {
  status: "idle" | "loading" | "ready" | "error";
  suggestions: CritiqueSuggestion[];
  errorMessage?: string;
}

const CritiquePanel = ({
  status,
  suggestions,
  errorMessage,
}: CritiquePanelProps) => {
  const [open, setOpen] = useState(true);

  if (status === "idle") return null;

  return (
    <div className="flex shrink-0 flex-col border-t border-border/60 bg-card/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 items-center justify-between px-4 text-left"
      >
        <span className="flex items-center gap-2 font-serif-display text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Critique
          {status === "loading" && (
            <span className="ml-2 text-[10px] tracking-normal text-muted-foreground/70">
              listening…
            </span>
          )}
          {status === "ready" && suggestions.length > 0 && (
            <span className="ml-2 rounded bg-secondary px-1.5 py-0.5 text-[10px] tracking-normal text-foreground/70">
              {suggestions.length}
            </span>
          )}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="max-h-[160px] overflow-y-auto px-4 pb-3">
          {status === "loading" && (
            <p className="text-xs text-muted-foreground">
              Asking Gemini to review the rendered audio…
            </p>
          )}
          {status === "error" && (
            <p className="text-xs text-destructive">
              {errorMessage ?? "Critique failed."}
            </p>
          )}
          {status === "ready" && suggestions.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No issues found. Nice take.
            </p>
          )}
          {status === "ready" && suggestions.length > 0 && (
            <ul className="flex flex-col gap-2">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className={cn(
                    "rounded-md border border-border/40 bg-background/40 p-2",
                    "text-xs",
                  )}
                >
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {s.location}
                  </div>
                  <div className="mt-1 text-foreground/90">{s.issue}</div>
                  <div className="mt-1 text-foreground/70">
                    Fix: <RenderInline text={s.suggested_fix} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// Render `code` spans inline. Splits on backtick pairs. Doesn't try to
// be a full markdown parser — Gemini's responseSchema keeps the field
// tight enough that a bare backtick split is sufficient.
function RenderInline({ text }: { text: string }) {
  const parts = text.split(/(`[^`]*`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
          return (
            <code
              key={i}
              className="rounded bg-secondary px-1 py-px font-mono text-[10.5px]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export default CritiquePanel;
