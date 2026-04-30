import { useMemo } from "react";
import type { Score } from "@/lib/musicdsl";
import { voiceColor } from "./colors";
import { collapseBar, type DisplayRow } from "./grid-collapse";
import {
  formatHarCell,
  formatRowLabel,
  formatStrCell,
  formatSusCell,
  formatVoiceCell,
  isDotRow,
} from "./grid-format";
import type { Selection } from "./selection";

interface MdslGridProps {
  score: Score;
  selection: Selection;
  onSelectionChange: (next: Selection) => void;
}

const META_COLUMNS = ["STR", "HAR", "SUS"] as const;
const ROW_HEIGHT = 24;
const GUTTER_WIDTH = 56;
const META_COL_WIDTH = 96;
const VOICE_COL_WIDTH = 168; // sized to fit (Db4,F4,Ab4:mf:192) + a little.

const MdslGrid = ({ score, selection, onSelectionChange }: MdslGridProps) => {
  void selection;
  void onSelectionChange;
  const voices = score.header.voices;

  const displayRows: DisplayRow[] = useMemo(() => {
    const out: DisplayRow[] = [];
    const expanded = new Set<string>(); // none expanded yet — Phase 5 step 5
    for (const bar of score.bars) {
      out.push(...collapseBar(bar, voices, expanded));
    }
    return out;
  }, [score, voices]);

  const totalColumns = 1 /* gutter */ + META_COLUMNS.length + voices.length;
  const gridTemplate =
    `${GUTTER_WIDTH}px ` +
    META_COLUMNS.map(() => `${META_COL_WIDTH}px`).join(" ") +
    " " +
    voices.map(() => `${VOICE_COL_WIDTH}px`).join(" ");

  return (
    <div className="relative h-full w-full overflow-auto bg-background font-mono text-xs text-foreground">
      <div
        className="grid"
        style={{ gridTemplateColumns: gridTemplate, minWidth: "max-content" }}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 grid border-b border-border/60 bg-card/80 backdrop-blur"
          style={{
            gridColumn: `1 / span ${totalColumns}`,
            gridTemplateColumns: gridTemplate,
          }}
        >
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            BAR.BEAT
          </div>
          {META_COLUMNS.map((c) => (
            <div
              key={`meta-h-${c}`}
              className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground"
            >
              {c}
            </div>
          ))}
          {voices.map((v) => (
            <div
              key={`voice-h-${v}`}
              className="px-2 py-1 text-[11px] font-medium"
              style={{ color: voiceColor(v) }}
            >
              {v}
            </div>
          ))}
        </div>

        {/* Body rows */}
        {displayRows.map((d, idx) => {
          if (d.kind === "collapsed") {
            return (
              <div
                key={`collapsed-${d.bar}-${d.startIdx}`}
                className="contents"
              >
                <div
                  className="flex items-center px-2 text-muted-foreground/60"
                  style={{ height: ROW_HEIGHT }}
                >
                  {d.count}R{d.endsBar ? " |" : ""}
                </div>
                <div
                  className="flex items-center px-2 text-center text-muted-foreground/40"
                  style={{
                    gridColumn: `2 / span ${META_COLUMNS.length + voices.length}`,
                    height: ROW_HEIGHT,
                  }}
                >
                  ·
                </div>
              </div>
            );
          }
          const row = d.row;
          const isFirstOfBar = (() => {
            if (idx === 0) return true;
            const prev = displayRows[idx - 1];
            if (prev.kind === "row") return prev.row.bar !== row.bar;
            return prev.bar !== row.bar;
          })();
          const borderClass = isFirstOfBar
            ? "border-t-2 border-border/80"
            : "border-t border-border/30";
          const dot = isDotRow(row, voices);
          return (
            <div key={`row-${row.bar}-${row.beat}`} className="contents">
              <div
                className={`flex items-center px-2 text-muted-foreground/70 ${borderClass}`}
                style={{ height: ROW_HEIGHT }}
              >
                {formatRowLabel(row.bar, row.beat)}
              </div>
              {dot ? (
                <div
                  className={`flex items-center justify-center text-muted-foreground/40 ${borderClass}`}
                  style={{
                    gridColumn: `2 / span ${META_COLUMNS.length + voices.length}`,
                    height: ROW_HEIGHT,
                  }}
                >
                  ·
                </div>
              ) : (
                <>
                  <div className={`flex items-center px-2 text-muted-foreground/80 ${borderClass}`} style={{ height: ROW_HEIGHT }}>
                    {formatStrCell(row)}
                  </div>
                  <div className={`flex items-center px-2 text-muted-foreground/80 ${borderClass}`} style={{ height: ROW_HEIGHT }}>
                    {formatHarCell(row)}
                  </div>
                  <div className={`flex items-center px-2 text-muted-foreground/80 ${borderClass}`} style={{ height: ROW_HEIGHT }}>
                    {formatSusCell(row)}
                  </div>
                  {voices.map((v) => {
                    const text = formatVoiceCell(row, v);
                    const isActive = text !== "-";
                    return (
                      <div
                        key={`cell-${row.bar}-${row.beat}-${v}`}
                        className={`flex items-center px-2 ${borderClass}`}
                        style={{
                          height: ROW_HEIGHT,
                          color: isActive ? voiceColor(v) : "hsl(240 5% 35%)",
                        }}
                      >
                        {text}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MdslGrid;
