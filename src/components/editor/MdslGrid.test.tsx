import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, act } from "@testing-library/react";
import { useState } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@/lib/musicdsl";
import MdslGrid from "./MdslGrid";
import PianoRoll from "./PianoRoll";
import { NO_SELECTION, type Selection } from "./selection";

const FIXTURE_DIR = join(__dirname, "../../lib/musicdsl/__fixtures__");
const readFixture = (name: string) =>
  readFileSync(join(FIXTURE_DIR, `${name}.mdsl`), "utf-8");

describe("MdslGrid", () => {
  const score = parse(readFixture("basic_4-4"));

  it("renders the sticky header with BAR.BEAT, STR/HAR/SUS, and voice column buttons", () => {
    // Voice column header colors are verified live in the browser; jsdom's CSS
    // parser rejects modern space-separated hsl() syntax and strips the whole
    // inline style attribute, so we can only assert structural shape here.
    const { container } = render(
      <MdslGrid score={score} selection={NO_SELECTION} onSelectionChange={() => {}} />,
    );
    const text = container.textContent ?? "";
    expect(text).toContain("BAR.BEAT");
    expect(text).toContain("STR");
    expect(text).toContain("HAR");
    expect(text).toContain("SUS");
    const voiceButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).filter((b) => ["LH", "RH"].includes(b.textContent?.trim() ?? ""));
    expect(voiceButtons.map((b) => b.textContent?.trim())).toEqual(["LH", "RH"]);
  });

  it("collapses dot runs ≥ 4 by default — basic_4-4 shows 4 collapsed runs per bar", () => {
    const { container } = render(
      <MdslGrid score={score} selection={NO_SELECTION} onSelectionChange={() => {}} />,
    );
    // Collapsed runs render as a <button> with text "23R" or "23R |".
    const collapseButtons = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).filter((b) => /^\d+R(\s\|)?$/.test(b.textContent?.trim() ?? ""));
    expect(collapseButtons.length).toBe(8); // 4 per bar × 2 bars
  });

  it("clicking a voice column header emits voice selection and toggles", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <MdslGrid score={score} selection={NO_SELECTION} onSelectionChange={onSelectionChange} />,
    );
    const lh = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
      (b) => b.textContent?.trim() === "LH",
    );
    expect(lh).not.toBeUndefined();
    fireEvent.click(lh!);
    expect(onSelectionChange).toHaveBeenCalledWith({ kind: "voice", voice: "LH" });
  });

  it("dragging the BAR.BEAT gutter commits a range selection (preserves selected voice)", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <MdslGrid
        score={score}
        selection={{ kind: "voice", voice: "RH" }}
        onSelectionChange={onSelectionChange}
      />,
    );
    const gutters = Array.from(
      container.querySelectorAll<HTMLElement>("[data-bar]"),
    );
    const bar1 = gutters.find((g) => g.dataset.bar === "1");
    const bar2 = gutters.find((g) => g.dataset.bar === "2");
    expect(bar1).toBeDefined();
    expect(bar2).toBeDefined();
    // jsdom's elementFromPoint doesn't honor real layout, so we patch it for this test
    // to return whichever data-bar element was passed via the synthetic clientX/Y.
    const realFromPoint = document.elementFromPoint;
    document.elementFromPoint = (x: number) => {
      if (x === 1000) return bar2 ?? null;
      return bar1 ?? null;
    };
    try {
      fireEvent.mouseDown(bar1!, { clientX: 0, clientY: 0, button: 0 });
      fireEvent.mouseMove(window, { clientX: 1000, clientY: 0 });
      fireEvent.mouseUp(window);
    } finally {
      document.elementFromPoint = realFromPoint;
    }
    expect(onSelectionChange).toHaveBeenCalled();
    const arg = onSelectionChange.mock.calls.at(-1)![0];
    expect(arg).toMatchObject({ kind: "range", voice: "RH", startBar: 1, endBar: 2 });
  });

  it("clicking a collapsed NR button expands the run inline", () => {
    const { container, rerender } = render(
      <MdslGrid score={score} selection={NO_SELECTION} onSelectionChange={() => {}} />,
    );
    const before = container.querySelectorAll(".grid > .contents").length;
    const collapseBtn = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => b.textContent?.trim() === "23R");
    fireEvent.click(collapseBtn!);
    rerender(
      <MdslGrid score={score} selection={NO_SELECTION} onSelectionChange={() => {}} />,
    );
    const after = container.querySelectorAll(".grid > .contents").length;
    expect(after - before).toBe(22); // one collapsed → 23 expanded dot rows
  });

  it("view-toggle preserves selection: PianoRoll → Grid → PianoRoll keeps the same Selection", () => {
    // Mount a tiny harness component that toggles view, mirroring Workspace.
    const Harness = () => {
      const [view, setView] = useState<"piano-roll" | "mdsl-grid">("piano-roll");
      const [selection, setSelection] = useState<Selection>(NO_SELECTION);
      return (
        <div>
          <button data-testid="toggle" onClick={() => setView((v) => (v === "piano-roll" ? "mdsl-grid" : "piano-roll"))}>
            toggle
          </button>
          <div data-testid="sel">{JSON.stringify(selection)}</div>
          {view === "piano-roll" ? (
            <PianoRoll
              score={score}
              playhead={0}
              selection={selection}
              onSelectionChange={setSelection}
            />
          ) : (
            <MdslGrid score={score} selection={selection} onSelectionChange={setSelection} />
          )}
        </div>
      );
    };
    const { container, getByTestId } = render(<Harness />);

    // 1. Select LH from PianoRoll.
    const prHeaders = Array.from(
      container.querySelectorAll<SVGRectElement>("rect"),
    ).filter(
      (r) =>
        r.getAttribute("width") === "56" &&
        (r as unknown as HTMLElement).style.cursor === "pointer",
    );
    act(() => {
      fireEvent.click(prHeaders[0]);
    });
    expect(getByTestId("sel").textContent).toBe('{"kind":"voice","voice":"LH"}');

    // 2. Toggle to grid — selection persists.
    act(() => {
      fireEvent.click(getByTestId("toggle"));
    });
    expect(getByTestId("sel").textContent).toBe('{"kind":"voice","voice":"LH"}');
    // The grid renders its LH header with selected styling (bg-secondary/40).
    const lhBtn = Array.from(
      container.querySelectorAll<HTMLButtonElement>("button"),
    ).find((b) => b.textContent?.trim() === "LH");
    expect(lhBtn?.className).toContain("bg-secondary/40");

    // 3. Toggle back to PianoRoll — still selected.
    act(() => {
      fireEvent.click(getByTestId("toggle"));
    });
    expect(getByTestId("sel").textContent).toBe('{"kind":"voice","voice":"LH"}');
  });
});
