// Wavelody auth + rate-limit Worker entrypoint. All endpoints under /api/*.
//
// Routes:
//   POST /api/auth      — code → JWT
//   GET  /api/me        — read current quota state
//   POST /api/generate  — Claude composition (stub, Phase 8)
//   POST /api/edit      — Claude scoped edit (stub, Phase 8)
//   POST /api/render    — RunPod Performer v0 render (stub, Phase 8)
//   POST /api/critique  — Gemini 2.5 Flash critique (stub, Phase 8)

import { handleAuth } from "./auth";
import { handleCritique } from "./critique";
import { handleEdit } from "./edit";
import { handleGenerate } from "./generate";
import { handleMe } from "./me";
import { handleRender } from "./render";
import { corsHeaders, json, withCors } from "./http";
import type { Env } from "./env";

const ROUTES: Record<string, (req: Request, env: Env) => Promise<Response>> = {
  "/api/auth": handleAuth,
  "/api/me": handleMe,
  "/api/generate": handleGenerate,
  "/api/edit": handleEdit,
  "/api/render": handleRender,
  "/api/critique": handleCritique,
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const handler = ROUTES[url.pathname];
    if (!handler) {
      return withCors(json({ error: "Not found" }, 404));
    }

    try {
      const response = await handler(request, env);
      return withCors(response);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Internal server error";
      console.error("Unhandled error in", url.pathname, e);
      return withCors(json({ error: message }, 500));
    }
  },
};
