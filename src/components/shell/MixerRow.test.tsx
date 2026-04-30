import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import MixerRow, { type MixerChannel } from "./MixerRow";

const channel: MixerChannel = {
  name: "LH",
  gain: 0.8,
  pan: 0,
  muted: false,
  soloed: false,
};

describe("MixerRow", () => {
  it("clicking the M button toggles muted", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<MixerRow channel={channel} onChange={onChange} />);
    fireEvent.click(getByRole("button", { name: /Mute LH/i }));
    expect(onChange).toHaveBeenCalledWith({ ...channel, muted: true });
  });

  it("clicking the S button toggles soloed", () => {
    const onChange = vi.fn();
    const { getByRole } = render(<MixerRow channel={channel} onChange={onChange} />);
    fireEvent.click(getByRole("button", { name: /Solo LH/i }));
    expect(onChange).toHaveBeenCalledWith({ ...channel, soloed: true });
  });

  it("aria-pressed reflects muted/soloed state", () => {
    const { getByRole } = render(
      <MixerRow
        channel={{ ...channel, muted: true, soloed: false }}
        onChange={() => {}}
      />,
    );
    expect(getByRole("button", { name: /Mute LH/i }).getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(getByRole("button", { name: /Solo LH/i }).getAttribute("aria-pressed")).toBe(
      "false",
    );
  });
});
