import type { WorldData } from "../../data/worldTypes";
import { contextsAt, type ContextAnswer } from "./contexts";
import { relevantEvents, type LifeProfile, type RelevantEvent, type ResidencePeriod } from "./events";
import { isoDay, resolveLocationId, sovereignAt, worldNameAt } from "./geography";

export interface EnvironmentPoint {
  year: number;
  age: number;
  residenceId: string;
  placeName: string;
  sovereignId: string | null;
  events: RelevantEvent[];
  contexts: ContextAnswer[];
}

export interface LifeSpec {
  birthYear: number;
  lastYear: number;
  residences: ResidencePeriod[];
  profile: LifeProfile;
}

export function residenceAtYear(residences: ResidencePeriod[], year: number): ResidencePeriod | null {
  return residences.find((residence) => year >= residence.fromYear && year <= residence.toYear) ?? null;
}

/**
 * The historical circumstances around a life in five-year steps: what was relevant where she lived,
 * and which everyday conditions applied. It describes possibilities, never personal experience.
 */
export function historicalEnvironment(world: WorldData, life: LifeSpec, step = 5): EnvironmentPoint[] {
  const all = relevantEvents(world, life.residences, life.profile, life.birthYear, life.lastYear);
  const points: EnvironmentPoint[] = [];
  for (let year = life.birthYear; year <= life.lastYear; year += step) {
    const endYear = Math.min(year + step - 1, life.lastYear);
    const residence = residenceAtYear(life.residences, year);
    if (!residence) continue;
    const residenceId = resolveLocationId(world, residence.placeId) ?? residence.placeId;
    points.push({
      year,
      age: year - life.birthYear,
      residenceId,
      placeName: worldNameAt(world, residenceId, isoDay(year)),
      sovereignId: sovereignAt(world, residenceId, isoDay(year)),
      events: all.filter((item) => item.year >= year && item.year <= endYear),
      contexts: contextsAt(world, residenceId, year)
    });
  }
  return points;
}
