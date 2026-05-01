import { jsonFetch } from "./common";
import type { RenderRequest, RenderResponse } from "../../../api/types";

export async function postRender(
  body: RenderRequest,
  signal?: AbortSignal,
): Promise<RenderResponse> {
  return jsonFetch<RenderResponse>("/api/render", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
