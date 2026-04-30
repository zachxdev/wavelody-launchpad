import { useMemo, useRef, useState } from "react";
import type { NoteEvent, Score } from "@/lib/musicdsl";
import { extractVoices } from "@/lib/musicdsl";
import { voiceColor } from "./colors";
import {
  DEFAULT_PX_PER_BEAT,
  LANE_GAP,
  LANE_PITCH_RULER_WIDTH,
  MAX_PX_PER_BEAT,
  MIN_PX_PER_BEAT,
  PX_PER_SEMITONE,
  RULER_HEIGHT,
  dynamicToOpacity,
  laneHeight,
  voiceLaneRange,
} from "./piano-roll-layout";
import type { Selection } from "./selection";

interface PianoRollProps {
  score: Score;
  playhead: number;
  selection: Selection;
  onSelectionChange: (next: Selection) => void;
}

// Sub-row onset offsets shift the start within a row's time. Convert to beats.
// Phase 4: render at the offset onset for accuracy; no visual indicator that
// the note is offset.
function computeOffsetBeats(event: NoteEvent, rowsPerBeat: number): number {
  const off = event.note.offset;
  if (!off) return 0;
  const rowFraction = off.fraction.num / off.fraction.den;
  const sign = off.mode === "backward" ? -1 : 1;
  return (sign * rowFraction) / rowsPerBeat;
}

interface VoiceLane {
  voice: string;
  range: { minMidi: number; maxMidi: number };
  height: number;
  yTop: number;
  events: NoteEvent[];
}

