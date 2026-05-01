import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { postGenerate } from "./generate";
import { ApiError } from "./common";
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

function sseStream(events: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const ev of events) controller.enqueue(enc.encode(ev));
      controller.close();
    },
  });
}

beforeEach(() => {
  sessionStorage.clear();
  seedSession();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("postGenerate", () => {
  it("dispatches attempt + chunk + complete callbacks and returns the final musicdsl", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        sseStream([
          `event: attempt\ndata: {"attempt":1}\n\n`,
          `event: chunk\ndata: {"text":"# TITLE: T\\n"}\n\n`,
          `event: chunk\ndata: {"text":"# TEMPO: 96\\n"}\n\n`,
          `event: complete\ndata: {"musicdsl":"# TITLE: T\\n# TEMPO: 96\\n"}\n\n`,
        ]),
        {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream",
            "X-Refreshed-Token": "new-token",
          },
        },
      ),
    );

    const onAttempt = vi.fn();
    const onChunk = vi.fn();
    const result = await postGenerate(
      { prompt: "Test" },
      { onAttempt, onChunk },
    );
    expect(result.musicdsl).toContain("# TITLE: T");
    expect(onAttempt).toHaveBeenCalledWith(1);
    expect(onChunk).toHaveBeenCalledTimes(2);

    // Refreshed token absorbed into storage.
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY)!);
    expect(stored.token).toBe("new-token");
  });

  it("throws ApiError on a terminal error event", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        sseStream([
          `event: attempt\ndata: {"attempt":1}\n\n`,
          `event: validation\ndata: {"attempt":1,"errors":["overflow"]}\n\n`,
          `event: error\ndata: {"error":"composition_failed","retry_after_seconds":5}\n\n`,
        ]),
        { status: 200, headers: { "Content-Type": "text/event-stream" } },
      ),
    );
    await expect(postGenerate({ prompt: "T" })).rejects.toBeInstanceOf(
      ApiError,
    );
  });

  it("throws ApiError when the server returns a non-200", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Generation quota exceeded" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }),
    );
    const err = await postGenerate({ prompt: "T" }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(429);
  });

  it("dispatches validation failure callback on retry", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        sseStream([
          `event: attempt\ndata: {"attempt":1}\n\n`,
          `event: validation\ndata: {"attempt":1,"errors":["overflow"]}\n\n`,
          `event: attempt\ndata: {"attempt":2}\n\n`,
          `event: complete\ndata: {"musicdsl":"# OK\\n"}\n\n`,
        ]),
        { status: 200, headers: { "Content-Type": "text/event-stream" } },
      ),
    );
    const onValidationFailure = vi.fn();
    await postGenerate({ prompt: "T" }, { onValidationFailure });
    expect(onValidationFailure).toHaveBeenCalledWith(1, ["overflow"]);
  });
});
