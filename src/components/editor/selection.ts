// Selection state for the score editor. Lifted to Workspace so the prompt dock
// can read it for scope-edit operations in Phase 5+.

export type Selection =
  | { kind: "none" }
  | { kind: "voice"; voice: string }
  | { kind: "range"; voice?: string; startBar: number; endBar: number };

export const NO_SELECTION: Selection = { kind: "none" };
