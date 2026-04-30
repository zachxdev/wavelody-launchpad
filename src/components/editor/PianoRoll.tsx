import { useMemo } from "react";
import type { NoteEvent, Score } from "@/lib/musicdsl";
import { extractVoices } from "@/lib/musicdsl";
import { voiceColor } from "./colors";
import {
  DEFAULT_PX_PER_BEAT,
  LANE_GAP,
  LANE_PITCH_RULER_WIDTH,
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
  void selection;
  void onSelectionChange;
  const pxPerBeat = DEFAULT_PX_PER_BEAT;

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
  const playheadX = LANE_PITCH_RULER_WIDTH + playhead * pxPerBeat;

  return (
    <div className="relative h-full w-full overflow-auto bg-background">
      <svg
        width={LANE_PITCH_RULER_WIDTH + contentWidth}
        height={totalHeight}
        className="block select-none"
        style={{ minWidth: "100%" }}
      >
        {/* Pitch-ruler column background */}
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

        {/* Time ruler */}
        <g>
          <rect
            x={LANE_PITCH_RULER_WIDTH}
            y={0}
            width={contentWidth}
            height={RULER_HEIGHT}
            fill="hsl(240 14% 9%)"
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
        </g>

        {/* Lanes */}
        {lanes.map((lane) => (
          <g key={lane.voice}>
            {/* Lane background */}
            <rect
              x={LANE_PITCH_RULER_WIDTH}
              y={lane.yTop}
              width={contentWidth}
              height={lane.height}
              fill="hsl(240 18% 7%)"
            />
            {/* Lane bottom border */}
            <line
              x1={0}
              y1={lane.yTop + lane.height}
              x2={LANE_PITCH_RULER_WIDTH + contentWidth}
              y2={lane.yTop + lane.height}
              stroke="hsl(240 10% 16%)"
              strokeWidth={1}
            />
            {/* Pitch ruler header (lane title + octave labels) */}
            <rect
              x={0}
              y={lane.yTop}
              width={LANE_PITCH_RULER_WIDTH}
              height={lane.height}
              fill="hsl(240 14% 9%)"
            />
            <line
              x1={4}
              y1={lane.yTop + 2}
              x2={4}
              y2={lane.yTop + lane.height - 2}
              stroke={voiceColor(lane.voice)}
              strokeWidth={2}
            />
            <text
              x={12}
              y={lane.yTop + 14}
              fill="hsl(0 0% 96%)"
              fontSize={11}
              fontFamily="ui-monospace, monospace"
            >
              {lane.voice}
            </text>
            {/* Octave gridlines (C-row of every octave) */}
            {(() => {
              const ticks: number[] = [];
              for (let m = lane.range.maxMidi; m >= lane.range.minMidi; m -= 1) {
                if (m % 12 === 0) ticks.push(m);
              }
              return ticks.map((m) => {
                const y = lane.yTop + (lane.range.maxMidi - m) * PX_PER_SEMITONE;
                return (
                  <g key={`oct-${lane.voice}-${m}`}>
                    <line
                      x1={LANE_PITCH_RULER_WIDTH}
                      y1={y}
                      x2={LANE_PITCH_RULER_WIDTH + contentWidth}
                      y2={y}
                      stroke="hsl(240 10% 14%)"
                      strokeWidth={1}
                    />
                    <text
                      x={LANE_PITCH_RULER_WIDTH - 6}
                      y={y + 3}
                      fill="hsl(240 5% 50%)"
                      fontSize={9}
                      fontFamily="ui-monospace, monospace"
                      textAnchor="end"
                    >
                      C{m / 12 - 1}
                    </text>
                  </g>
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
            {/* Notes */}
            {lane.events.flatMap((event) => {
              const onsetBeat =
                event.absolutePosition / rowsPerBeat +
                computeOffsetBeats(event, rowsPerBeat);
              const widthBeats = event.note.durationUnits / rowsPerBeat;
              const x = LANE_PITCH_RULER_WIDTH + onsetBeat * pxPerBeat;
              const w = widthBeats * pxPerBeat;
              const fill = voiceColor(lane.voice);
              const opacity = dynamicToOpacity(event.note.dynamic);
              return event.note.pitches.map((pitch, pi) => {
                const y =
                  lane.yTop + (lane.range.maxMidi - pitch.midi) * PX_PER_SEMITONE;
                return (
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
                    strokeOpacity={0.85}
                    strokeWidth={0.5}
                  />
                );
              });
            })}
          </g>
        ))}

        {/* Playhead */}
        <line
          x1={playheadX}
          y1={0}
          x2={playheadX}
          y2={totalHeight}
          stroke="hsl(173 80% 55%)"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      </svg>
    </div>
  );
};

export default PianoRoll;
