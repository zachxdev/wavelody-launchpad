// Cached system-prompt builders for Claude.
//
// Anthropic prompt caching only kicks in when the cached prefix is byte-for-
// byte stable across requests. We split the system prompt into two blocks:
//   1. The *long, stable* block: condensed MusicDSL v2.2 spec + worked
//      examples + ensemble template config + voice column conventions.
//      cache_control: ephemeral so it lives in the cache for ~5 min.
//   2. A short, *non-cached* block: mode-specific instructions (compose vs
//      edit) and the user's selection / current-score context for edits.
//
// The user message itself carries the per-request prompt. That keeps the
// cached-prefix surface as wide as possible.
//
// The condensed spec below is hand-written for Claude; it's not the full
// authored MusicDSL specification but a faithful subset that covers
// everything Claude needs to produce a valid composition. Worked examples
// come from the actual Piano Trio fixture so Claude sees the same shape it
// has to emit.

import type { SystemBlock } from "./anthropic";
import type { EnsembleTemplate } from "./types";
import { TEMPLATE_VOICE_ASSIGNMENTS } from "./types";

const MUSICDSL_SPEC = `MusicDSL v2.2 — composition format.

A score has a HEADER block and a GRID block.

HEADER (one '# KEY: value' line each):
  TITLE, COMPOSER, TEMPO (BPM int), TIME (e.g. 4/4), KEY (e.g. A minor),
  RESOLUTION (rows per bar; 96 is standard), INSTRUMENTS (comma list),
  VOICES (comma list of voice column names).

SCHEMA ROW (required, immediately after headers):
  BAR, BEAT, STR, HAR, SUS, <each voice column...>

GRID ROWS (one per row in resolution):
  BAR, BEAT, STR, HAR, SUS, <voice cells...>
  - BAR: 1-based int.
  - BEAT: 1..RESOLUTION.
  - STR: structure tag like <SECTION:A>, <PHRASE:start>, <CADENCE:auth>,
    <MODULATE:Aminor>, <TEMPO:96>; or '-' for none.
  - HAR: Roman numeral (I, ii, V7, viidim, bIII) or '-'.
  - SUS: ringing notes carried from prior rows '(C4,E4:p)' or '-'.
  - Voice cells: notes, rests, curves, or '-' for none.

NOTE TOKEN: (PITCH:DYNAMIC:DURATION[s][.articulation][#tag])
  PITCH: <step><alter><octave>  e.g. C4, F#5, Bb3.
  Chord: comma-joined pitches sharing dyn+dur, e.g. (C4,E4,G4:mf:24)
  DYNAMIC: ppp pp p mp mf f ff fff sfz
  DURATION: integer rows. At RESOLUTION=96 in 4/4: 24=quarter, 48=half,
    96=whole, 12=8th, 6=16th.
  's' suffix: note rings into SUS column on subsequent rows.
  Articulation: .stac .legato .trill (after duration).

EXPLICIT REST: R:24 (rest with duration; goes in a single voice cell).
EMPTY ROW: '.' alone — equivalent to '-, -, -, ...' across all columns.
NR COMPRESSION: '11R' = 11 consecutive empty rows; '11R |' = same but the
  last empty row carries the bar terminator. Use NR aggressively to keep
  scores compact — 80%+ of rows are typically empty at RES 96.

BAR TERMINATOR: append ' |' to the LAST content row of every bar.
  Every bar MUST start at BEAT=1 and end with '|'.

VALIDATION INVARIANTS the score MUST satisfy:
  - Bar starts at BEAT=1.
  - Bar ends with '|'.
  - Note duration never overflows the bar:
      beat + duration - 1 <= RESOLUTION
  - Voice column count matches header VOICES.
  - Every cell parses as a valid note token, rest, '-' or curve.

TYPICAL SCORE LENGTH: 16-32 bars in 4/4, RESOLUTION 96.`;

