import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@/lib/musicdsl";
import PianoRoll from "./PianoRoll";
import { NO_SELECTION } from "./selection";

const FIXTURE_DIR = join(__dirname, "../../lib/musicdsl/__fixtures__");
const readFixture = (name: string) =>
  readFileSync(join(FIXTURE_DIR, `${name}.mdsl`), "utf-8");

describe("PianoRoll", () => {
  const score = parse(readFixture("basic_4-4"));

  it("renders one note rect per pitch (basic_4-4 has 26: 2 LH whole notes + 8 RH chords × 3 pitches)", () => {
    const { container } = render(
      <PianoRoll
        score={score}
        playhead={0}
        selection={NO_SELECTION}
        onSelectionChange={() => {}}
      />,
    );
    const noteRects = container.querySelectorAll('rect[rx="1"][stroke-opacity="1"]');
    expect(noteRects.length).toBe(26);
  });

  it("emits voice selection when a lane header is clicked", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <PianoRoll
        score={score}
        playhead={0}
        selection={NO_SELECTION}
        onSelectionChange={onSelectionChange}
      />,
    );
    const headers = Array.from(container.querySelectorAll<SVGRectElement>("rect")).filter(
      (r) => r.getAttribute("width") === "56" && (r as unknown as HTMLElement).style.cursor === "pointer",
    );
    expect(headers.length).toBe(2);
    fireEvent.click(headers[0]);
    expect(onSelectionChange).toHaveBeenCalledWith({ kind: "voice", voice: "LH" });
  });

  it("toggles voice selection off when the same header is clicked again", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <PianoRoll
        score={score}
        playhead={0}
        selection={{ kind: "voice", voice: "LH" }}
        onSelectionChange={onSelectionChange}
      />,
    );
    const headers = Array.from(container.querySelectorAll<SVGRectElement>("rect")).filter(
      (r) => r.getAttribute("width") === "56" && (r as unknown as HTMLElement).style.cursor === "pointer",
    );
    fireEvent.click(headers[0]);
    expect(onSelectionChange).toHaveBeenCalledWith({ kind: "none" });
  });

  it("emits a range selection on ruler drag", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <PianoRoll
        score={score}
        playhead={0}
        selection={NO_SELECTION}
        onSelectionChange={onSelectionChange}
      />,
    );
    const ruler = container.querySelector<SVGRectElement>('rect[style*="col-resize"]');
    expect(ruler).not.toBeNull();
    if (!ruler) return;
    // jsdom getBoundingClientRect returns zeros; mousedown at clientX 60 maps to
    // svg-x 60 which (after subtracting LANE_PITCH_RULER_WIDTH=56) is bar 1.
    fireEvent.mouseDown(ruler, { clientX: 60, clientY: 5 });
    fireEvent.mouseMove(window, { clientX: 200, clientY: 5 });
    fireEvent.mouseUp(window);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    const arg = onSelectionChange.mock.calls[0][0];
    expect(arg.kind).toBe("range");
    expect(arg.startBar).toBe(1);
    expect(arg.endBar).toBe(2);
  });

  it("preserves a selected voice into a range selection", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <PianoRoll
        score={score}
        playhead={0}
        selection={{ kind: "voice", voice: "RH" }}
        onSelectionChange={onSelectionChange}
      />,
    );
    const ruler = container.querySelector<SVGRectElement>('rect[style*="col-resize"]');
    if (!ruler) throw new Error("ruler not found");
    fireEvent.mouseDown(ruler, { clientX: 60, clientY: 5 });
    fireEvent.mouseMove(window, { clientX: 200, clientY: 5 });
    fireEvent.mouseUp(window);
    const arg = onSelectionChange.mock.calls[0][0];
    expect(arg).toMatchObject({ kind: "range", voice: "RH", startBar: 1, endBar: 2 });
  });
});
