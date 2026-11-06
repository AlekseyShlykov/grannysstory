import { beforeEach, describe, expect, it, vi } from "vitest";
import { progressRecord, reportProgress } from "../src/app/progressReport";
import { regionPacks } from "../src/data/catalog";
import { generateSession } from "../src/engine/biography";
import { lifeTimelinePoints } from "../src/engine/lifeTimeline";
import type { GameSessionState } from "../src/data/types";
import { selection } from "./helpers";

const ENDPOINT = "https://script.example/exec";

function life(seed = "progress-seed"): GameSessionState {
  const start = selection("tver", 1932, seed);
  return generateSession(start, regionPacks[start.birthRegionId]);
}

function atStep(state: GameSessionState, step: number): GameSessionState {
  return { ...state, dialogue: { ...state.dialogue, step } };
}

function sentBodies(fetchMock: ReturnType<typeof vi.fn>): Array<Record<string, unknown>> {
  return fetchMock.mock.calls.map(([, init]) => JSON.parse(String((init as RequestInit).body)));
}

beforeEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("playthrough progress for the owner's sheet", () => {
  it("numbers five-year stages from 1 and reports the final screen as finished", () => {
    const state = life();
    const total = lifeTimelinePoints(state.selection).length;
    const first = progressRecord(atStep(state, 0), "ru", "player");
    expect(first).toMatchObject({ event: "stage", stage: 1, stagesTotal: total, inGameYear: 1932, age: 0, finished: false, language: "ru", birthRegionId: "tver", birthYear: 1932 });
    expect(progressRecord(atStep(state, 3), "en", "player")).toMatchObject({ stage: 4, inGameYear: 1947, age: 15, language: "en" });
    const finished = progressRecord({ ...state, screen: "atlas" }, "en", "player");
    expect(finished).toMatchObject({ event: "finished", stage: total, finished: true });
  });

  it("sends each stage of a run once and never sends the conversation itself", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const state = life();

    reportProgress(atStep(state, 0), "ru", ENDPOINT);
    reportProgress(atStep(state, 0), "ru", ENDPOINT);
    reportProgress(atStep(state, 1), "en", ENDPOINT);
    reportProgress(atStep(state, 0), "en", ENDPOINT);
    reportProgress({ ...state, screen: "atlas" }, "en", ENDPOINT);
    reportProgress({ ...state, screen: "atlas" }, "en", ENDPOINT);

    const bodies = sentBodies(fetchMock);
    expect(bodies.map((body) => [body.event, body.stage, body.language])).toEqual([
      ["stage", 1, "ru"],
      ["stage", 2, "en"],
      ["finished", lifeTimelinePoints(state.selection).length, "en"]
    ]);
    expect(new Set(bodies.map((body) => body.playerId)).size).toBe(1);
    for (const body of bodies) {
      expect(Object.keys(body).sort()).toEqual(["age", "birthRegionId", "birthYear", "clientTime", "datasetVersion", "event", "finished", "inGameYear", "language", "playerId", "sessionId", "stage", "stagesTotal"]);
    }
  });

  it("keeps separate runs apart and stays silent without an endpoint", () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    expect(reportProgress(life("first"), "ru", "")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
    reportProgress(life("first"), "ru", ENDPOINT);
    reportProgress(life("second"), "ru", ENDPOINT);
    expect(sentBodies(fetchMock).map((body) => body.sessionId)).toEqual(["first", "second"]);
  });
});
