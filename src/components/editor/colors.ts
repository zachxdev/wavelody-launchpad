// Voice color mapping. Used by both the Piano Roll lanes and the mixer rows so a
// voice/instrument has the same accent in both places.

export const VOICE_COLORS: Record<string, string> = {
  // Piano voices.
  LH: "hsl(35 70% 55%)", // warm ochre
  RH: "hsl(173 80% 40%)", // teal — app primary accent
  Piano: "hsl(173 80% 40%)", // mixer-side: same as RH (representative)
  // Strings / band voices.
  Bass: "hsl(265 60% 55%)", // deep purple
  Drums: "hsl(220 10% 55%)", // slate gray
  // String quartet shorthand from spec examples.
  V1: "hsl(173 80% 40%)",
  V2: "hsl(190 60% 50%)",
  VA: "hsl(35 70% 55%)",
  VC: "hsl(265 60% 55%)",
};

export const VOICE_COLOR_FALLBACK = "hsl(0 0% 60%)";

export function voiceColor(name: string): string {
  return VOICE_COLORS[name] ?? VOICE_COLOR_FALLBACK;
}
