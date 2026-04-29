// AST types for MusicDSL v2.2.
// Spec: https://app.notion.com/p/34466ea66bd5812d9730e737fe5a5a05

export type PitchStep = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export interface Pitch {
  step: PitchStep;
  alter: -1 | 0 | 1;
  octave: number;
  midi: number;
}

export type Dynamic =
  | "ppp"
  | "pp"
  | "p"
  | "mp"
  | "mf"
  | "f"
  | "ff"
  | "fff"
  | "sfz";

export interface Rational {
  num: number;
  den: number;
}

export type OnsetMode = "forward" | "anchored" | "backward";

export interface OnsetOffset {
  mode: OnsetMode;
  fraction: Rational;
}

export type CurveScope = "master" | string;

export interface ControlCurveToken {
  dim: "J" | "Y";
  releases: boolean;
  value: number | null;
  scope: CurveScope;
}

export interface Note {
  pitches: Pitch[];
  dynamic: Dynamic;
  durationUnits: number;
  sustain: boolean;
  articulation?: string;
  tag?: string;
  offset?: OnsetOffset;
}

export interface SusNote {
  pitches: Pitch[];
  dynamic: Dynamic;
}

export interface VoiceCell {
  notes: Note[];
  curves: ControlCurveToken[];
  rest?: { durationUnits: number };
  silent: boolean;
}

export interface BeatRow {
  bar: number;
  beat: number;
  structure?: string;
  harmony?: string;
  sustain: SusNote[];
  voices: Map<string, VoiceCell>;
  endsBar: boolean;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface Bar {
  index: number;
  rows: BeatRow[];
  resolution: number;
  timeSignature: TimeSignature;
}

export interface Header {
  title?: string;
  composer?: string;
  tempo: number;
  timeSignature: TimeSignature;
  key?: string;
  resolution: number;
  wavOffset?: number;
  instruments: string[];
  voices: string[];
}

export interface Score {
  header: Header;
  bars: Bar[];
  hadHeaderBlock: boolean;
  hadSchemaRow: boolean;
}

export class ParseError extends Error {
  readonly line: number;
  readonly column: number;
  constructor(message: string, line: number, column: number) {
    super(`${message} (line ${line}, column ${column})`);
    this.name = "ParseError";
    this.line = line;
    this.column = column;
  }
}
