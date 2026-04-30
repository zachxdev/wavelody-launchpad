// Tiny Response helpers shared across handlers. Centralising the JSON
// shape and the CORS headers keeps the handlers focused on business logic.

export function json(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Expose-Headers": "X-Refreshed-Token",
  };
}

export function withCors(response: Response): Response {
  for (const [k, v] of Object.entries(corsHeaders())) {
    response.headers.set(k, v);
  }
  return response;
}
