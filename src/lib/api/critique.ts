import { jsonFetch } from "./common";
import type {
  CritiqueRequest,
  CritiqueResponse,
} from "../../../api/types";

export async function postCritique(
  body: CritiqueRequest,
  signal?: AbortSignal,
): Promise<CritiqueResponse> {
  return jsonFetch<CritiqueResponse>("/api/critique", {
    method: "POST",
    body: JSON.stringify(body),
    signal,
  });
}
