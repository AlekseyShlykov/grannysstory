import type { GeoLevel, WorldContext, WorldData } from "../../data/worldTypes";
import { ancestorsAt, isoDay, levelOf } from "./geography";

export interface ContextAnswer {
  context: WorldContext;
  /** Level of the node the answer came from; "national" for a city means the city has no own record. */
  level: GeoLevel;
  fallback: boolean;
}

/**
 * Everyday conditions at a place in a year, most specific first. Missing city data falls back to the region,
 * then the country; the caller is told how far it had to go, so it never presents national data as local.
 */
export function contextsAt(world: WorldData, placeId: string, year: number, type?: string): ContextAnswer[] {
  const chain = ancestorsAt(world, placeId, isoDay(year));
  const answers: ContextAnswer[] = [];
  chain.forEach((node, index) => {
    for (const context of world.packs.get(node)?.contexts ?? []) {
      if (context.from > year || context.to < year) continue;
      if (type && context.type !== type) continue;
      answers.push({ context, level: levelOf(world, node) ?? "national", fallback: index > 0 });
    }
  });
  return answers;
}

export function bestContext(world: WorldData, placeId: string, year: number, type: string): ContextAnswer | null {
  return contextsAt(world, placeId, year, type)[0] ?? null;
}
