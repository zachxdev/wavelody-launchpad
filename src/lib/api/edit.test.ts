import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postEdit } from "./edit";
import { ApiError, NotAuthenticatedError } from "./common";
import { STORAGE_KEY } from "@/lib/auth/client";

const TOKEN = "header.eyJzdWIiOiJ4IiwidGllciI6InJldmlld2VyIiwianRpIjoieCIsImlhdCI6MSwiZXhwIjo5OTk5OTk5OTk5fQ.sig";

function seedSession(): void {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      token: TOKEN,
      info: {
        code: "x",
        tier: "reviewer",
        label: "x",
        generations_max: 20,
        edits_max: 60,
        expires_at: new Date(Date.now() + 86_400_000).toISOString(),
      },
    }),
  );
}

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("postEdit", () => {
  it("returns the parsed slice on success", async () => {
    seedSession();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          slice: "# slice\n",
          bar_start: 1,
          bar_end: 2,
          voice_id: "V",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const out = await postEdit({
      voice_id: "V",
      bar_start: 1,
      bar_end: 2,
      edit_prompt: "Test",
      current_score: "x",
    });
    expect(out.slice).toContain("# slice");
  });

  it("throws NotAuthenticatedError when there is no session", async () => {
    await expect(
      postEdit({
        voice_id: "V",
        bar_start: 1,
        bar_end: 1,
        edit_prompt: "x",
        current_score: "x",
      }),
    ).rejects.toBeInstanceOf(NotAuthenticatedError);
  });

  it("throws ApiError on 5xx with the parsed error body", async () => {
    seedSession();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "edit_failed" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const err = await postEdit({
      voice_id: "V",
      bar_start: 1,
      bar_end: 1,
      edit_prompt: "x",
      current_score: "x",
    }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(503);
    expect((err as ApiError).body.error).toBe("edit_failed");
  });
});