const PIANO_TRIO_EXAMPLE = `# TITLE: Piano Trio Demo
# COMPOSER: Wavelody
# TEMPO: 96
# TIME: 4/4
# KEY: C major
# RESOLUTION: 96
# INSTRUMENTS: piano, violin, cello
# VOICES: LH, RH, V, Vc
BAR, BEAT, STR, HAR, SUS, LH, RH, V, Vc
1, 1, <SECTION:A>, I, -, (C2:f:24), (C4,E4,G4:mf:12), (G4:mf:96), (C3:mp:48)
11R
1, 13, -, -, -, -, (C4,E4,G4:mp:12), -, -
11R
1, 25, -, -, -, (G2:f:24), (C4,E4,G4:mf:12), -, -
83R |
2, 1, -, IV, -, (F2:f:24), (F4,A4,C5:mf:12), (A4:mf:96), (F3:mp:48)
95R |
3, 1, -, V7, -, (G2:f:24), (G3,B3,D4,F4:mf:12), (D5:mf:96), (G2:mp:48)
95R |
4, 1, <CADENCE:auth>, I, -, (C2:mp:96s), (C4,E4,G4:mp:12), (C5:mf:24), (C3:f:96s)
95R |`;

const WORKED_EXAMPLES = `Worked example 1 — Piano Trio four-bar I-IV-V7-I cadence (RES 96, 4/4):

${PIANO_TRIO_EXAMPLE}

Worked example 2 — single voice, sparse melody:

# TITLE: Sparse Pensive
# TEMPO: 64
# TIME: 4/4
# KEY: A minor
# RESOLUTION: 96
# VOICES: V1
BAR, BEAT, STR, HAR, SUS, V1
1, 1, <SECTION:A>, i, -, (A4:p:48s)
1, 49, -, -, (A4:p), (E5:mp:48)
47R |
2, 1, -, VI, -, (F4:p:48)
47R
2, 49, -, V, -, (E4:mp:48)
47R |

Worked example 3 — String Quartet two bars (RES 96, 4/4):

# TITLE: Quartet
# TEMPO: 88
# TIME: 4/4
# KEY: G major
# RESOLUTION: 96
# INSTRUMENTS: violin, violin, viola, cello
# VOICES: V1, V2, VA, VC
BAR, BEAT, STR, HAR, SUS, V1, V2, VA, VC
1, 1, <SECTION:A>, I, -, (G5:f:96), (D5:mf:48), (B3:mf:48), (G2:f:96s)
1, 49, -, V, (G2:f), -, (A4:mf:48), (D4:mf:48), -
47R |
2, 1, -, IV, -, (C5:mf:96), (E5:mf:48), (G3:mf:48), (C3:mf:96s)
47R |`;

function templateBlock(template: EnsembleTemplate): string {
  const assignments = TEMPLATE_VOICE_ASSIGNMENTS[template];
  const lines = Object.entries(assignments).map(
    ([voice, instrument]) => `  ${voice} → ${instrument}`,
  );
  const voices = Object.keys(assignments).join(", ");
  return `Ensemble template: ${template}.
Voices (use these exact column names in VOICES): ${voices}
Voice → instrument mapping the renderer expects:
${lines.join("\n")}`;
}

// Per-template physical-playability constraints. Keeps the model
// inside what the target instruments can actually produce. Currently
// only violin_solo has constraints; piano_trio + string_quartet are
// polyphonic by nature so the existing free-form constraints are
// sufficient. Phase 8.5m: added after v16-claude landed an unplayable
// (E5, G#5) double-stop on bar 15 (both notes on the E string).
const INSTRUMENT_CONSTRAINTS: Partial<Record<EnsembleTemplate, string>> = {
  violin_solo: `PHYSICAL CONSTRAINTS — solo violin:
- Range: G3 (MIDI 55) to E7 (MIDI 100). Never write notes outside
  this range; high-position writing above E7 is harmonics-only.
- Polyphony: at most 2 simultaneous pitches per token (double-stops).
  Never write 3+ note chords as sustained — if you want richer
  harmony, break it into consecutive notes (arpeggio) instead.
- Double-stop physics: the violin's four strings are tuned G3, D4,
  A4, E5. A 2-note chord must place the lower note on one string
  and the higher note on the NEXT-HIGHER string (adjacent only),
  with the lower note STRICTLY BELOW the higher string's open
  pitch. Examples that work: (A4, E5) — open A + open E; (B4, E5)
  — A-string B4 + open E; (D5, F5) — A-string D5 + E-string F5.
  Examples that DON'T work: (E5, G#5) — both notes require the
  E string and cannot sustain together.
- Speed: 16th-note runs (duration=6 at RES=96) are fine; faster
  figures (duration<6) need explicit .trill or .legato
  articulation, never as bare note tokens.`,
};

