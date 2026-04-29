import {
  Bar,
  BeatRow,
  ControlCurveToken,
  Dynamic,
  Header,
  Note,
  OnsetMode,
  OnsetOffset,
  ParseError,
  Pitch,
  PitchStep,
  Rational,
  Score,
  SusNote,
  TimeSignature,
  VoiceCell,
} from "./types";

const FIXED_LEADING_COLUMNS = ["BAR", "BEAT", "STR", "HAR", "SUS"];

const DYNAMICS: ReadonlySet<string> = new Set([
  "ppp",
  "pp",
  "p",
  "mp",
  "mf",
  "f",
  "ff",
  "fff",
  "sfz",
]);

const STEP_TO_PC: Record<PitchStep, number> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs((a / gcd(a, b)) * b);
}

export function computeResolution(time: TimeSignature): number {
  // Formula: lcm(96, numerator * (4 / denominator)).
  // Computed in rational form to handle cases where 4/denominator is not an integer
  // (e.g. 9/8 → numerator*4/denominator = 9/2, lcm(96, 9/2) = 288).
  const { numerator, denominator } = time;
  const n = numerator * 4;
  const d = denominator;
  const g = gcd(n, d);
  const nReduced = n / g;
  const dReduced = d / g;
  return lcm(96 * dReduced, nReduced) / dReduced;
}

export function pitchToMidi(step: PitchStep, alter: -1 | 0 | 1, octave: number): number {
  return (octave + 1) * 12 + STEP_TO_PC[step] + alter;
}

const DEFAULT_HEADER: Header = {
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  resolution: 96,
  instruments: [],
  voices: [],
};

interface ParserState {
  lineNo: number;
}

function err(state: ParserState, message: string, columnHint = 1): never {
  throw new ParseError(message, state.lineNo, columnHint);
}