const PianoRoll = ({ score, playhead, selection, onSelectionChange }: PianoRollProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<{ startBar: number; endBar: number } | null>(null);
  const [pxPerBeat, setPxPerBeat] = useState(DEFAULT_PX_PER_BEAT);
  const [panX, setPanX] = useState(0);

  const selectedVoice =
    selection.kind === "voice" || selection.kind === "range" ? selection.voice : undefined;

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

  // Total bar count and rows-per-beat from the first bar drive x scaling.
  const firstBar = score.bars[0];
  const rowsPerBeat = firstBar
    ? firstBar.resolution / firstBar.timeSignature.numerator
    : 24;

  const totalRows = score.bars.reduce((acc, b) => acc + b.rows.length, 0);
  const totalBeats = totalRows / rowsPerBeat;
  const contentWidth = totalBeats * pxPerBeat;

  const lanes: VoiceLane[] = useMemo(() => {
    const streams = extractVoices(score);
    let yCursor = RULER_HEIGHT + LANE_GAP;
    const out: VoiceLane[] = [];
    for (const stream of streams) {
      const range = voiceLaneRange(stream.events.map((e) => e.note));
      const h = laneHeight(range);
      out.push({
        voice: stream.voice,
        range,
        height: h,
        yTop: yCursor,
        events: stream.events,
      });
      yCursor += h + LANE_GAP;
    }
    return out;
  }, [score]);

  const totalHeight =
    lanes.length === 0
      ? RULER_HEIGHT + 200
      : lanes[lanes.length - 1].yTop + lanes[lanes.length - 1].height + LANE_GAP;

  // Bar boundaries in beats from start, for ruler tick layout.
  const barStartsBeats: number[] = [];
  let acc = 0;
  for (const bar of score.bars) {
    barStartsBeats.push(acc);
    acc += bar.rows.length / rowsPerBeat;
  }
  const beatToBarIndex = (beat: number): number => {
    if (beat < 0) return score.bars[0]?.index ?? 1;
    for (let i = barStartsBeats.length - 1; i >= 0; i -= 1) {
      if (beat >= barStartsBeats[i]) return score.bars[i].index;
    }
    return score.bars[0]?.index ?? 1;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // Smaller multiplier so zoom feels controlled (deltaY is typically 100 per notch).
      const zoomDelta = -e.deltaY * 0.1;
      setPxPerBeat((prev) =>
        Math.max(MIN_PX_PER_BEAT, Math.min(MAX_PX_PER_BEAT, prev + zoomDelta)),
      );
      return;
    }
    const horizontal = e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (horizontal) {
      e.preventDefault();
      const dx = e.shiftKey ? e.deltaY : e.deltaX;
      const viewport = wrapperRef.current?.clientWidth ?? 0;
      const minPan = Math.min(0, viewport - LANE_PITCH_RULER_WIDTH - contentWidth);
      setPanX((prev) => Math.max(minPan, Math.min(0, prev - dx)));
    }
    // Otherwise: native vertical scroll on the wrapper.
  };

  const onRulerMouseDown = (e: React.MouseEvent<SVGRectElement>) => {
    e.stopPropagation();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xToBar = (clientX: number): number => {
      // Subtract pan so the bar is computed against the AST x, not the rendered x.
      const x = clientX - rect.left - LANE_PITCH_RULER_WIDTH - panX;
      return beatToBarIndex(x / pxPerBeat);
    };
    const startBar = xToBar(e.clientX);
    setDrag({ startBar, endBar: startBar });

    const onMove = (ev: MouseEvent) => {
      const bar = xToBar(ev.clientX);
      setDrag((prev) => (prev ? { ...prev, endBar: bar } : prev));
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      setDrag((d) => {
        if (d) {
          const lo = Math.min(d.startBar, d.endBar);
          const hi = Math.max(d.startBar, d.endBar);
          const next: Selection = selectedVoice
            ? { kind: "range", voice: selectedVoice, startBar: lo, endBar: hi }
            : { kind: "range", startBar: lo, endBar: hi };
          onSelectionChange(next);
        }
        return null;
      });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative h-full w-full overflow-y-auto overflow-x-hidden bg-background"
      onWheel={onWheel}
    >
      <svg
        ref={svgRef}
        width="100%"
        height={totalHeight}
        className="block select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) clearSelection();
        }}
      >
        {/* Moving content: time ruler + lane bgs/notes/range/playhead, translated by panX */}
        <g transform={`translate(${panX}, 0)`}>
          {/* Time ruler bg + drag target */}
          <rect
            x={LANE_PITCH_RULER_WIDTH}
            y={0}
            width={contentWidth}
            height={RULER_HEIGHT}
            fill="hsl(240 14% 9%)"
            style={{ cursor: "col-resize" }}
            onMouseDown={onRulerMouseDown}
          />
          <line
            x1={LANE_PITCH_RULER_WIDTH}
            y1={RULER_HEIGHT}
            x2={LANE_PITCH_RULER_WIDTH + contentWidth}
            y2={RULER_HEIGHT}
            stroke="hsl(240 10% 16%)"
            strokeWidth={1}
          />
          {barStartsBeats.map((b, i) => {
            const x = LANE_PITCH_RULER_WIDTH + b * pxPerBeat;
            return (
              <g key={`bar-label-${i}`}>
                <line
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={RULER_HEIGHT}
                  stroke="hsl(240 5% 60%)"
                  strokeWidth={1}
                />
                <text
                  x={x + 4}
                  y={RULER_HEIGHT - 8}
                  fill="hsl(240 5% 60%)"
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                >
                  {i + 1}
                </text>
              </g>
            );
          })}

          {/* Per-lane content (excludes the fixed pitch-ruler header strip) */}
          {lanes.map((lane) => (
            <g key={`lane-content-${lane.voice}`}>
              <rect
                x={LANE_PITCH_RULER_WIDTH}
                y={lane.yTop}
                width={contentWidth}
                height={lane.height}
                fill="hsl(240 18% 7%)"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
              />
              <line
                x1={LANE_PITCH_RULER_WIDTH}
                y1={lane.yTop + lane.height}
                x2={LANE_PITCH_RULER_WIDTH + contentWidth}
                y2={lane.yTop + lane.height}
                stroke="hsl(240 10% 16%)"
                strokeWidth={1}
              />
              {/* Octave gridlines (line only — labels are in the fixed overlay) */}
              {(() => {
                const ticks: number[] = [];
                for (let m = lane.range.maxMidi; m >= lane.range.minMidi; m -= 1) {
                  if (m % 12 === 0) ticks.push(m);
                }
                return ticks.map((m) => {
                  const y = lane.yTop + (lane.range.maxMidi - m) * PX_PER_SEMITONE;
                  return (
                    <line
                      key={`octline-${lane.voice}-${m}`}
                      x1={LANE_PITCH_RULER_WIDTH}
                      y1={y}
                      x2={LANE_PITCH_RULER_WIDTH + contentWidth}
                      y2={y}
                      stroke="hsl(240 10% 14%)"
                      strokeWidth={1}
                    />
                  );
                });
              })()}
              {/* Bar lines crossing the lane */}
              {barStartsBeats.map((b, i) => {
                const x = LANE_PITCH_RULER_WIDTH + b * pxPerBeat;
                return (
                  <line
                    key={`barline-${lane.voice}-${i}`}
                    x1={x}
                    y1={lane.yTop}
                    x2={x}
                    y2={lane.yTop + lane.height}
                    stroke="hsl(240 10% 18%)"
                    strokeWidth={1}
                  />
                );
              })}
              {/* Notes (and sustain trails for notes with `s` suffix) */}
              {lane.events.flatMap((event, eventIdx) => {
                const onsetBeat =
                  event.absolutePosition / rowsPerBeat +
                  computeOffsetBeats(event, rowsPerBeat);
                const widthBeats = event.note.durationUnits / rowsPerBeat;
                const x = LANE_PITCH_RULER_WIDTH + onsetBeat * pxPerBeat;
                const w = widthBeats * pxPerBeat;
                const fill = voiceColor(lane.voice);
                const opacity = dynamicToOpacity(event.note.dynamic);

                // Sustain trail: extends past the played duration to either the
                // next event in this voice or the end of the bar, whichever
                // arrives first. Per Phase-4 v1 approximation; full SUS-column
                // tracking is post-Phase-4.
                let trailWidth = 0;
                if (event.note.sustain) {
                  const noteEndBeat = onsetBeat + widthBeats;
                  const nextEvent = lane.events[eventIdx + 1];
                  const nextEventBeat = nextEvent
                    ? nextEvent.absolutePosition / rowsPerBeat +
                      computeOffsetBeats(nextEvent, rowsPerBeat)
                    : Number.POSITIVE_INFINITY;
                  const barIdx = score.bars.findIndex((b) => b.index === event.bar);
                  const barEndBeat =
                    barIdx + 1 < barStartsBeats.length
                      ? barStartsBeats[barIdx + 1]
                      : totalBeats;
                  const trailEndBeat = Math.min(nextEventBeat, barEndBeat);
                  if (trailEndBeat > noteEndBeat) {
                    trailWidth = (trailEndBeat - noteEndBeat) * pxPerBeat;
                  }
                }

                return event.note.pitches.flatMap((pitch, pi) => {
                  const y =
                    lane.yTop + (lane.range.maxMidi - pitch.midi) * PX_PER_SEMITONE;
                  const out = [];
                  if (trailWidth > 0) {
                    out.push(
                      <rect
                        key={`trail-${lane.voice}-${event.absolutePosition}-${pi}-${pitch.midi}`}
                        x={x + Math.max(2, w)}
                        y={y}
                        width={trailWidth}
                        height={PX_PER_SEMITONE}
                        rx={1}
                        fill={fill}
                        fillOpacity={Math.max(0.15, opacity * 0.35)}
                        stroke="none"
                        pointerEvents="none"
                      />,
                    );
                  }
                  out.push(
                    <rect
                      key={`note-${lane.voice}-${event.absolutePosition}-${pi}-${pitch.midi}`}
                      x={x}
                      y={y}
                      width={Math.max(2, w)}
                      height={PX_PER_SEMITONE}
                      rx={1}
                      fill={fill}
                      fillOpacity={opacity}
                      stroke={fill}
                      strokeOpacity={1}
                      strokeWidth={0.5}
                    />,
                  );
                  return out;
                });
              })}
            </g>
          ))}

          {/* Range overlay (drag in progress or committed range) */}
          {(() => {
            const range =
              drag !== null
                ? {
                    startBar: Math.min(drag.startBar, drag.endBar),
                    endBar: Math.max(drag.startBar, drag.endBar),
                  }
                : selection.kind === "range"
                  ? { startBar: selection.startBar, endBar: selection.endBar }
                  : null;
            if (range === null) return null;
            const startIdx = score.bars.findIndex((b) => b.index === range.startBar);
            const endIdx = score.bars.findIndex((b) => b.index === range.endBar);
            if (startIdx < 0 || endIdx < 0) return null;
            const startBeat = barStartsBeats[startIdx];
            const endBeat =
              endIdx + 1 < barStartsBeats.length
                ? barStartsBeats[endIdx + 1]
                : totalBeats;
            const x = LANE_PITCH_RULER_WIDTH + startBeat * pxPerBeat;
            const w = (endBeat - startBeat) * pxPerBeat;
            return (
              <rect
                x={x}
                y={0}
                width={w}
                height={totalHeight}
                fill="hsl(173 80% 40%)"
                fillOpacity={0.1}
                stroke="hsl(173 80% 50%)"
                strokeOpacity={0.6}
                strokeWidth={1}
                pointerEvents="none"
              />
            );
          })()}

          {/* Playhead */}
          <line
            x1={LANE_PITCH_RULER_WIDTH + playhead * pxPerBeat}
            y1={0}
            x2={LANE_PITCH_RULER_WIDTH + playhead * pxPerBeat}
            y2={totalHeight}
            stroke="hsl(173 80% 55%)"
            strokeWidth={1}
            strokeDasharray="2 2"
            pointerEvents="none"
          />
        </g>

        {/* Fixed pitch-ruler column overlay (drawn last so it covers panned content) */}
        <g>
          <rect
            x={0}
            y={0}
            width={LANE_PITCH_RULER_WIDTH}
            height={totalHeight}
            fill="hsl(240 14% 9%)"
          />
          <line
            x1={LANE_PITCH_RULER_WIDTH}
            y1={0}
            x2={LANE_PITCH_RULER_WIDTH}
            y2={totalHeight}
            stroke="hsl(240 10% 16%)"
            strokeWidth={1}
          />
          {lanes.map((lane) => (
            <g key={`lane-header-${lane.voice}`}>
              <rect
                x={0}
                y={lane.yTop}
                width={LANE_PITCH_RULER_WIDTH}
                height={lane.height}
                fill={selectedVoice === lane.voice ? "hsl(173 80% 14%)" : "hsl(240 14% 9%)"}
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVoice(lane.voice);
                }}
              />
              <line
                x1={4}
                y1={lane.yTop + 2}
                x2={4}
                y2={lane.yTop + lane.height - 2}
                stroke={voiceColor(lane.voice)}
                strokeWidth={selectedVoice === lane.voice ? 3 : 2}
                pointerEvents="none"
              />
              <text
                x={12}
                y={lane.yTop + 14}
                fill="hsl(0 0% 96%)"
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                pointerEvents="none"
              >
                {lane.voice}
              </text>
              {(() => {
                const ticks: number[] = [];
                for (let m = lane.range.maxMidi; m >= lane.range.minMidi; m -= 1) {
                  if (m % 12 === 0) ticks.push(m);
                }
                return ticks.map((m) => {
                  const y = lane.yTop + (lane.range.maxMidi - m) * PX_PER_SEMITONE;
                  return (
                    <text
                      key={`octlabel-${lane.voice}-${m}`}
                      x={LANE_PITCH_RULER_WIDTH - 6}
                      y={y + 3}
                      fill="hsl(240 5% 50%)"
                      fontSize={9}
                      fontFamily="ui-monospace, monospace"
                      textAnchor="end"
                      pointerEvents="none"
                    >
                      C{m / 12 - 1}
                    </text>
                  );
                });
              })()}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default PianoRoll;
