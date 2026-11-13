import type { SettlementClass, WorldData, WorldLocation } from "../../data/worldTypes";
import type { RandomSource } from "../random";
import { existsAt, getLocation, inPeriod, isoDay, isSettlement, occupationAt, resolveLocationId, sovereignAt } from "./geography";
import { partitionPartIds } from "./partition";
import type { ResidencePeriod } from "./events";
import type { MigrationCorridor } from "../../../content/historical/migrationCorridors";

const CLASS_ORDER: SettlementClass[] = ["capital", "large_city", "medium_city", "small_town", "rural"];

export interface MoveCheck {
  ok: boolean;
  reason?: string;
}

/** A move must connect two places that existed, had known coordinates and were not under occupation then. */
export function checkMove(world: WorldData, fromId: string, toId: string, year: number, allowInternational = false): MoveCheck {
  const day = isoDay(year);
  const from = getLocation(world, fromId);
  const to = getLocation(world, toId);
  if (!from || !to) return { ok: false, reason: "unknown place" };
  if (from.id === to.id) return { ok: false, reason: "same place" };
  if (!existsAt(to, day) || !isSettlement(to)) return { ok: false, reason: "destination is not a settlement that year" };
  if (partitionPartIds(world).has(to.id)) return { ok: false, reason: "part of a divided city; the city itself is the destination" };
  if (!to.coordinates || !from.coordinates) return { ok: false, reason: "no verified coordinates" };
  if (occupationAt(world, to.id, day)) return { ok: false, reason: "destination under occupation" };
  // A divided city is reachable when one of its parts belongs to her state that year; she then lives in that part.
  const division = to.partitions?.find((partition) => inPeriod(day, partition.from, partition.to));
  const destinationStates = division ? division.into.map((id) => sovereignAt(world, id, day)) : [sovereignAt(world, to.id, day)];
  const sameState = destinationStates.includes(sovereignAt(world, from.id, day));
  if (!sameState && !allowInternational) return { ok: false, reason: "crosses a state border" };
  return { ok: true };
}

/** Settlements she could plausibly move to in a given year, larger places first. */
export function plausibleDestinations(world: WorldData, fromId: string, year: number, allowInternational = false): WorldLocation[] {
  return [...world.locations.values()]
    .filter((location) => checkMove(world, fromId, location.id, year, allowInternational).ok)
    .sort((a, b) => CLASS_ORDER.indexOf(a.settlementClass ?? "rural") - CLASS_ORDER.indexOf(b.settlementClass ?? "rural") || a.id.localeCompare(b.id));
}

export function pickDestination(world: WorldData, fromId: string, year: number, random: RandomSource, allowInternational = false): string | null {
  const options = plausibleDestinations(world, fromId, year, allowInternational);
  return options.length ? random.pick(options).id : null;
}

/** Residence periods must not overlap, must be contiguous and every place must resolve. */
export function residenceIssues(world: WorldData, residences: ResidencePeriod[]): string[] {
  const issues: string[] = [];
  const ordered = [...residences].sort((a, b) => a.fromYear - b.fromYear);
  ordered.forEach((residence, index) => {
    if (!resolveLocationId(world, residence.placeId)) issues.push(`unknown residence ${residence.placeId}`);
    if (residence.fromYear > residence.toYear) issues.push(`inverted residence ${residence.placeId}`);
    const previous = ordered[index - 1];
    if (previous && previous.toYear >= residence.fromYear) issues.push(`overlapping residences at ${residence.fromYear}`);
    if (previous && previous.toYear + 1 < residence.fromYear) issues.push(`gap in residences before ${residence.fromYear}`);
  });
  return issues;
}

/** Corridors open to her that year: she lives in one of the origin states and the path is dated as open. */
export function openCorridors(world: WorldData, fromId: string, year: number, corridors: readonly MigrationCorridor[]): MigrationCorridor[] {
  const state = sovereignAt(world, fromId, isoDay(year));
  return corridors.filter((corridor) => year >= corridor.fromYear && year <= corridor.toYear && state !== null && corridor.fromStates.includes(state));
}

/** Destinations across the border along an open corridor that pass every other move check. */
export function corridorDestinations(world: WorldData, fromId: string, year: number, corridors: readonly MigrationCorridor[]): string[] {
  const ids = new Set(openCorridors(world, fromId, year, corridors).flatMap((corridor) => corridor.toPlaceIds));
  return [...ids].filter((id) => checkMove(world, fromId, id, year, true).ok).sort();
}