function parsePitch(token: string, state: ParserState): Pitch {
  const m = /^([A-G])(#|b|n)?(-?\d+)$/.exec(token);
  if (!m) err(state, `Invalid pitch token: "${token}"`);
  const step = m[1] as PitchStep;
  let alter: -1 | 0 | 1 = 0;
  if (m[2] === "#") alter = 1;
  else if (m[2] === "b") alter = -1;
  const octave = parseInt(m[3], 10);
  return { step, alter, octave, midi: pitchToMidi(step, alter, octave) };
}

function parseDynamic(token: string, state: ParserState): Dynamic {
  if (!DYNAMICS.has(token)) err(state, `Unknown dynamic: "${token}"`);
  return token as Dynamic;
}

function parseFraction(input: string, state: ParserState): Rational {
  const m = /^(\d+)\/(\d+)$/.exec(input);
  if (!m) err(state, `Invalid offset fraction: "${input}"`);
  const num = parseInt(m[1], 10);
  const den = parseInt(m[2], 10);
  if (den === 0) err(state, `Offset denominator cannot be zero`);
  if (num <= 0 || num >= den) {
    err(state, `Offset must be a proper fraction in lowest terms (got ${num}/${den})`);
  }
  if (gcd(num, den) !== 1) {
    err(state, `Offset must be in lowest terms (got ${num}/${den})`);
  }
  return { num, den };
}

interface InnerNoteParts {
  pitches: Pitch[];
  dynamic: Dynamic;
  durationUnits: number;
  sustain: boolean;
  articulation?: string;
  tag?: string;
}

function parseInnerNote(inner: string, state: ParserState): InnerNoteParts {
  // tag #x is at the very end of the inner string (before closing paren which is already stripped).
  let body = inner;
  let tag: string | undefined;
  const tagMatch = /#([a-z])$/.exec(body);
  if (tagMatch) {
    tag = tagMatch[1];
    body = body.slice(0, body.length - tagMatch[0].length);
  }

  const colonParts = body.split(":");
  if (colonParts.length !== 3) {
    err(state, `Note must have form (PITCH:DYNAMIC:DURATION), got "(${inner})"`);
  }
  const pitchPart = colonParts[0];
  const dynPart = colonParts[1];
  let durPart = colonParts[2];

  // Articulation suffix: ".word" appearing after digits-and-optional-s.
  let articulation: string | undefined;
  const artMatch = /\.([A-Za-z][A-Za-z0-9]*)$/.exec(durPart);
  if (artMatch) {
    articulation = artMatch[1];
    durPart = durPart.slice(0, durPart.length - artMatch[0].length);
  }

  let sustain = false;
  if (durPart.endsWith("s")) {
    sustain = true;
    durPart = durPart.slice(0, -1);
  }
  if (!/^\d+$/.test(durPart)) {
    err(state, `Invalid duration: "${durPart}"`);
  }
  const durationUnits = parseInt(durPart, 10);

  const pitches = pitchPart.split(",").map((p) => parsePitch(p, state));
  const dynamic = parseDynamic(dynPart, state);

  return { pitches, dynamic, durationUnits, sustain, articulation, tag };
}

function parseSusNote(inner: string, state: ParserState): SusNote {
  // SUS form: (PITCH[,PITCH]:DYNAMIC) — no duration.
  const parts = inner.split(":");
  if (parts.length !== 2) err(state, `SUS token must be (PITCHES:DYNAMIC), got "(${inner})"`);
  const pitches = parts[0].split(",").map((p) => parsePitch(p, state));
  const dynamic = parseDynamic(parts[1], state);
  return { pitches, dynamic };
}

interface CellTokens {
  notes: Note[];
  curves: ControlCurveToken[];
}

function consumeNoteToken(
  cell: string,
  i: number,
  state: ParserState,
): { note: Note; nextIdx: number } {
  // Starts at '('; consume until ')'.
  let j = i + 1;
  while (j < cell.length && cell[j] !== ")") j += 1;
  if (j >= cell.length) err(state, "Unclosed note paren");
  const inner = cell.slice(i + 1, j);
  const innerParts = parseInnerNote(inner, state);
  let nextIdx = j + 1;

  // Optional offset suffix: +M/D, ~M/D, -M/D directly after closing paren.
  let offset: OnsetOffset | undefined;
  if (nextIdx < cell.length && /[+~-]/.test(cell[nextIdx])) {
    const remainder = cell.slice(nextIdx);
    const m = /^([+~-])(\d+\/\d+)/.exec(remainder);
    if (m) {
      const sign = m[1];
      const fraction = parseFraction(m[2], state);
      const mode: OnsetMode =
        sign === "+" ? "forward" : sign === "~" ? "anchored" : "backward";
      offset = { mode, fraction };
      nextIdx += m[0].length;
    }
  }

  const note: Note = {
    pitches: innerParts.pitches,
    dynamic: innerParts.dynamic,
    durationUnits: innerParts.durationUnits,
    sustain: innerParts.sustain,
    ...(innerParts.articulation !== undefined && {
      articulation: innerParts.articulation,
    }),
    ...(innerParts.tag !== undefined && { tag: innerParts.tag }),
    ...(offset !== undefined && { offset }),
  };
  return { note, nextIdx };
}

function consumeCurveToken(
  cell: string,
  i: number,
  state: ParserState,
): { curve: ControlCurveToken; nextIdx: number } {
  const dimChar = cell[i];
  const dim = dimChar.toUpperCase() as "J" | "Y";
  const releases = dimChar === dimChar.toLowerCase();
  let j = i + 1;
  let scope: string = "master";
  if (cell[j] === "#") {
    let k = j + 1;
    while (k < cell.length && /[a-z]/.test(cell[k])) k += 1;
    if (k === j + 1) err(state, `Empty tag after '#' in curve token`);
    scope = cell.slice(j + 1, k);
    j = k;
    if (cell[j] === ":") j += 1;
  }
  let value: number | null = null;
  const numMatch = /^(\d+(?:\.\d+)?)/.exec(cell.slice(j));
  if (numMatch) {
    value = parseFloat(numMatch[1]);
    j += numMatch[0].length;
  }
  if (!releases && value === null) {
    err(state, `Curve waypoint ${dim} requires a value`);
  }
  if (value !== null && (value < 0 || value > 2)) {
    err(state, `Curve value out of range [0.0, 2.0]: ${value}`);
  }
  return { curve: { dim, releases, value, scope }, nextIdx: j };
}

function parseCellTokens(cell: string, state: ParserState): CellTokens {
  const notes: Note[] = [];
  const curves: ControlCurveToken[] = [];
  let i = 0;
  while (i < cell.length) {
    const c = cell[i];
    if (c === "(") {
      const { note, nextIdx } = consumeNoteToken(cell, i, state);
      notes.push(note);
      i = nextIdx;
    } else if (c === "J" || c === "j" || c === "Y" || c === "y") {
      const { curve, nextIdx } = consumeCurveToken(cell, i, state);
      curves.push(curve);
      i = nextIdx;
    } else {
      err(state, `Unexpected character in voice cell: "${c}"`);
    }
  }
  return { notes, curves };
}

function parseVoiceCell(raw: string, state: ParserState): VoiceCell {
  const trimmed = raw.trim();
  if (trimmed === "-" || trimmed === "") {
    return { notes: [], curves: [], silent: true };
  }
  // Explicit rest: R:24
  const restMatch = /^R:(\d+)$/.exec(trimmed);
  if (restMatch) {
    return {
      notes: [],
      curves: [],
      silent: false,
      rest: { durationUnits: parseInt(restMatch[1], 10) },
    };
  }
  const { notes, curves } = parseCellTokens(trimmed, state);
  return { notes, curves, silent: notes.length === 0 && curves.length === 0 };
}

function parseSusCell(raw: string, state: ParserState): SusNote[] {
  const trimmed = raw.trim();
  if (trimmed === "-" || trimmed === "") return [];
  // Form: (PITCHES:DYNAMIC) — possibly multiple parens, but spec shows one.
  const susNotes: SusNote[] = [];
  let i = 0;
  while (i < trimmed.length) {
    if (trimmed[i] !== "(") err(state, `SUS column must contain (...) tokens or "-"`);
    let j = i + 1;
    while (j < trimmed.length && trimmed[j] !== ")") j += 1;
    if (j >= trimmed.length) err(state, "Unclosed SUS paren");
    susNotes.push(parseSusNote(trimmed.slice(i + 1, j), state));
    i = j + 1;
  }
  return susNotes;
}

function parseHeaderLine(
  line: string,
  state: ParserState,
  header: Partial<Header>,
): void {
  const m = /^#\s*([A-Z_]+)\s*:\s*(.*)$/.exec(line);
  if (!m) err(state, `Malformed header line: "${line}"`);
  const key = m[1];
  const value = m[2].trim();
  switch (key) {
    case "TITLE":
      header.title = value;
      break;
    case "COMPOSER":
      header.composer = value;
      break;
    case "TEMPO": {
      const t = parseInt(value, 10);
      if (!Number.isFinite(t)) err(state, `Invalid TEMPO: "${value}"`);
      header.tempo = t;
      break;
    }
    case "TIME": {
      const tm = /^(\d+)\/(\d+)$/.exec(value);
      if (!tm) err(state, `Invalid TIME: "${value}"`);
      header.timeSignature = { numerator: parseInt(tm[1], 10), denominator: parseInt(tm[2], 10) };
      break;
    }
    case "KEY":
      header.key = value;
      break;
    case "RESOLUTION": {
      const r = parseInt(value, 10);
      if (!Number.isFinite(r) || r <= 0) err(state, `Invalid RESOLUTION: "${value}"`);
      header.resolution = r;
      break;
    }
    case "WAV_OFFSET": {
      const w = parseFloat(value);
      if (!Number.isFinite(w)) err(state, `Invalid WAV_OFFSET: "${value}"`);
      header.wavOffset = w;
      break;
    }
    case "INSTRUMENTS":
      header.instruments = value.split(",").map((s) => s.trim()).filter(Boolean);
      break;
    case "VOICES":
      header.voices = value.split(",").map((s) => s.trim()).filter(Boolean);
      break;
    default:
      err(state, `Unknown header field: "${key}"`);
  }
}

function isSchemaRow(cells: string[]): boolean {
  if (cells.length < FIXED_LEADING_COLUMNS.length) return false;
  for (let i = 0; i < FIXED_LEADING_COLUMNS.length; i += 1) {
    if (cells[i] !== FIXED_LEADING_COLUMNS[i]) return false;
  }
  return cells.slice(FIXED_LEADING_COLUMNS.length).every((c) => /^[A-Za-z][A-Za-z0-9_]*$/.test(c));
}

function splitCells(line: string): string[] {
  const cells: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of line) {
    if (ch === "(") {
      depth += 1;
      buf += ch;
    } else if (ch === ")") {
      depth = Math.max(0, depth - 1);
      buf += ch;
    } else if (ch === "," && depth === 0) {
      cells.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  cells.push(buf.trim());
  return cells;
}

function trimBarDelim(cells: string[]): { cells: string[]; endsBar: boolean } {
  if (cells.length === 0) return { cells, endsBar: false };
  const last = cells[cells.length - 1];
  if (last.endsWith("|")) {
    const stripped = last.slice(0, -1).trim();
    const next = cells.slice(0, -1);
    if (stripped.length > 0) next.push(stripped);
    return { cells: next, endsBar: true };
  }
  return { cells, endsBar: false };
}

function parseBeatRow(
  raw: string,
  voices: string[],
  state: ParserState,
): { row: BeatRow; bar: number } {
  const cells = splitCells(raw);
  if (cells.length < 3) err(state, `Row needs at least BAR, BEAT, content`);
  const bar = parseInt(cells[0], 10);
  const beat = parseInt(cells[1], 10);
  if (!Number.isFinite(bar) || !Number.isFinite(beat)) {
    err(state, `Row must start with integer bar and beat, got "${cells[0]}, ${cells[1]}"`);
  }
  const rest = cells.slice(2);
  const { cells: stripped, endsBar } = trimBarDelim(rest);

  // Dot row: single "." token after bar/beat means whole row empty.
  if (stripped.length === 1 && stripped[0] === ".") {
    return {
      row: makeEmptyRow(bar, beat, voices, endsBar),
      bar,
    };
  }

  const expectedLen = FIXED_LEADING_COLUMNS.length - 2 + voices.length; // STR, HAR, SUS, then voices
  if (stripped.length !== expectedLen) {
    err(
      state,
      `Row column count mismatch: expected ${expectedLen} (STR/HAR/SUS + ${voices.length} voices), got ${stripped.length}`,
    );
  }
  const [strCell, harCell, susCell, ...voiceCells] = stripped;
  const sustain = parseSusCell(susCell, state);
  const voicesMap = new Map<string, VoiceCell>();
  for (let i = 0; i < voices.length; i += 1) {
    voicesMap.set(voices[i], parseVoiceCell(voiceCells[i], state));
  }

  const row: BeatRow = {
    bar,
    beat,
    sustain,
    voices: voicesMap,
    endsBar,
    ...(strCell !== "-" && strCell !== "" ? { structure: strCell } : {}),
    ...(harCell !== "-" && harCell !== "" ? { harmony: harCell } : {}),
  };
  return { row, bar };
}

function makeEmptyRow(bar: number, beat: number, voices: string[], endsBar: boolean): BeatRow {
  const voicesMap = new Map<string, VoiceCell>();
  for (const v of voices) {
    voicesMap.set(v, { notes: [], curves: [], silent: true });
  }
  return { bar, beat, sustain: [], voices: voicesMap, endsBar };
}

function parseNRToken(
  raw: string,
  state: ParserState,
): { count: number; endsBar: boolean } | null {
  const m = /^(\d+)R(\s*\|)?$/.exec(raw.trim());
  if (!m) return null;
  const count = parseInt(m[1], 10);
  if (count < 2) err(state, `NR count must be >= 2, got "${m[1]}R"`);
  return { count, endsBar: m[2] !== undefined };
}

function expandNR(
  count: number,
  endsBar: boolean,
  prevBar: number,
  prevBeat: number,
  voices: string[],
): { rows: BeatRow[]; nextBar: number; nextBeat: number } {
  const rows: BeatRow[] = [];
  let beat = prevBeat;
  for (let i = 0; i < count; i += 1) {
    beat += 1;
    const last = i === count - 1;
    rows.push(makeEmptyRow(prevBar, beat, voices, last && endsBar));
  }
  const nextBar = endsBar ? prevBar + 1 : prevBar;
  const nextBeat = endsBar ? 0 : beat;
  return { rows, nextBar, nextBeat };
}

export function parse(source: string): Score {
  const lines = source.split(/\r?\n/);
  const header: Partial<Header> = {};
  let hadHeaderBlock = false;
  let hadSchemaRow = false;
  let voices: string[] = [];
  const rows: BeatRow[] = [];

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const state: ParserState = { lineNo: i + 1 };
    const trimmed = raw.trim();
    if (trimmed === "") {
      i += 1;
      continue;
    }
    if (trimmed.startsWith("#")) {
      hadHeaderBlock = true;
      parseHeaderLine(trimmed, state, header);
      i += 1;
      continue;
    }
    // Schema row?
    const cells = splitCells(trimmed);
    if (!hadSchemaRow && isSchemaRow(cells)) {
      hadSchemaRow = true;
      const declared = cells.slice(FIXED_LEADING_COLUMNS.length);
      voices = declared;
      if (header.voices && header.voices.length > 0) {
        if (header.voices.length !== declared.length) {
          err(state, `Schema row voices (${declared.join(",")}) do not match header VOICES`);
        }
      } else {
        header.voices = declared;
      }
      i += 1;
      continue;
    }

    // If no schema row was declared and headers had VOICES, adopt them.
    if (voices.length === 0) {
      if (header.voices && header.voices.length > 0) {
        voices = header.voices;
      } else {
        // Infer from this row: count = total - 2 (BAR, BEAT) - 3 (STR, HAR, SUS), unless dot-form.
        const probe = trimBarDelim(cells.slice(2)).cells;
        const isDot = probe.length === 1 && probe[0] === ".";
        const inferred = isDot ? 0 : Math.max(0, probe.length - 3);
        voices = Array.from({ length: inferred }, (_, k) => `V${k + 1}`);
        header.voices = voices;
      }
    }

    // NR token?
    const nr = parseNRToken(trimmed, state);
    if (nr !== null) {
      if (rows.length === 0) {
        err(state, `NR token cannot appear before any beat row`);
      }
      const last = rows[rows.length - 1];
      const expanded = expandNR(nr.count, nr.endsBar, last.bar, last.beat, voices);
      rows.push(...expanded.rows);
      i += 1;
      continue;
    }

    const { row } = parseBeatRow(trimmed, voices, state);
    rows.push(row);
    i += 1;
  }

  // Synthesize defaults for missing header fields.
  const filled: Header = {
    ...DEFAULT_HEADER,
    ...header,
    voices: voices.length > 0 ? voices : header.voices ?? [],
    instruments: header.instruments ?? [],
  };
  if (!header.timeSignature) filled.timeSignature = { numerator: 4, denominator: 4 };
  if (!header.resolution) filled.resolution = computeResolution(filled.timeSignature);

  // Group rows into bars.
  const bars: Bar[] = [];
  let currentRows: BeatRow[] = [];
  let currentBarIdx = -1;
  let currentResolution = filled.resolution;
  const currentTime = filled.timeSignature;
  for (const row of rows) {
    if (row.bar !== currentBarIdx) {
      if (currentRows.length > 0) {
        bars.push({
          index: currentBarIdx,
          rows: currentRows,
          resolution: currentResolution,
          timeSignature: currentTime,
        });
      }
      currentRows = [];
      currentBarIdx = row.bar;
    }
    // Mid-piece RESOLUTION override via STRUCTURE column.
    if (row.structure) {
      const resMatch = /^<RESOLUTION:(\d+)>$/.exec(row.structure);
      if (resMatch) currentResolution = parseInt(resMatch[1], 10);
    }
    currentRows.push(row);
  }
  if (currentRows.length > 0) {
    bars.push({
      index: currentBarIdx,
      rows: currentRows,
      resolution: currentResolution,
      timeSignature: currentTime,
    });
  }

  return {
    header: filled,
    bars,
    hadHeaderBlock,
    hadSchemaRow,
  };
}
