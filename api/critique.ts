// POST /api/critique — Phase 8 will proxy to Gemini 2.5 Flash for structured
// suggestions on (prompt, MusicDSL, rendered WAV). Phase 7 stubs the body
// but applies a both-quotas gate per spec: critique can run alongside
// either a generation or an edit, so it costs against both counters.

import { json } from "./http";
import { gateWriteEndpoint, refreshHeader } from "./middleware";
import type { Env } from "./env";

export async function handleCritique(
  request: Request,
  env: Env,
): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const gate = await gateWriteEndpoint(request, env, {
    kind: "both",
    checkKillswitchFlag: false,
    useInflight: false,
  });
  if (gate instanceof Response) return gate;

  try {
    return json(
      {
        error: "Not implemented",
        detail:
          "Phase 8 wires this to Gemini 2.5 Flash for structured suggestions. The auth + dual-quota gate is live.",
      },
      501,
      refreshHeader(gate.ctx.refreshedToken),
    );
  } finally {
    await gate.release();
  }
}
