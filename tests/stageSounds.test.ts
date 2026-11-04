import { describe, expect, it } from "vitest";
import type { GameSessionState } from "../src/data/types";
import { stageCueForTransition, STAGE_CUES, type StageCueName } from "../src/app/stageSounds";

function state(birthYear: number, step: number, facts: string[] = [], places = ["tver"]): GameSessionState {
  return {
    selection: { birthRegionId: "tver", birthYear, conversationYear: Math.min(birthYear + 100, 2020), runSeed: "sound-seed", datasetVersion: "test" },
    dialogue: { step },
    discovery: { facts: facts.map((id) => ({ id, learnedAtStep: step, lifeEventIds: [] })) },
    biography: { residenceHistory: places.map((placeId, index) => ({ placeId, fromYear: birthYear + index * 5, toYear: 2020 })) }
  } as unknown as GameSessionState;
}

describe("stage sounds", () => {
  it("plays only when the five-year point advances", () => {
    expect(stageCueForTransition(state(1930, 1), state(1930, 1), new Set())).toBeNull();
    expect(stageCueForTransition(state(1930, 0), state(1930, 1), new Set())).not.toBeNull();
  });

  it("uses the old tram for an actual move before 1970", () => {
    expect(stageCueForTransition(state(1950, 0), state(1950, 1, [], ["tver", "moscow"]), new Set())).toBe("oldTram");
  });

  it("associates fluorescent light with a newly told work stage from 1950 through 1999", () => {
    const previous = state(1950, 0);
    const next = state(1950, 1, ["fact:work:start"]);
    expect(stageCueForTransition(previous, next, new Set())).toBe("fluorescentLight");
  });

  it("never chooses dated specialist sounds outside their period or subject", () => {
    const forbidden = new Set<StageCueName>(["oilLamp", "oldCar", "oldTram", "fluorescentLight"]);
    for (let index = 0; index < 30; index += 1) {
      const previous = state(2000, 0);
      previous.selection.runSeed = `late-${index}`;
      const next = state(2000, 1);
      next.selection.runSeed = `late-${index}`;
      expect(forbidden.has(stageCueForTransition(previous, next, new Set())!)).toBe(false);
    }
  });

  it("has eighteen stage cues in addition to the opening tea sound", () => {
    expect(Object.keys(STAGE_CUES)).toHaveLength(18);
  });
});
