// Voice color mapping. Used by both the Piano Roll lanes and the mixer rows so a
// voice/instrument has the same accent in both places.

export const VOICE_COLORS: Record<string, string> = {
  // Piano voices.
  LH: "hsl(35 70% 55%)", // warm ochre — piano left hand
  RH: "hsl(173 80% 40%)", // teal — piano right hand (app primary accent)
  Piano: "hsl(173 80% 40%)", // mixer-side alias for piano
  // Piano Trio strings (Phase 6 default template).
  V: "hsl(330 60% 60%)", // rose — violin
  Vc: "hsl(265 60% 55%)", // deep purple — cello
  // String quartet shorthand from spec examples (kept for compatibility).
  V1: "hsl(173 80% 40%)",
  V2: "hsl(190 60% 50%)",
  VA: "hsl(35 70% 55%)",
  VC: "hsl(265 60% 55%)",
  // Other instruments referenced by old fixtures / future palette.
  Bass: "hsl(265 60% 55%)",
  Drums: "hsl(220 10% 55%)",
};

export const VOICE_COLOR_FALLBACK = "hsl(0 0% 60%)";

export function voiceColor(name: string): string {
  return VOICE_COLORS[name] ?? VOICE_COLOR_FALLBACK;
}
