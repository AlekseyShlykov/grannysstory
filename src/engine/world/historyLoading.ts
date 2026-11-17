import type { GameSessionState } from "../../data/types";
import type { WorldData } from "../../data/worldTypes";
import { getLocation } from "./geography";
import { plausibleDestinations } from "./migration";

/** Small set of packs needed before a conversation can resolve a reviewed domestic move. */
export function historyPlaceIds(state: GameSessionState, world: WorldData): string[] {
  const places = new Set([
    ...state.biography.residenceHistory.map((residence) => residence.placeId),
    ...state.biography.branches.map((branch) => branch.destinationPlaceId).filter((id): id is string => Boolean(id))
  ]);
  const birth = state.biography.residenceHistory[0]?.placeId;
  if (birth && ["ES", "JP"].includes(getLocation(world, birth)?.country ?? "")) {
    // A later choice can follow an earlier move to its original destination. Load the four supported
    // domestic alternatives up front, so that recalculating this unresolved route works offline too.
    for (const branch of state.biography.branches.filter((item) => !item.resolved)) {
      for (const location of plausibleDestinations(world, birth, branch.year)) places.add(location.id);
    }
  }
  return [...places];
}
