import type { GameSessionState } from "../data/types";
import { lifeTimelinePoints } from "../engine/lifeTimeline";
import { seededRandom } from "../engine/random";

export const STAGE_CUES = {
  chair: "chair.mp3",
  countryside: "countryside.mp3",
  cup: "cup.mp3",
  fluorescentLight: "fluorescent_light.mp3",
  fridge: "fridge.mp3",
  keys: "keys.mp3",
  kitchenSounds: "kitchen_sounds.mp3",
  oilLamp: "oil_lamp.mp3",
  oldCar: "old_car.mp3",
  oldTram: "old_tram.mp3",
  papers: "papers.mp3",
  plate: "plate.mp3",
  rainWindow: "rain_window.mp3",
  tea2: "tea2.mp3",
  wardrobe: "wardrobe.mp3",
  waterSink: "water_sink.mp3",
  windowClose: "window_close.mp3",
  writing: "writing.mp3"
} as const;

export type StageCueName = keyof typeof STAGE_CUES;

const timeless: StageCueName[] = [
  "chair", "countryside", "cup", "fridge", "keys", "kitchenSounds", "papers", "plate",
  "rainWindow", "tea2", "wardrobe", "waterSink", "windowClose", "writing"
];

function learnedWork(previous: GameSessionState, next: GameSessionState): boolean {
  const before = new Set(previous.discovery.facts.map((fact) => fact.id));
  return next.discovery.facts.some((fact) => fact.id.startsWith("fact:work:") && !before.has(fact.id));
}

function movementYear(previous: GameSessionState, next: GameSessionState): number | null {
  const before = new Set(previous.biography.residenceHistory.map((period) => `${period.placeId}:${period.fromYear}`));
  return next.biography.residenceHistory.find((period) => !before.has(`${period.placeId}:${period.fromYear}`))?.fromYear ?? null;
}

/** One deterministic sound for an actual five-year advance; follow-up questions stay silent. */
export function stageCueForTransition(previous: GameSessionState, next: GameSessionState, played: ReadonlySet<StageCueName>): StageCueName | null {
  if (next.dialogue.step <= previous.dialogue.step) return null;
  const point = lifeTimelinePoints(next.selection)[next.dialogue.step];
  if (!point) return null;

  const priority: StageCueName[] = [];
  const movedAt = movementYear(previous, next);
  if (movedAt !== null && movedAt < 1970) priority.push("oldTram");
  if (learnedWork(previous, next) && point.year >= 1950 && point.year < 2000) priority.push("fluorescentLight");
  // Give sounds with an expiry a guaranteed last chance instead of letting the random pool miss them.
  if (point.year >= 1945 && point.year < 1950) priority.push("oilLamp");
  if (point.year >= 1975 && point.year < 1980) priority.push("oldCar");
  const unusedPriority = priority.find((cue) => !played.has(cue));
  if (unusedPriority) return unusedPriority;

  const eligible = [...timeless];
  if (point.year < 1950) eligible.push("oilLamp");
  if (point.year < 1980) eligible.push("oldCar");
  const unused = eligible.filter((cue) => !played.has(cue));
  const pool = unused.length ? unused : eligible;
  return seededRandom(`${next.selection.runSeed}:stage-sound:${point.year}`).pick(pool);
}
