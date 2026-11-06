import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LifeProgress } from "../src/app/LifeProgress";
import { regionPacks } from "../src/data/catalog";
import type { GameSessionState } from "../src/data/types";
import { generateSession } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { lifeTimelinePoints } from "../src/engine/lifeTimeline";
import { I18nProvider } from "../src/i18n";
import { selection } from "./helpers";

function life(): GameSessionState {
  const start = selection("tver", 1932, "progress-bar-seed");
  return generateSession(start, regionPacks[start.birthRegionId]);
}

function progress(state: GameSessionState) {
  const view = render(<I18nProvider><LifeProgress state={state} /></I18nProvider>);
  const bar = screen.getByRole("progressbar");
  const result = {
    now: Number(bar.getAttribute("aria-valuenow")),
    max: Number(bar.getAttribute("aria-valuemax")),
    dots: bar.querySelectorAll(".life-progress-dots li").length,
    current: bar.querySelectorAll(".life-progress-dots li.current").length,
    done: bar.querySelectorAll(".life-progress-dots li.done").length,
    fill: (bar.querySelector(".life-progress-fill") as HTMLElement).style.width
  };
  view.unmount();
  return result;
}

describe("life progress line", () => {
  it("has one dot per five-year period and starts at the first", () => {
    const state = life();
    const total = lifeTimelinePoints(state.selection).length;
    expect(progress(state)).toEqual({ now: 1, max: total, dots: total, current: 1, done: 0, fill: "0%" });
  });

  it("follows the period of the latest question and ignores follow-ups inside a period", () => {
    let state = life();
    let followUps = 0;
    let moves = 0;
    for (let turn = 0; turn < 120 && state.screen === "conversation"; turn += 1) {
      const before = progress(state).now;
      const askedAbout = state.dialogue.step;
      state = chooseOption(state, currentScene(state).options[0]!.id);
      if (state.screen !== "conversation") break;
      const after = progress(state).now;
      // The dot stands on the period the latest question was about...
      expect(after).toBe(askedAbout + 1);
      // ...so it moves by one period at a time, and a follow-up inside a period leaves it in place.
      expect(after - before === 0 || after - before === 1 || turn === 0).toBe(true);
      if (after === before && turn > 0) followUps += 1;
      if (after === before + 1) moves += 1;
    }
    expect(followUps).toBeGreaterThan(0);
    expect(moves).toBeGreaterThan(10);
  });

  it("is full in the last period", () => {
    const state = life();
    const total = lifeTimelinePoints(state.selection).length;
    const last = progress({ ...state, dialogue: { ...state.dialogue, step: total - 1, answeredStep: total - 1 } });
    expect(last).toMatchObject({ now: total, done: total - 1, current: 1, fill: "100%" });
  });
});
