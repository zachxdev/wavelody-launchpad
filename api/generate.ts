// POST /api/generate — Phase 8 will proxy to Claude (Opus 4.7 / Sonnet 4.6)
// composition. Phase 7 stubs the body but applies the full write-endpoint
// gate: auth → killswitch → inflight (1 in-flight gen per code) → generation
// quota check + increment.

import { json } from "./http";
import { gateWriteEndpoint, refreshHeader } from "./middleware";
import type { Env } from "./env";

export async function handleGenerate(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const gate = await gateWriteEndpoint(request, env, {
    kind: "generation",
    checkKillswitchFlag: true,
    useInflight: true,
  });
  if (gate instanceof Response) return gate;

  try {
    return json(
      {
        error: "Not implemented",
        detail:
          "Phase 8 wires this to the Claude composition pipeline. The auth, quota, killswitch, and inflight gates are live.",
      },
      501,
      refreshHeader(gate.ctx.refreshedToken),
    );
  } finally {
    await gate.release();
  }
}
