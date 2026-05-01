import { jsonFetch } from "./common";
import type { EditRequest, EditResponse } from "../../../api/types";

export async function postEdit(
  body: EditRequest,
  signal?: AbortSignal,
): Promise<EditResponse> {
  return jsonFetch<EditResponse>("/api/edit", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
