import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AccessCodeForm from "./AccessCodeForm";
import { STORAGE_KEY } from "@/lib/auth/client";

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<AccessCodeForm />} />
        <Route path="/auth-success" element={<div data-testid="auth-success" />} />
      </Routes>
    </MemoryRouter>,
  );
}

const mockFetch = vi.fn();

beforeEach(() => {
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  sessionStorage.clear();
  mockFetch.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AccessCodeForm", () => {
  it("posts to /api/auth, stores session, redirects to /auth-success", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          token: "header.payload.signature",
          session: {
            code: "speedrun-andrew-c",
            tier: "reviewer",
            label: "Andrew Chen",
            generations_max: 20,
            edits_max: 60,
            expires_at: "2026-05-30T00:00:00.000Z",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const { getByLabelText, getByRole, findByTestId } = renderWithRouter();
    fireEvent.change(getByLabelText("Access code"), {
      target: { value: "speedrun-andrew-c" },
    });
    fireEvent.click(getByRole("button", { name: /enter demo/i }));

    await findByTestId("auth-success");

    const stored = sessionStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored as string).token).toBe("header.payload.signature");

    expect(mockFetch).toHaveBeenCalledWith("/api/auth", expect.objectContaining({
      method: "POST",
    }));
  });

  it("shows the server error message on 401", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Code not recognized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { getByLabelText, getByRole, findByText } = renderWithRouter();
    fireEvent.change(getByLabelText("Access code"), {
      target: { value: "speedrun-bogus" },
    });
    fireEvent.click(getByRole("button", { name: /enter demo/i }));

    await findByText(/code not recognized/i);
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("shows the quota-at-limit message on 429", async () => {
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const { getByLabelText, getByRole, findByText } = renderWithRouter();
    fireEvent.change(getByLabelText("Access code"), {
      target: { value: "speedrun-x" },
    });
    fireEvent.click(getByRole("button", { name: /enter demo/i }));

    await findByText(/all codes for this tier are at quota/i);
  });

  it("shows the empty-code error inline without calling fetch", async () => {
    const { getByRole, findByText } = renderWithRouter();
    fireEvent.click(getByRole("button", { name: /enter demo/i }));

    await findByText(/please enter a code/i);
    await waitFor(() => {
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
