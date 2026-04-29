import {
  BeatRow,
  ControlCurveToken,
  Header,
  Note,
  Pitch,
  Score,
  SusNote,
  VoiceCell,
} from "./types";

const FIXED_LEADING_COLUMNS = ["BAR", "BEAT", "STR", "HAR", "SUS"];

function serializePitch(p: Pitch): string {
  const acc = p.alter === 1 ? "#" : p.alter === -1 ? "b" : "";
  return `${p.step}${acc}${p.octave}`;
}

function serializeNote(n: Note): string {
  const pitches = n.pitches.map(serializePitch).join(",");
  const dur = `${n.durationUnits}${n.sustain ? "s" : ""}${
    n.articulation ? `.${n.articulation}` : ""
  }`;
  const tag = n.tag ? `#${n.tag}` : "";
  let out = `(${pitches}:${n.dynamic}:${dur}${tag})`;
  if (n.offset) {
    const sign = n.offset.mode === "forward" ? "+" : n.offset.mode === "anchored" ? "~" : "-";
    out += `${sign}${n.offset.fraction.num}/${n.offset.fraction.den}`;
  }
  return out;
}

function serializeCurve(c: ControlCurveToken): string {
  const letter = c.releases ? c.dim.toLowerCase() : c.dim;
  const tagPart = c.scope === "master" ? "" : `#${c.scope}`;
  if (c.value === null) return `${letter}${tagPart}`;
  // Use repr that round-trips: integer if value is integral, otherwise decimal.
  const numStr = Number.isInteger(c.value) ? String(c.value) : String(c.value);
  if (tagPart) return `${letter}${tagPart}:${numStr}`;
  return `${letter}${numStr}`;
}

function serializeVoiceCell(cell: VoiceCell): string {
  if (cell.silent && cell.notes.length === 0 && cell.curves.length === 0 && !cell.rest) {
    return "-";
  }
  if (cell.rest && cell.notes.length === 0 && cell.curves.length === 0) {
    return `R:${cell.rest.durationUnits}`;
  }
  return [...cell.notes.map(serializeNote), ...cell.curves.map(serializeCurve)].join("");
}

function serializeSusCell(notes: SusNote[]): string {
  if (notes.length === 0) return "-";
  return notes
    .map((n) => `(${n.pitches.map(serializePitch).join(",")}:${n.dynamic})`)
    .join("");
}

function isRowEmpty(row: BeatRow, voiceOrder: string[]): boolean {
  if (row.structure || row.harmony) return false;
  if (row.sustain.length > 0) return false;
  for (const v of voiceOrder) {
    const cell = row.voices.get(v);
    if (!cell) continue;
    if (!cell.silent || cell.notes.length > 0 || cell.curves.length > 0 || cell.rest) {
      return false;
    }
  }
  return true;
}

function serializeRow(row: BeatRow, voiceOrder: string[]): string {
  const cells = [String(row.bar), String(row.beat)];
  if (isRowEmpty(row, voiceOrder)) {
    cells.push(".");
  } else {
    cells.push(row.structure ?? "-");
    cells.push(row.harmony ?? "-");
    cells.push(serializeSusCell(row.sustain));
    for (const v of voiceOrder) {
      const cell = row.voices.get(v);
      cells.push(cell ? serializeVoiceCell(cell) : "-");
    }
  }
  let out = cells.join(", ");
  if (row.endsBar) out += " |";
  return out;
}

function serializeHeader(header: Header): string[] {
  const lines: string[] = [];
  if (header.title !== undefined) lines.push(`# TITLE: ${header.title}`);
  if (header.composer !== undefined) lines.push(`# COMPOSER: ${header.composer}`);
  lines.push(`# TEMPO: ${header.tempo}`);
  lines.push(`# TIME: ${header.timeSignature.numerator}/${header.timeSignature.denominator}`);
  if (header.key !== undefined) lines.push(`# KEY: ${header.key}`);
  lines.push(`# RESOLUTION: ${header.resolution}`);
  if (header.wavOffset !== undefined) lines.push(`# WAV_OFFSET: ${header.wavOffset}`);
  if (header.instruments.length > 0) {
    lines.push(`# INSTRUMENTS: ${header.instruments.join(", ")}`);
  }
  if (header.voices.length > 0) {
    lines.push(`# VOICES: ${header.voices.join(", ")}`);
  }
  return lines;
}

function serializeSchemaRow(voices: string[]): string {
  return [...FIXED_LEADING_COLUMNS, ...voices].join(", ");
}

export function serialize(score: Score): string {
  const lines: string[] = [];
  if (score.hadHeaderBlock) {
    lines.push(...serializeHeader(score.header));
  }
  if (score.hadSchemaRow && score.header.voices.length > 0) {
    lines.push(serializeSchemaRow(score.header.voices));
  }
  for (const bar of score.bars) {
    for (const row of bar.rows) {
      lines.push(serializeRow(row, score.header.voices));
    }
  }
  return lines.join("\n") + "\n";
}