function constraintsBlock(template: EnsembleTemplate): string {
  return INSTRUMENT_CONSTRAINTS[template] ?? "";
}

const COMPOSE_INSTRUCTIONS = `You are a composer. Given a user prompt and an
ensemble template, produce a complete MusicDSL v2.2 score.

Output rules:
- Output ONLY the score: header block, schema row, then grid rows. No
  prose, no markdown fences, no commentary.
- Use the EXACT voice column names from the ensemble template above.
- Use NR compression aggressively (e.g. '95R |' for an empty bar).
- 16-32 bars typical. Default to 16 if unsure.
- Always set RESOLUTION to 96 unless the time signature dictates otherwise.
- Every bar starts at BEAT=1 and ends with ' |' on its last row.
- Note duration must not overflow the bar.
- ROW DISCIPLINE: every grid row MUST have exactly N voice cells where
  N matches the VOICES header count. Never elide a voice column even
  when its cell is silent — use '-' for an inactive voice but never
  drop the cell. If VOICES is 'LH, RH, V, Vc' (4 voices) every grid
  row has 9 comma-separated fields total: BAR, BEAT, STR, HAR, SUS,
  LH, RH, V, Vc. Antiphonal / echo / call-and-response phrases are
  no exception: when one voice answers another, the silent voices
  still get '-' cells on every row.`;

const EDIT_INSTRUCTIONS = `You are an editor. Given the FULL current score
and an edit instruction scoped to (voice, bar range), produce a
MusicDSL slice covering ONLY the requested bar range for ONLY the
requested voice column. Other voices are not your concern.

Output rules:
- Output ONLY a MusicDSL slice — header block, schema row matching the
  current score's voices, then grid rows for the requested bar range.
- The slice MUST cover bars bar_start..bar_end inclusive. Include the
  full row content for those bars (all voices), even though only the
  named voice should change. The frontend extracts and merges the
  changed voice's cells.
- Preserve existing structure, harmony, and other voices unchanged
  unless the edit instruction explicitly asks otherwise.
- Maintain the same RESOLUTION and TIME as the current score.
- No prose, no markdown fences.`;

function cachedBlockText(template: EnsembleTemplate): string {
  const cb = constraintsBlock(template);
  // When a template has physical constraints (currently only
  // violin_solo), insert the constraints block between the voice
  // map and the worked examples. Templates without constraints
  // keep the prior 3-section layout so their goldens stay
  // byte-stable.
  const sections = cb
    ? [MUSICDSL_SPEC, "", templateBlock(template), "", cb, "", WORKED_EXAMPLES]
    : [MUSICDSL_SPEC, "", templateBlock(template), "", WORKED_EXAMPLES];
  return sections.join("\n\n");
}

export function buildComposeSystem(
  template: EnsembleTemplate,
): SystemBlock[] {
  const cached: SystemBlock = {
    type: "text",
    text: cachedBlockText(template),
    cache_control: { type: "ephemeral" },
  };
  const tail: SystemBlock = {
    type: "text",
    text: COMPOSE_INSTRUCTIONS,
  };
  return [cached, tail];
}

export function buildEditSystem(
  template: EnsembleTemplate,
  currentScore: string,
  voiceId: string,
  barStart: number,
  barEnd: number,
): SystemBlock[] {
  // Cache the spec + examples + template (long stable prefix). Don't try
  // to cache the current-score / selection block — it varies per request.
  const cached: SystemBlock = {
    type: "text",
    text: cachedBlockText(template),
    cache_control: { type: "ephemeral" },
  };
  const tail: SystemBlock = {
    type: "text",
    text: [
      EDIT_INSTRUCTIONS,
      "",
      `Selection: voice=${voiceId} bars=${barStart}..${barEnd}.`,
      "",
      "Full current score (for context):",
      "<score>",
      currentScore,
      "</score>",
    ].join("\n"),
  };
  return [cached, tail];
}

// Default Claude model. The Engine Readiness Gate accepts both Opus 4.7
// and Sonnet 4.6; we pick Opus 4.7 because the Speedrun budget treats
// generation cost as a one-time-per-prompt expense (cached prefix at 10%)
// and Opus produces noticeably better musical output on first pass.
export const DEFAULT_CLAUDE_MODEL = "claude-opus-4-7";
