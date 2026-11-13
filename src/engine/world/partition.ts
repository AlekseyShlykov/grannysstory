import type { Residence } from "../../data/types";
import type { WorldData } from "../../data/worldTypes";
import { seededRandom } from "../random";
import type { ResidencePeriod } from "./events";
import { getLocation, isoDay, periodEnd, periodStart, sovereignAt } from "./geography";

/**
 * Some cities were divided for part of the century (Berlin 1949–1990). A resident of such a city lived in exactly
 * one part during the division, so her residence carries the part as an annotation: the map and "did she move"
 * logic still see one continuous city, while history (events, everyday context, sovereignty, milestones) is read
 * from the part.
 */

function yearOf(value: string | null, edge: "start" | "end"): number {
  return Number((edge === "start" ? periodStart(value) : periodEnd(value)).slice(0, 4));
}

/** Location ids that only exist as a part of a divided city; they are never offered as a destination themselves. */
const partCache = new WeakMap<WorldData["locations"], Set<string>>();

export function partitionPartIds(world: WorldData): Set<string> {
  const cached = partCache.get(world.locations);
  if (cached) return cached;
  const parts = new Set<string>();
  for (const location of world.locations.values()) {
    for (const partition of location.partitions ?? []) for (const id of partition.into) parts.add(id);
  }
  partCache.set(world.locations, parts);
  return parts;
}

/** The part of a divided city whose state matches the place she came from, if any. */
function partMatchingOrigin(world: WorldData, into: string[], originId: string | null, year: number): string | null {
  if (!originId) return null;
  const origin = sovereignAt(world, originId, isoDay(year));
  return into.find((id) => sovereignAt(world, id, isoDay(year)) === origin) ?? null;
}

/**
 * Adds `partitions` to every residence in a divided city. A woman who already lived there when the city was
 * divided ends up on one side by a separate seeded draw (a game assumption, not a population share); a woman who
 * arrives during the division lives in the part that belongs to the state she came from.
 */
export function annotatePartitions(world: WorldData, residences: readonly Residence[], seed: string, preferredPart?: string): Residence[] {
  const ordered = [...residences].sort((a, b) => a.fromYear - b.fromYear);
  return ordered.map((residence, index) => {
    const { partitions: previousParts, ...base } = residence;
    const location = getLocation(world, residence.placeId);
    const parts: NonNullable<Residence["partitions"]> = [];
    for (const partition of location?.partitions ?? []) {
      const fromYear = Math.max(residence.fromYear, yearOf(partition.from, "start"));
      const toYear = Math.min(residence.toYear, yearOf(partition.to, "end"));
      if (fromYear > toYear || !partition.into.length) continue;
      const arrivedDuring = residence.fromYear >= yearOf(partition.from, "start");
      const previous = ordered[index - 1];
      const previousPlace = previous ? placeAtYear([previous], previous.toYear) : null;
      // A side already decided for this residence (or chosen on the opening screen) is canon and is kept.
      const kept = previousParts?.find((part) => partition.into.includes(part.placeId))?.placeId;
      const chosen = !arrivedDuring && preferredPart && partition.into.includes(preferredPart) ? preferredPart : undefined;
      const matching = arrivedDuring ? partMatchingOrigin(world, partition.into, previousPlace, residence.fromYear) : null;
      const placeId = kept ?? chosen ?? matching ?? seededRandom(`${seed}:partition:${location!.id}:${partition.from ?? ""}`).pick(partition.into);
      parts.push({ placeId, fromYear, toYear });
    }
    return parts.length ? { ...base, partitions: parts } : base;
  });
}

/** Residence periods as history sees them: a divided city is replaced by its part for the years of division. */
export function expandResidences(residences: readonly Residence[]): ResidencePeriod[] {
  const result: ResidencePeriod[] = [];
  for (const residence of [...residences].sort((a, b) => a.fromYear - b.fromYear)) {
    let cursor = residence.fromYear;
    for (const part of [...(residence.partitions ?? [])].sort((a, b) => a.fromYear - b.fromYear)) {
      if (part.fromYear > cursor) result.push({ placeId: residence.placeId, fromYear: cursor, toYear: part.fromYear - 1 });
      result.push({ placeId: part.placeId, fromYear: part.fromYear, toYear: part.toYear });
      cursor = part.toYear + 1;
    }
    if (cursor <= residence.toYear) result.push({ placeId: residence.placeId, fromYear: cursor, toYear: residence.toYear });
  }
  return result;
}

/** Where history places her in a year (the part of a divided city when relevant). */
export function placeAtYear(residences: readonly Residence[], year: number): string | null {
  const expanded = expandResidences(residences);
  return expanded.find((period) => year >= period.fromYear && year <= period.toYear)?.placeId
    ?? expanded.at(-1)?.placeId
    ?? null;
}
