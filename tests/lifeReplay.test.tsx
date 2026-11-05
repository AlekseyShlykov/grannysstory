import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LifeReplay } from "../src/app/LifeReplay";
import { generateSession } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { selection } from "./helpers";
import { packFor } from "./worldHelpers";

afterEach(() => vi.useRealTimers());

describe("life replay", () => {
  it("plays the selected life forward one known event at a time", () => {
    let state = generateSession(selection("tver", 1920, "replay-life"), packFor("tver"));
    for (let guard = 0; state.screen !== "atlas" && guard < 90; guard += 1) {
      state = chooseOption(state, currentScene(state).options[0]!.id);
    }
    vi.useFakeTimers();
    render(<LifeReplay state={state} />);

    expect(screen.getByText(/1 из \d+/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Пауза" })).toHaveAttribute("aria-pressed", "true");
    act(() => vi.advanceTimersByTime(1900));
    expect(screen.getByText(/2 из \d+/)).toBeInTheDocument();
  });
});
