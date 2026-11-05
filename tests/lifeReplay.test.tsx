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
    expect(document.querySelector(".life-replay-sentence")).toHaveTextContent(/^\d{4}\. .+\.$/);
    expect(document.querySelector(".life-replay-target")).not.toBeNull();
    expect(document.querySelector(".life-replay-edge.advancing")).toBeNull();
    expect(screen.queryByText("Выбранный путь")).not.toBeInTheDocument();
    expect(document.querySelector(".life-replay-copy h3")).toBeNull();
    const speed = screen.getByRole("slider", { name: "Скорость воспроизведения" });
    fireEvent.change(speed, { target: { value: "2" } });
    expect(screen.getByText("2×")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: "Пауза" })).toHaveAttribute("aria-pressed", "true");
    expect(document.querySelector(".life-replay-edge.advancing")).not.toBeNull();
    expect(document.querySelector(".life-replay-target.arriving")).not.toBeNull();
    act(() => vi.advanceTimersByTime(950));
    expect(screen.getByText(/2 из \d+/)).toBeInTheDocument();

    for (let guard = 0; !document.querySelector(".life-replay-fork.preview") && guard < 40; guard += 1) {
      act(() => vi.advanceTimersByTime(950));
    }
    const fork = document.querySelector(".life-replay-fork.preview")!;
    const alternative = fork.querySelector(".life-replay-alternative-dot")!;
    const selected = document.querySelector(".life-replay-target")!;
    expect(fork).not.toBeNull();
    expect(alternative.getAttribute("cy")).toBe(selected.getAttribute("cy"));
    expect(alternative.getAttribute("cx")).not.toBe(selected.getAttribute("cx"));

    act(() => vi.advanceTimersByTime(950));
    expect(document.querySelector("circle.current.recentering")).not.toBeNull();
    expect(document.querySelector(".life-replay-recenter.advancing")).not.toBeNull();
    expect(document.querySelector(".life-replay-sentence")).toHaveTextContent(/^\d{4}\. .+\.$/);
    expect(document.querySelector(".life-replay-sentence")?.textContent).not.toContain(" — ");
  });
});
