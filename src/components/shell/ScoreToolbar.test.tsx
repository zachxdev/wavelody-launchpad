import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import ScoreToolbar from "./ScoreToolbar";

const baseProps = {
  view: "piano-roll" as const,
  onViewChange: vi.fn(),
  isPlaying: false,
  onTogglePlay: vi.fn(),
  onStop: vi.fn(),
  position: "1:1.000",
  bar: 1,
  totalBars: 4,
};

describe("ScoreToolbar", () => {
  it("clicking Play calls onTogglePlay", () => {
    const onTogglePlay = vi.fn();
    const { getByRole } = render(
      <ScoreToolbar {...baseProps} onTogglePlay={onTogglePlay} />,
    );
    fireEvent.click(getByRole("button", { name: "Play" }));
    expect(onTogglePlay).toHaveBeenCalledOnce();
  });

  it("renders Pause when isPlaying is true", () => {
    const { queryByRole } = render(
      <ScoreToolbar {...baseProps} isPlaying={true} />,
    );
    expect(queryByRole("button", { name: "Pause" })).not.toBeNull();
    expect(queryByRole("button", { name: "Play" })).toBeNull();
  });

  it("clicking Stop calls onStop", () => {
    const onStop = vi.fn();
    const { getByRole } = render(<ScoreToolbar {...baseProps} onStop={onStop} />);
    fireEvent.click(getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledOnce();
  });

  it("disables play/stop and shows 'Loading audio…' pill when audioStatus='loading'", () => {
    const { getByRole, getByText } = render(
      <ScoreToolbar {...baseProps} audioStatus="loading" />,
    );
    const play = getByRole("button", { name: "Play" }) as HTMLButtonElement;
    const stop = getByRole("button", { name: "Stop" }) as HTMLButtonElement;
    expect(play.disabled).toBe(true);
    expect(stop.disabled).toBe(true);
    expect(getByText(/loading audio/i)).not.toBeNull();
  });

  it("shows 'Audio unavailable' pill when audioStatus='error'", () => {
    const { getByText } = render(
      <ScoreToolbar {...baseProps} audioStatus="error" />,
    );
    expect(getByText(/audio unavailable/i)).not.toBeNull();
  });

  it("renders the position readout and bar X of Y", () => {
    const { getByText } = render(
      <ScoreToolbar {...baseProps} position="2:3.500" bar={2} totalBars={8} />,
    );
    expect(getByText("2:3.500")).not.toBeNull();
    expect(getByText("Bar 2 of 8")).not.toBeNull();
  });
});
