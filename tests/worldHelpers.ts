import { clearWorldPacks, registerWorldPack, validateWorldPack, worldData } from "../src/data/worldStore";
import type { WorldPack } from "../src/data/worldTypes";

const packs = import.meta.glob<WorldPack>("../public/data/world/packs/*.json", { eager: true, import: "default" });

/** Registers every exported pack, as a browser would after loading them for a life (or from IndexedDB). */
export function loadWholeWorld() {
  clearWorldPacks();
  for (const raw of Object.values(packs)) registerWorldPack(validateWorldPack(raw, raw.locationId));
  return worldData();
}
