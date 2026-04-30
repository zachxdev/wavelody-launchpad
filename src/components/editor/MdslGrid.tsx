import { useMemo, useState } from "react";
import type { Score } from "@/lib/musicdsl";
import { voiceColor } from "./colors";
import { collapseBar, collapseKey, type DisplayRow } from "./grid-collapse";
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

  const [expandedRuns, setExpandedRuns] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const toggleRun = (key: string) => {
    setExpandedRuns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // For expanded runs, clicking the BAR.BEAT label of any of the run's dot rows
  // re-collapses. We pre-compute the set of (bar, rowIdxInBar) tuples that
  // belong to currently-expanded runs and the run-key they belong to so the
  // gutter knows what to toggle off.
  const expandedRowKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const bar of score.bars) {
      const dotIdxs: number[] = [];
      const flush = () => {
        if (dotIdxs.length >= 4) {
          const key = collapseKey(bar.index, dotIdxs[0]);
          if (expandedRuns.has(key)) {
            for (const idx of dotIdxs) {
              map.set(`${bar.index}:${idx}`, key);
            }
          }
        }
        dotIdxs.length = 0;
      };
      for (let i = 0; i < bar.rows.length; i += 1) {
        const row = bar.rows[i];
        const isDot =
          !row.structure &&
          !row.harmony &&
          row.sustain.length === 0 &&
          voices.every((v) => row.voices.get(v)?.silent);
        if (isDot) dotIdxs.push(i);
        else flush();
      }
      flush();
    }
    return map;
  }, [score, voices, expandedRuns]);

  const displayRows: DisplayRow[] = useMemo(() => {
    const out: DisplayRow[] = [];
    for (const bar of score.bars) {
      out.push(...collapseBar(bar, voices, expandedRuns));
    }
    return out;
  }, [score, voices, expandedRuns]);

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
            const key = collapseKey(d.bar, d.startIdx);
            return (
              <div key={`collapsed-${key}`} className="contents">
                <button
                  type="button"
                  onClick={() => toggleRun(key)}
                  title={`Expand ${d.count} dot rows`}
                  className="flex items-center px-2 text-left text-muted-foreground/60 transition-colors hover:bg-secondary/40 hover:text-foreground"
                  style={{ height: ROW_HEIGHT }}
                >
                  {d.count}R{d.endsBar ? " |" : ""}
                </button>
                <div
                  className="flex items-center px-2 text-muted-foreground/40"
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
          const collapseKeyForRow = expandedRowKey.get(
            `${row.bar}:${d.rowIndexInBar}`,
          );
          const labelClick = collapseKeyForRow
            ? () => toggleRun(collapseKeyForRow)
            : undefined;
          return (
            <div key={`row-${row.bar}-${row.beat}`} className="contents">
              <div
                onClick={labelClick}
                title={collapseKeyForRow ? "Click to re-collapse this run" : undefined}
                className={`flex items-center px-2 text-muted-foreground/70 ${borderClass} ${
                  collapseKeyForRow ? "cursor-pointer hover:bg-secondary/40 hover:text-foreground" : ""
                }`}
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
