import { occupations, retirementAge } from "../../content/scenes/occupations";
import type { Occupation, WorkKind } from "../../content/scenes/occupations";
import { worldData } from "../data/worldStore";
import type { BranchDefinition, GameSessionState, LifeEvent, StartSelection, WorkState } from "../data/types";
import { seededRandom } from "./random";
import { getLocation, resolveLocationId } from "./world/geography";

export type WorkStage = "start" | "middle" | "late";

interface PlaceFacts {
  locationId: string;
  country: string;
  settlement: "urban" | "rural";
}

function placeFacts(placeId: string): PlaceFacts {
  const world = worldData();
  const location = getLocation(world, placeId);
  // Legacy region ids (tver, moscow …) without loaded packs are Russian cities.
  const locationId = resolveLocationId(world, placeId) ?? (/^[a-z]{2}-/.test(placeId) ? placeId : `ru-${placeId}`);
  return {
    locationId,
    country: location?.country ?? "RU",
    settlement: location?.settlementClass === "rural" ? "rural" : "urban"
  };
}

interface OccupationFilter {
  kind?: WorkKind;
  trained?: boolean;
  /** Excluded when she may move away from the place the workplace is named after. */
  allowPlaceSpecific: boolean;
}

function eligible(place: PlaceFacts, year: number, filter: OccupationFilter): Occupation[] {
  const base = occupations.filter((occupation) => occupation.countries.includes(place.country)
    && occupation.settlement === place.settlement
    && year >= occupation.from && year <= occupation.to
    && (!occupation.placeIds || (filter.allowPlaceSpecific && occupation.placeIds.includes(place.locationId))));
  const narrowed = base.filter((occupation) => (filter.kind === undefined || occupation.kind === filter.kind)
    && (filter.trained === undefined || occupation.trained === filter.trained));
  return narrowed.length ? narrowed : base;
}

function pickOccupation(place: PlaceFacts, year: number, filter: OccupationFilter, random: ReturnType<typeof seededRandom>): string | undefined {
  const pool = eligible(place, year, filter);
  if (!pool.length) return undefined;
  // A workplace named in the records of her own town makes the world feel specific: prefer it half of the time.
  const local = pool.filter((occupation) => occupation.placeIds);
  const source = local.length && random.next() < 0.5 ? local : pool;
  return random.pick(source).id;
}

/**
 * Chooses canonical work from a separate random stream, so the rest of a generated life is unchanged.
 * Education and profession turning points decide which of two jobs she ends up in; other lives get one job.
 */
export function planWork(
  selection: StartSelection,
  birthPlaceId: string,
  branch: BranchDefinition,
  branchYear: number,
  destinationPlaceId: string | null
): WorkState | undefined {
  const random = seededRandom(`${selection.runSeed}:occupation`);
  const startYear = selection.birthYear + 18;
  const placeAfter = (moves: boolean | undefined) => placeFacts(moves && destinationPlaceId ? destinationPlaceId : birthPlaceId);
  if (branch.type === "profession" || branch.type === "education") {
    const filters: [OccupationFilter, OccupationFilter] = branch.type === "profession"
      ? [{ kind: "craft", allowPlaceSpecific: !branch.movesOnA }, { kind: "office", allowPlaceSpecific: !branch.movesOnB }]
      : [{ trained: true, allowPlaceSpecific: !branch.movesOnA }, { trained: false, allowPlaceSpecific: !branch.movesOnB }];
    const pathA = pickOccupation(placeAfter(branch.movesOnA), branchYear, filters[0], random);
    const pathB = pickOccupation(placeAfter(branch.movesOnB), branchYear, filters[1], random);
    return pathA && pathB ? { startYear: branchYear, byOutcome: { pathA, pathB } } : undefined;
  }
  const mayMove = Boolean(branch.movesOnA || branch.movesOnB);
  const occupationId = pickOccupation(placeFacts(birthPlaceId), startYear, { allowPlaceSpecific: !mayMove }, random);
  return occupationId ? { startYear, occupationId } : undefined;
}

/** The job that is canon so far; null while it still depends on an unresolved turning point. */
export function currentOccupation(state: GameSessionState): Occupation | null {
  const work = state.biography.work;
  if (!work) return null;
  let id = work.occupationId;
  if (work.byOutcome) {
    const branch = state.biography.branches[0];
    if (!branch?.resolved || !branch.outcome) return null;
    id = work.byOutcome[branch.outcome.id];
  }
  return occupations.find((occupation) => occupation.id === id) ?? null;
}

export function workFactId(stage: WorkStage): string {
  return `fact:work:${stage}`;
}

function told(state: GameSessionState, stage: WorkStage): boolean {
  return state.discovery.facts.some((fact) => fact.id === workFactId(stage));
}

function workCountry(state: GameSessionState): string {
  const last = state.biography.residenceHistory.at(-1)?.placeId ?? state.biography.residenceHistory[0]?.placeId ?? "tver";
  return placeFacts(last).country;
}

/** The year her working life ends: retirement, or the verified closure that came before it. */
function workEndYear(state: GameSessionState, occupation: Occupation): number {
  const retiredBy = state.selection.birthYear + retirementAge(workCountry(state));
  return occupation.closure && occupation.closure.year <= retiredBy ? occupation.closure.year : retiredBy;
}

export function workLine(state: GameSessionState, occupation: Occupation, stage: WorkStage): string {
  if (stage === "start") return occupation.start;
  if (stage === "middle") return occupation.middle;
  if (!occupation.closure) return occupation.late;
  const retiredBy = state.selection.birthYear + retirementAge(workCountry(state));
  return retiredBy < occupation.closure.year ? occupation.closure.before : occupation.closure.after;
}

/** The next untold stage of her working life that fits her age at this point, at most one per answer. */
export function nextWorkStage(state: GameSessionState, age: number, endYear: number): WorkStage | null {
  const work = state.biography.work;
  const occupation = currentOccupation(state);
  if (!work || !occupation) return null;
  if (!told(state, "start")) return endYear >= work.startYear ? "start" : null;
  if (!told(state, "middle")) return age >= 35 ? "middle" : null;
  // A closure that ended her work early is told in the interval it happened, not at pension age.
  if (!told(state, "late")) return endYear >= workEndYear(state, occupation) ? "late" : null;
  return null;
}

export function workLifeEvent(state: GameSessionState, occupation: Occupation, placeId: string): LifeEvent {
  return {
    id: "life:work",
    year: state.biography.work?.startYear ?? state.selection.birthYear + 18,
    title: `Работа: ${occupation.title}`,
    text: occupation.start,
    placeId,
    peopleIds: ["grandmother"],
    provenance: "FICTIONAL_PERSONAL",
    sourceIds: [],
    salience: "personal",
    known: true
  };
}
