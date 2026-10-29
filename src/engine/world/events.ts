import type { GeoLevel, WorldData, WorldEvent } from "../../data/worldTypes";
import { ancestorsAt, isoDay, levelOf, periodEnd, periodStart, resolveLocationId } from "./geography";

export interface ResidencePeriod {
  placeId: string;
  fromYear: number;
  toYear: number;
}

/** Stable attributes of a life; age-dependent groups are added per event. */
export interface LifeProfile {
  birthYear: number;
  groups: string[];
}

export interface RelevantEvent {
  event: WorldEvent;
  /** The administrative level through which the event reaches her residence. */
  level: GeoLevel;
  matchedLocationId: string;
  residenceId: string;
  year: number;
  age: number;
  /**
   * True when the record's own eligibility rules match her age and groups. Even then the event only
   * may have touched her: the biography decides separately whether anything happened to her personally.
   */
  personalCandidate: boolean;
}

export const LEVEL_SPECIFICITY: Record<GeoLevel, number> = {
  international: 0,
  national: 1,
  constituent: 2,
  regional: 3,
  district: 4,
  municipal: 5,
  local: 6
};

export function eventStartYear(event: WorldEvent): number {
  return Number(event.start.slice(0, 4));
}

export function eventEndYear(event: WorldEvent): number {
  return Number((event.end ?? event.start).slice(0, 4));
}

export function ageGroups(age: number): string[] {
  const groups: string[] = [];
  if (age < 14) groups.push("children");
  if (age >= 7 && age <= 17) groups.push("school_pupils");
  if (age >= 16 && age <= 30) groups.push("young_adults");
  if (age >= 60) groups.push("elderly");
  if (age >= 60) groups.push("pensioners");
  return groups;
}

function personalCandidate(event: WorldEvent, age: number, groups: string[]): boolean {
  const { minAge, maxAge, groupsAny } = event.eligibility;
  if (minAge === null && maxAge === null && !groupsAny.length) return false;
  if (minAge !== null && age < minAge) return false;
  if (maxAge !== null && age > maxAge) return false;
  return !groupsAny.length || groupsAny.some((group) => groups.includes(group) || group === "all_residents");
}

function eventsReachableFrom(world: WorldData, placeId: string, fromYear: number, toYear: number): WorldEvent[] {
  // Collect packs for every node the residence belonged to during the period (hierarchies change over time).
  const nodes = new Set<string>();
  for (let year = fromYear; year <= toYear; year += 1) {
    for (const node of ancestorsAt(world, placeId, isoDay(year, 1, 1))) nodes.add(node);
    for (const node of ancestorsAt(world, placeId, isoDay(year, 12, 31))) nodes.add(node);
  }
  const events = new Map<string, WorldEvent>();
  for (const node of nodes) for (const event of world.packs.get(node)?.events ?? []) events.set(event.id, event);
  return [...events.values()];
}

/**
 * Geographic inheritance: an event is relevant when, on the first day it overlaps her stay, one of its
 * locations is the residence or an administrative ancestor of the residence on that day. Rural Ohio never
 * inherits a New York City record, and a Gdańsk resident in 1930 inherits Free City records, not Polish ones.
 */
export function relevantEvents(
  world: WorldData,
  residences: ResidencePeriod[],
  profile: LifeProfile,
  fromYear: number,
  toYear: number
): RelevantEvent[] {
  const result = new Map<string, RelevantEvent>();
  for (const residence of residences) {
    const start = Math.max(residence.fromYear, fromYear, profile.birthYear);
    const end = Math.min(residence.toYear, toYear);
    if (start > end) continue;
    const residenceId = resolveLocationId(world, residence.placeId);
    if (!residenceId) continue;
    const stayStart = isoDay(start, 1, 1);
    const stayEnd = isoDay(end, 12, 31);
    for (const event of eventsReachableFrom(world, residenceId, start, end)) {
      const eventStart = periodStart(event.start);
      const eventEnd = periodEnd(event.end ?? event.start);
      if (eventEnd < stayStart || eventStart > stayEnd) continue;
      const probe = eventStart > stayStart ? eventStart : stayStart;
      const chain = ancestorsAt(world, residenceId, probe);
      const matched = chain.find((node) => event.locationIds.includes(node));
      if (!matched || result.has(event.id)) continue;
      const year = Number(probe.slice(0, 4));
      const age = year - profile.birthYear;
      result.set(event.id, {
        event,
        level: levelOf(world, matched) ?? event.scope,
        matchedLocationId: matched,
        residenceId,
        year,
        age,
        personalCandidate: personalCandidate(event, age, [...profile.groups, ...ageGroups(age)])
      });
    }
  }
  return [...result.values()].sort((a, b) => a.year - b.year || LEVEL_SPECIFICITY[b.level] - LEVEL_SPECIFICITY[a.level] || a.event.id.localeCompare(b.event.id));
}

export function isLocalLevel(level: GeoLevel): boolean {
  return LEVEL_SPECIFICITY[level] >= LEVEL_SPECIFICITY.regional;
}
