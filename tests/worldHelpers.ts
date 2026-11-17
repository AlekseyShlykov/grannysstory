import { clearWorldPacks, registerWorldPack, validateWorldPack, worldData, worldManifest } from "../src/data/worldStore";
import type { WorldPack } from "../src/data/worldTypes";
import { manifest, regionPacks } from "../src/data/catalog";
import type { GameSessionState, RegionPack } from "../src/data/types";
import { chooseOption, currentScene } from "../src/engine/dialogue";

const packs = import.meta.glob<WorldPack>("../public/data/world/packs/*.json", { eager: true, import: "default" });

/** Registers every exported pack, as a browser would after loading them for a life (or from IndexedDB). */
export function loadWholeWorld() {
  clearWorldPacks();
  for (const raw of Object.values(packs)) registerWorldPack(validateWorldPack(raw, raw.locationId));
  // Catch stale transformed globs when new data files were exported since the last test run.
  for (const id of Object.keys(worldManifest.packs)) {
    if (!worldData().packs.has(id)) throw new Error(`Test pack glob omitted ${id}; clear the Vitest cache and retry`);
  }
  return worldData();
}

/** Region pack of a world-dataset place, as src/data/regionStore.ts builds it for the browser. */
export function worldRegionPack(regionId: string): RegionPack {
  return { regionId, version: manifest.datasetVersion, label: regionId, coverage: "", birthPlaces: [regionId], events: [] };
}

export function packFor(regionId: string): RegionPack {
  return regionPacks[regionId] ?? worldRegionPack(regionId);
}

/** Plays a conversation to the atlas, always asking the first offered question except at the turning point. */
export function playToEnd(state: GameSessionState, outcome: "pathA" | "pathB", pick = (index: number, count: number) => index % count): GameSessionState {
  for (let guard = 0; state.screen !== "atlas" && guard < 40; guard += 1) {
    const options = currentScene(state).options.filter((option) => option.id !== "history-more" || guard % 3 === 0);
    state = chooseOption(state, options.find((option) => option.id === outcome)?.id ?? options[pick(guard, options.length)]!.id);
  }
  return state;
}
