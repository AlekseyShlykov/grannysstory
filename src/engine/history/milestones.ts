import nationalJson from "../../../content/historical/national.json";
import { milestones } from "../../../content/historical/milestones";
import type { MilestoneDefinition } from "../../../content/historical/milestoneSchema";
import type { GameSessionState, NationalHistoricalEvent } from "../../data/types";
import type { WorldData } from "../../data/worldTypes";
import { worldData } from "../../data/worldStore";
import { lifeProfile, lifeResidences } from "../world/biographyLink";
import { eventEndYear, relevantEvents } from "../world/events";
import { occupationAt, resolveLocationId } from "../world/geography";

/**
 * An essential national milestone placed against one life. Four separate statements, never merged:
 * it happened in her lifetime; it reached the state she lived in (through her residence on that date);
 * her own place was under occupation then (registry fact); and whether she has talked about it.
 */
export interface LifeMilestone {
  definition: MilestoneDefinition;
  eventId: string;
  title: string;
  summary: string;
  year: number;
  endYear: number;
  age: number;
  sourceIds: string[];
  sensitive: boolean;
  category: string;
  /** Residence through which it reached her; the atlas shows it there. */
  placeId: string;
  placeOccupied: boolean;
  told: boolean;
}

const legacyNational = nationalJson.events as NationalHistoricalEvent[];

/**
 * Whether her place came under military occupation in the months from an event's start to the end of that
 * year (registry fact). Kalinin, occupied from October to December 1941, counts for the war's first year.
 */
export function occupiedAfter(world: WorldData, placeId: string, start: string): boolean {
  const year = Number(start.slice(0, 4));
  const fromMonth = start.length >= 7 ? Number(start.slice(5, 7)) : 1;
  for (let month = fromMonth; month <= 12; month += 1) {
    if (occupationAt(world, placeId, `${year}-${String(month).padStart(2, "0")}-15`)) return true;
  }
  return false;
}

/**
 * Milestones overlapping her life and her geography. With world packs, geography is the administrative chain
 * of each residence on the date (so a Warsaw resident of 1914 inherits the Russian Empire, a Gdańsk resident of
 * 1930 the Free City, and an emigrant changes country at the move). Without packs only the bundled v0.4
 * national layer (Russia) is available.
 */
export function lifeMilestones(state: GameSessionState, definitions: MilestoneDefinition[] = milestones, world: WorldData = worldData()): LifeMilestone[] {
  const toldIds = new Set(state.biography.lifeEvents.filter((event) => event.known).map((event) => event.id.replace(/^context:(national:|world:)?/, "")));
  const birth = state.selection.birthYear;
  const last = state.selection.conversationYear;
  const usesWorld = world.packs.size > 0 && state.biography.residenceHistory.every((residence) => resolveLocationId(world, residence.placeId));
  const result: LifeMilestone[] = [];
  if (usesWorld) {
    const profile = lifeProfile(birth, world, state.biography);
    const reached = new Map(relevantEvents(world, lifeResidences(state.biography), profile, birth, last).map((item) => [item.event.id, item]));
    for (const definition of definitions) {
      const item = definition.eventIds.map((id) => reached.get(id)).find(Boolean);
      if (!item) continue;
      result.push({
        definition,
        eventId: item.event.id,
        title: item.event.title,
        summary: item.event.summary,
        year: item.year,
        endYear: Math.max(item.year, eventEndYear(item.event)),
        age: item.year - birth,
        sourceIds: item.event.sourceIds,
        sensitive: item.event.sensitive,
        category: item.event.category,
        placeId: item.residenceId,
        placeOccupied: occupiedAfter(world, item.residenceId, item.event.start),
        told: toldIds.has(item.event.id)
      });
    }
    return result.sort((a, b) => a.year - b.year);
  }
  for (const definition of definitions.filter((candidate) => candidate.country === "RU")) {
    const event = legacyNational.find((candidate) => definition.eventIds.includes(candidate.id));
    if (!event) continue;
    const year = Number(event.startDate.slice(0, 4));
    if (year < birth || year > last) continue;
    result.push({
      definition,
      eventId: event.id,
      title: event.title,
      summary: event.historicalContext,
      year,
      endYear: Number(event.endDate.slice(0, 4)),
      age: year - birth,
      sourceIds: [event.sourceId],
      sensitive: false,
      category: "political_change",
      placeId: state.biography.residenceHistory.find((period) => year >= period.fromYear && year <= period.toYear)?.placeId ?? state.biography.residenceHistory[0]!.placeId,
      placeOccupied: false,
      told: toldIds.has(event.id)
    });
  }
  return result.sort((a, b) => a.year - b.year);
}

export const milestoneById = new Map(milestones.map((definition) => [definition.id, definition]));
export const milestoneByEventId = new Map(milestones.flatMap((definition) => definition.eventIds.map((id) => [id, definition] as const)));
