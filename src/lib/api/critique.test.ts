import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postCritique } from "./critique";
import { ApiError } from "./common";
import { STORAGE_KEY } from "@/lib/auth/client";

const TOKEN = "header.eyJzdWIiOiJ4IiwidGllciI6InJldmlld2VyIiwianRpIjoieCIsImlhdCI6MSwiZXhwIjo5OTk5OTk5OTk5fQ.sig";

beforeEach(() => {
  sessionStorage.clear();
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
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("postCritique", () => {
  it("returns the suggestion list on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          suggestions: [
            {
              location: "bar 3",
              issue: "voice leading skip",
              suggested_fix: "step down",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const out = await postCritique({
      musicdsl: "x",
      master_wav_url: "https://r2/master.wav",
      original_prompt: "Test",
    });
    expect(out.suggestions).toHaveLength(1);
    expect(out.suggestions[0].location).toBe("bar 3");
  });

  it("throws ApiError on Gemini upstream failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "critique_failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const err = await postCritique({
      musicdsl: "x",
      master_wav_url: "u",
      original_prompt: "p",
    }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
  });
});
