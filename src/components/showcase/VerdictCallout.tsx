import { Quote } from "lucide-react";

export type Verdict = {
  /** Short headline above the quote, e.g. "Verdict from Gemini" */
  source: string;
  /** Body of the verdict — paragraph or two. */
  body: string;
  /** Optional one-line summary, e.g. "Compared favourably to Suno + Udio renders." */
  summary?: string;
};

/**
 * Reserved layout slot for the Gemini comparison-vs-Suno/Udio callout. While
 * `verdict` is null the component renders nothing — but keeping the slot in
 * the page tree means the layout already accommodates it once the assessment
 * arrives. Drop the populated object into ShowcasePage and it appears.
 */
const VerdictCallout = ({ verdict }: { verdict: Verdict | null }) => {
  if (!verdict) return null;
  return (
    <aside
      data-verdict
      className="mx-auto mt-12 max-w-3xl rounded-xl border border-primary/30 bg-primary/[0.04] p-6"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Quote className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary/90">
            {verdict.source}
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{verdict.body}</p>
          {verdict.summary && (
            <p className="text-sm font-medium text-foreground">{verdict.summary}</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default VerdictCallout;
