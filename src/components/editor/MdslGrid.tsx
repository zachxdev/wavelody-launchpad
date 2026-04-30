import { useMemo, useRef, useState } from "react";
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
const DEFAULT_ROW_HEIGHT = 24;
const MIN_ROW_HEIGHT = 16;
const MAX_ROW_HEIGHT = 40;
const GUTTER_WIDTH = 56;
const META_COL_WIDTH = 96;
const VOICE_COL_WIDTH = 168; // sized to fit (Db4,F4,Ab4:mf:192) + a little.

const MdslGrid = ({ score, selection, onSelectionChange }: MdslGridProps) => {
  const voices = score.header.voices;
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ startBar: number; endBar: number } | null>(null);
  const [rowHeight, setRowHeight] = useState(DEFAULT_ROW_HEIGHT);

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return; // plain wheel → native vertical scroll
    e.preventDefault();
    const delta = -e.deltaY * 0.1;
    setRowHeight((prev) =>
      Math.max(MIN_ROW_HEIGHT, Math.min(MAX_ROW_HEIGHT, Math.round(prev + delta))),
    );
  };

  const selectedVoice =
    selection.kind === "voice" || selection.kind === "range"
      ? selection.voice
      : undefined;

  const range =
    drag !== null
      ? {
          startBar: Math.min(drag.startBar, drag.endBar),
          endBar: Math.max(drag.startBar, drag.endBar),
        }
      : selection.kind === "range"
        ? { startBar: selection.startBar, endBar: selection.endBar }
        : null;

  const isBarInRange = (bar: number) =>
    range !== null && bar >= range.startBar && bar <= range.endBar;

  const toggleVoice = (voice: string) => {
    if (selectedVoice === voice && selection.kind === "voice") {
      onSelectionChange({ kind: "none" });
    } else {
      onSelectionChange({ kind: "voice", voice });
    }
  };

  const clearSelection = () => {
    if (selection.kind !== "none") onSelectionChange({ kind: "none" });
  };

  const onGutterMouseDown = (e: React.MouseEvent<HTMLDivElement>, bar: number) => {
    e.preventDefault();
    e.stopPropagation();
    let liveDrag = { startBar: bar, endBar: bar };
    setDrag(liveDrag);

    const onMove = (ev: MouseEvent) => {
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      if (!el) return;
      const target = el.closest<HTMLElement>("[data-bar]");
      if (!target) return;
      const b = parseInt(target.dataset.bar ?? "", 10);
      if (!Number.isFinite(b)) return;
      liveDrag = { ...liveDrag, endBar: b };
      setDrag(liveDrag);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      const lo = Math.min(liveDrag.startBar, liveDrag.endBar);
      const hi = Math.max(liveDrag.startBar, liveDrag.endBar);
      const next: Selection = selectedVoice
        ? { kind: "range", voice: selectedVoice, startBar: lo, endBar: hi }
        : { kind: "range", startBar: lo, endBar: hi };
      setDrag(null);
      onSelectionChange(next);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

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
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-auto bg-background font-mono text-xs text-foreground"
      onWheel={onWheel}
      onClick={(e) => {
        if (e.target === e.currentTarget) clearSelection();
      }}
    >
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
            <button
              key={`voice-h-${v}`}
              type="button"
              onClick={() => toggleVoice(v)}
              className={`px-2 py-1 text-left text-[11px] font-medium transition-colors ${
                selectedVoice === v ? "bg-secondary/40" : "hover:bg-secondary/20"
              }`}
              style={{ color: voiceColor(v) }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Body rows */}
        {displayRows.map((d, idx) => {
          if (d.kind === "collapsed") {
            const key = collapseKey(d.bar, d.startIdx);
            const inRange = isBarInRange(d.bar);
            return (
              <div key={`collapsed-${key}`} className="contents">
                <div
                  data-bar={d.bar}
                  onMouseDown={(e) => onGutterMouseDown(e, d.bar)}
                  className="flex items-center"
                  style={{ height: rowHeight, backgroundColor: inRange ? "hsl(173 80% 40% / 0.08)" : undefined }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRun(key);
                    }}
                    title={`Expand ${d.count} dot rows`}
                    className="h-full w-full px-2 text-left text-muted-foreground/60 transition-colors hover:bg-secondary/40 hover:text-foreground"
                  >
                    {d.count}R{d.endsBar ? " |" : ""}
                  </button>
                </div>
                <div
                  className="flex items-center px-2 text-muted-foreground/40"
                  style={{
                    gridColumn: `2 / span ${META_COLUMNS.length + voices.length}`,
                    height: rowHeight,
                    backgroundColor: inRange ? "hsl(173 80% 40% / 0.08)" : undefined,
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
          const inRange = isBarInRange(row.bar);
          const rangeBg = inRange ? "hsl(173 80% 40% / 0.08)" : undefined;
          return (
            <div key={`row-${row.bar}-${row.beat}`} className="contents">
              <div
                data-bar={row.bar}
                onMouseDown={(e) => onGutterMouseDown(e, row.bar)}
                onClick={(e) => {
                  if (collapseKeyForRow) {
                    e.stopPropagation();
                    toggleRun(collapseKeyForRow);
                  }
                }}
                title={collapseKeyForRow ? "Click to re-collapse this run" : undefined}
                className={`flex items-center px-2 text-muted-foreground/70 ${borderClass} ${
                  collapseKeyForRow ? "cursor-pointer hover:bg-secondary/40 hover:text-foreground" : "cursor-row-resize"
                }`}
                style={{ height: rowHeight, backgroundColor: rangeBg }}
              >
                {formatRowLabel(row.bar, row.beat)}
              </div>
              {dot ? (
                <div
                  className={`flex items-center justify-center text-muted-foreground/40 ${borderClass}`}
                  style={{
                    gridColumn: `2 / span ${META_COLUMNS.length + voices.length}`,
                    height: rowHeight,
                    backgroundColor: rangeBg,
                  }}
                  onClick={clearSelection}
                >
                  ·
                </div>
              ) : (
                <>
                  <div
                    className={`flex items-center px-2 text-muted-foreground/80 ${borderClass}`}
                    style={{ height: rowHeight, backgroundColor: rangeBg }}
                    onClick={clearSelection}
                  >
                    {formatStrCell(row)}
                  </div>
                  <div
                    className={`flex items-center px-2 text-muted-foreground/80 ${borderClass}`}
                    style={{ height: rowHeight, backgroundColor: rangeBg }}
                    onClick={clearSelection}
                  >
                    {formatHarCell(row)}
                  </div>
                  <div
                    className={`flex items-center px-2 text-muted-foreground/80 ${borderClass}`}
                    style={{ height: rowHeight, backgroundColor: rangeBg }}
                    onClick={clearSelection}
                  >
                    {formatSusCell(row)}
                  </div>
                  {voices.map((v) => {
                    const text = formatVoiceCell(row, v);
                    const isActive = text !== "-";
                    const colSelected = selectedVoice === v;
                    // Layer voice-column tint over bar-range tint when both apply.
                    const bg =
                      colSelected && inRange
                        ? `linear-gradient(${voiceColor(v).replace("hsl(", "hsla(").replace(")", " / 0.10)")}, ${voiceColor(v).replace("hsl(", "hsla(").replace(")", " / 0.10)")}), hsl(173 80% 40% / 0.08)`
                        : colSelected
                          ? voiceColor(v).replace("hsl(", "hsla(").replace(")", " / 0.10)")
                          : rangeBg;
                    return (
                      <div
                        key={`cell-${row.bar}-${row.beat}-${v}`}
                        className={`flex items-center px-2 ${borderClass}`}
                        style={{
                          height: rowHeight,
                          color: isActive ? voiceColor(v) : "hsl(240 5% 35%)",
                          background: bg,
                        }}
                        onClick={clearSelection}
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
