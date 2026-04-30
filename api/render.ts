// POST /api/render — Phase 8 will proxy to the RunPod Wavelody Performer v0
// endpoint. Phase 7 stubs the body but applies the same gate as /generate:
// auth → killswitch → generation quota check + increment. No inflight gate
// — renders run alongside generations and we cap concurrency at the
// generation step.

import { json } from "./http";
import { gateWriteEndpoint, refreshHeader } from "./middleware";
import type { Env } from "./env";

export async function handleRender(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const gate = await gateWriteEndpoint(request, env, {
    kind: "generation",
    checkKillswitchFlag: true,
    useInflight: false,
  });
  if (gate instanceof Response) return gate;

  try {
    return json(
      {
        error: "Not implemented",
        detail:
          "Phase 8 wires this to the RunPod Wavelody Performer v0 render endpoint. The auth + generation-quota + killswitch gate is live.",
      },
      501,
      refreshHeader(gate.ctx.refreshedToken),
    );
  } finally {
    await gate.release();
  }
}
