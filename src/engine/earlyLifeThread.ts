import { earlyLifeThreads } from "../../content/scenes/earlyLifeThreads";
import type { EarlyBeatAge, EarlyLifeThread } from "../../content/scenes/earlyLifeThreads";
import type { LifeCourseFragment, LifePhase } from "../../content/scenes/lifeCourse";
import type { GameSessionState } from "../data/types";
import { seededRandom } from "./random";

export function earlyLifeThreadForSeed(runSeed: string): EarlyLifeThread {
  return earlyLifeThreads[seededRandom(`${runSeed}:early-life-thread`).int(0, earlyLifeThreads.length - 1)]!;
}

export function earlyLifeThreadForState(state: GameSessionState): EarlyLifeThread | null {
  const id = state.biography.narrativeThreadId;
  return id ? earlyLifeThreads.find((thread) => thread.id === id) ?? null : null;
}

export function earlyBeatForState(state: GameSessionState, age: number): LifeCourseFragment | null {
  if (age !== 0 && age !== 5 && age !== 10) return null;
  return earlyLifeThreadForState(state)?.beats[age as EarlyBeatAge] ?? null;
}

export function threadAffinity(fragment: LifeCourseFragment, state: GameSessionState): number {
  const thread = earlyLifeThreadForState(state);
  let score = thread?.themes.includes(fragment.theme) ? 4 : 0;
  if (state.biography.themes.includes(fragment.theme)) score += 2;
  return score;
}

/** Returns a later callback only at a few life thresholds, avoiding a repeated formula in every answer. */
export function threadEchoFor(state: GameSessionState, age: number, phase: LifePhase): string | null {
  const thread = earlyLifeThreadForState(state);
  if (!thread) return null;
  if (phase === "youth" && age < 25) return thread.echoes.youth;
  if (phase === "adult" && age < 35) return thread.echoes.adult;
  if (phase === "later" && age < 65) return thread.echoes.later;
  return null;
}

