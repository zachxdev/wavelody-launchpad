import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postRender } from "./render";
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

describe("postRender", () => {
  it("returns master_url + stems on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          master_url: "https://r2/master.wav",
          stems: [
            { voice_id: "LH", url: "https://r2/lh.wav" },
            { voice_id: "RH", url: "https://r2/rh.wav" },
          ],
          cached: false,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const out = await postRender({
      musicdsl: "# x\n",
      template: "piano_trio",
    });
    expect(out.master_url).toBe("https://r2/master.wav");
    expect(out.stems).toHaveLength(2);
    expect(out.cached).toBe(false);
  });

  it("throws ApiError on 502 render_failed", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ error: "render_failed", detail: "Performer down" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      ),
    );
    const err = await postRender({
      musicdsl: "# x\n",
      template: "piano_trio",
    }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(502);
  });
});
