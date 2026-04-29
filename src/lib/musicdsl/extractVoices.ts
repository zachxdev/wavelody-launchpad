import { Note, Score } from "./types";

export interface NoteEvent {
  voice: string;
  bar: number;
  beat: number;
  absolutePosition: number;
  note: Note;
}

export interface VoiceStream {
  voice: string;
  events: NoteEvent[];
}

// Walks the score in row order and emits per-voice note events with their absolute
// position (total rows from start of piece, beat 1 of bar 1 = position 0). Useful
// for editor rendering, MIDI export, and any pass that wants a flat per-voice
// timeline rather than the row-major grid form.
export function extractVoices(score: Score): VoiceStream[] {
  const voices = score.header.voices;
  const streams = new Map<string, NoteEvent[]>();
  for (const v of voices) streams.set(v, []);

  let absolutePosition = 0;
  for (const bar of score.bars) {
    for (const row of bar.rows) {
      for (const v of voices) {
        const cell = row.voices.get(v);
        if (!cell || cell.notes.length === 0) continue;
        for (const note of cell.notes) {
          const events = streams.get(v);
          if (events) {
            events.push({
              voice: v,
              bar: row.bar,
              beat: row.beat,
              absolutePosition: absolutePosition + (row.beat - 1),
              note,
            });
          }
        }
      }
    }
    absolutePosition += bar.resolution;
  }

  return voices.map((v) => ({ voice: v, events: streams.get(v) ?? [] }));
}
