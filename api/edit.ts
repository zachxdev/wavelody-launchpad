// POST /api/edit — Phase 8 will proxy a scoped-edit request to Claude with
// (selection, existing MusicDSL). Phase 7 stubs the body but applies the
// edit-quota gate. No killswitch (the killswitch protects expensive RunPod
// generations / renders, not edit-only requests). No inflight gate (edits
// are cheap and we don't need to serialise them per-code).

import { json } from "./http";
import { gateWriteEndpoint, refreshHeader } from "./middleware";
import type { Env } from "./env";

export async function handleEdit(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const gate = await gateWriteEndpoint(request, env, {
    kind: "edit",
    checkKillswitchFlag: false,
    useInflight: false,
  });
  if (gate instanceof Response) return gate;

  try {
    return json(
      {
        error: "Not implemented",
        detail:
          "Phase 8 wires this to the Claude scoped-edit pipeline. The auth + edit-quota gate is live.",
      },
      501,
      refreshHeader(gate.ctx.refreshedToken),
    );
  } finally {
    await gate.release();
  }
}
