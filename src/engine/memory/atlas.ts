import atlasJson from "../../../babushka_memory_atlas_5year.json";
import { atlasPatterns } from "../../../content/memory/atlasPatterns";
import type { AtlasPatternAnnotation, MemoryRequirement, MemoryVariant } from "../../../content/memory/schema";
import { branchCatalog } from "../../../content/scenes/branchCatalog";
import { placeLocative } from "../../../content/scenes/regions";
import { placeLocativeAt, placeNameAt } from "../../data/world";
import { worldData } from "../../data/worldStore";
import type {
  AtlasMemoryProperties,
  GameSessionState,
  LifeImpact,
  MemoryVividness,
  PersonalSignificance,
  ThemeId
} from "../../data/types";
import { earlyLifeThreadForState } from "../earlyLifeThread";
import { seededRandom } from "../random";
import { getLocation } from "../world/geography";
import { aliveIn, isRural, partnershipSpan, personById, siblingOf, workSpan } from "./lifeFacts";

export interface AtlasRecord {
  age_from: number;
  age_to: number;
  life_stage: string;
  item: number;
  memory_pattern_ru: string;
  emotional_frame_ru: string;
  evidence_level: string;
  source_basis: string[];
  historical_context_required: boolean;
}

/** The scenario patterns as shipped; a typology, never a frequency table. */
export const atlasRecords = (atlasJson as { records_data: AtlasRecord[] }).records_data;

export const recordKey = (record: Pick<AtlasRecord, "age_from" | "item">) => `${record.age_from}:${record.item}`;

const annotationByKey = new Map(atlasPatterns.map((annotation) => [annotation.key, annotation]));

/** Structural problems between the JSON atlas and its narrative annotations; empty when they agree. */
export function atlasIssues(records: AtlasRecord[] = atlasRecords, annotations: AtlasPatternAnnotation[] = atlasPatterns): string[] {
  const issues: string[] = [];
  const keys = new Set<string>();
  for (const record of records) {
    const key = recordKey(record);
    if (keys.has(key)) issues.push(`duplicate record ${key}`);
    keys.add(key);
    if (record.age_to !== record.age_from + 4 || record.age_from % 5 !== 0) issues.push(`unexpected band ${key}`);
    if (record.evidence_level !== "scenario_synthesis_not_measured_frequency") issues.push(`record ${key} claims measured evidence`);
    const annotation = annotations.find((candidate) => candidate.key === key);
    if (!annotation) issues.push(`no annotation for ${key}`);
    else if (!annotation.variants.length) issues.push(`no variants for ${key}`);
  }
  for (const annotation of annotations) if (!keys.has(annotation.key)) issues.push(`annotation without record ${annotation.key}`);
  return issues;
}

export interface BandWindow {
  ageFrom: number;
  fromYear: number;
  toYear: number;
}

export function bandWindow(state: GameSessionState, ageFrom: number): BandWindow {
  const fromYear = state.selection.birthYear + ageFrom;
  return { ageFrom, fromYear, toYear: Math.min(fromYear + 4, state.selection.conversationYear) };
}

function countryAt(state: GameSessionState, year: number): string {
  const residence = state.biography.residenceHistory.find((period) => year >= period.fromYear && year <= period.toYear) ?? state.biography.residenceHistory[0];
  return getLocation(worldData(), residence?.placeId ?? "")?.country ?? "RU";
}

/**
 * Schooling was not universal everywhere she could be born: villages of the Russian Empire before universal
 * primary education (1930) and of partitioned Poland before the 1919 decree did not guarantee it. Cities did
 * not guarantee it either, but a first school day there is plausible enough to be told.
 */
function attendedSchool(state: GameSessionState): boolean {
  const schoolYear = state.selection.birthYear + 7;
  const country = countryAt(state, schoolYear);
  if (!isRural(state)) return true;
  if (country === "RU") return schoolYear >= 1930;
  if (country === "PL") return schoolYear >= 1919;
  return true;
}

function branchCanMove(type: string): boolean {
  const definition = branchCatalog.find((candidate) => candidate.type === type);
  return Boolean(definition?.movesOnA || definition?.movesOnB);
}

function movedBetween(state: GameSessionState, fromYear: number, toYear: number): boolean {
  return state.biography.residenceHistory.slice(1).some((period) => period.fromYear >= fromYear && period.fromYear <= toYear);
}

/** Whether one canonical requirement holds for a band of her life. Unknown canon never counts as true. */
export function requirementHolds(state: GameSessionState, requirement: MemoryRequirement, band: BandWindow): boolean {
  const { fromYear, toYear } = band;
  const mother = personById(state, "grandmother_mother");
  const father = personById(state, "grandmother_father");
  const parents = [mother, father].filter((person): person is NonNullable<typeof person> => Boolean(person));
  const sibling = siblingOf(state);
  const child = state.biography.relationship.hasOwnChildren ? personById(state, "parent") : undefined;
  const partnership = partnershipSpan(state);
  const known = partnership !== "undetermined";
  const work = workSpan(state);
  const branch = state.biography.branches[0];
  if (requirement.startsWith("outcome:")) {
    const [, type, path] = requirement.split(":");
    return Boolean(branch?.type === type && branch.resolved && branch.outcome?.id === path && branch.year <= toYear);
  }
  if (requirement.startsWith("branch:")) return Boolean(branch?.type === requirement.slice(7) && branch.resolved && branch.year <= toYear);
  switch (requirement) {
    case "attended_school": return attendedSchool(state);
    case "has_sibling": return Boolean(sibling && sibling.birthYear <= toYear && aliveIn(sibling, fromYear));
    case "younger_sibling_born_in_band": return Boolean(sibling && sibling.birthYear > state.selection.birthYear && sibling.birthYear >= fromYear && sibling.birthYear <= toYear);
    case "mother_alive": return aliveIn(mother, toYear);
    case "father_alive": return aliveIn(father, toYear);
    case "parent_alive": return parents.some((person) => aliveIn(person, toYear));
    case "parent_dies_in_band": return parents.some((person) => person.deathYear !== null && person.deathYear !== undefined && person.deathYear >= fromYear && person.deathYear <= toYear);
    case "parent_elderly_alive": return parents.some((person) => aliveIn(person, toYear) && fromYear - person.birthYear >= 65);
    case "both_parents_dead_by_band": return parents.length > 0 && parents.every((person) => person.deathYear !== null && person.deathYear !== undefined && person.deathYear < fromYear);
    case "moved_in_band": return movedBetween(state, fromYear, toYear);
    case "moved_before_band_end": return movedBetween(state, state.selection.birthYear, toYear);
    // A claim about the whole life: false while a turning point that could still move her is open.
    case "never_moved": return state.biography.residenceHistory.length === 1 && !(branch && !branch.resolved && branchCanMove(branch.type));
    case "working_in_band": return Boolean(work && work.start <= toYear && work.end >= fromYear);
    case "work_starts_in_band": return Boolean(work && work.start >= fromYear && work.start <= toYear);
    case "retires_in_band": return Boolean(work && work.end >= fromYear && work.end <= toYear);
    case "retired_before_band": return Boolean(work && work.end < fromYear);
    case "own_children": return Boolean(child && child.birthYear <= toYear);
    case "adopted_child": return state.biography.relationship.childrenStatus === "adoptive_parent" && Boolean(child && child.birthYear <= toYear);
    case "child_born_in_band": return Boolean(child && state.biography.relationship.childrenStatus === "biological_parent" && child.birthYear >= fromYear && child.birthYear <= toYear);
    case "no_own_children": return !state.biography.relationship.hasOwnChildren;
    case "younger_relatives_in_band": return Boolean(personById(state, "parent") && personById(state, "parent")!.birthYear <= toYear);
    case "player_born_by_band": return Boolean(personById(state, "player") && personById(state, "player")!.birthYear <= toYear);
    case "partner_in_band": return known && partnership !== null && partnership.start <= toYear && (!partnership.end || partnership.end.year >= fromYear);
    case "partner_died_in_band": return known && partnership?.end?.kind === "death" && partnership.end.year >= fromYear && partnership.end.year <= toYear;
    case "partner_separated_in_band": return known && partnership?.end?.kind === "separation" && partnership.end.year >= fromYear && partnership.end.year <= toYear;
    case "partner_died_before_band": return known && partnership?.end?.kind === "death" && partnership.end.year < fromYear;
    case "no_partner_in_band": return known && (partnership === null || partnership.start > toYear || Boolean(partnership.end && partnership.end.year < fromYear));
    case "ever_partnered_by_band": return known && partnership !== null && partnership.start <= toYear;
    case "urban": return !isRural(state);
    case "rural": return isRural(state);
    default: return false;
  }
}

export function eligibleVariant(state: GameSessionState, annotation: AtlasPatternAnnotation, band: BandWindow): MemoryVariant | null {
  return annotation.variants.find((variant) => variant.when.every((requirement) => requirementHolds(state, requirement, band))) ?? null;
}

const IMPACTS: LifeImpact[] = ["slight", "notable", "reshaping", "defining"];
const SIGNIFICANCES: PersonalSignificance[] = ["passing", "kept", "treasured", "central"];
const VIVIDNESS: MemoryVividness[] = ["reconstructed", "faint", "clear", "vivid"];

function relatedPeople(state: GameSessionState, annotation: AtlasPatternAnnotation, band: BandWindow): string[] {
  const ids = new Set<string>();
  const parents = ["grandmother_mother", "grandmother_father"].map((id) => personById(state, id)).filter((person): person is NonNullable<typeof person> => Boolean(person));
  for (const role of annotation.people) {
    if (role === "mother" && parents[0]) ids.add(parents[0].id);
    if (role === "father" && parents[1]) ids.add(parents[1].id);
    if (role === "parent_any") {
      const lost = parents.find((person) => person.deathYear !== null && person.deathYear !== undefined && person.deathYear >= band.fromYear && person.deathYear <= band.toYear);
      const living = parents.find((person) => aliveIn(person, band.toYear));
      if (lost ?? living) ids.add((lost ?? living)!.id);
    }
    if (role === "sibling" && siblingOf(state)) ids.add(siblingOf(state)!.id);
    if (role === "partner") ids.add("partner");
    if (role === "child" && state.biography.relationship.hasOwnChildren) ids.add("parent");
    if (role === "younger_relatives") ids.add(personById(state, "player") && personById(state, "player")!.birthYear <= band.toYear ? "player" : "parent");
    if (role === "friend") ids.add("friend");
  }
  return [...ids];
}

function fill(text: string, state: GameSessionState, band: BandWindow): string {
  const sibling = siblingOf(state);
  const parents = ["grandmother_mother", "grandmother_father"].map((id) => personById(state, id)).filter((person): person is NonNullable<typeof person> => Boolean(person));
  const lost = parents.find((person) => person.deathYear !== null && person.deathYear !== undefined && person.deathYear >= band.fromYear && person.deathYear <= band.toYear)
    ?? parents.find((person) => aliveIn(person, band.toYear))
    ?? parents[0];
  const child = personById(state, "parent");
  const residence = state.biography.residenceHistory.find((period) => band.fromYear >= period.fromYear && band.fromYear <= period.toYear) ?? state.biography.residenceHistory[0]!;
  const place = placeLocativeAt(residence.placeId, band.fromYear) ?? placeLocative(placeNameAt(residence.placeId, band.fromYear));
  const female = (person: { sex?: string } | undefined) => person?.sex === "female";
  return text
    .replaceAll("{place}", place)
    .replaceAll("{siblingAcc}", female(sibling) ? "сестру" : "брата")
    .replaceAll("{sibling}", female(sibling) ? "сестра" : "брат")
    .replaceAll("{lostParentGen}", female(lost) ? "мамы" : "папы")
    .replaceAll("{lostParent}", female(lost) ? "мама" : "папа")
    .replaceAll("{childAcc}", female(child) ? "дочь" : "сына")
    .replaceAll("{child}", female(child) ? "дочь" : "сын");
}

export interface AtlasMemory {
  record: AtlasRecord;
  annotation: AtlasPatternAnnotation;
  scene: string;
  feeling: string;
  now: string;
  properties: AtlasMemoryProperties;
  themes: ThemeId[];
}

function realise(state: GameSessionState, record: AtlasRecord, annotation: AtlasPatternAnnotation, variant: MemoryVariant, band: BandWindow): AtlasMemory {
  const random = seededRandom(`${state.selection.runSeed}:atlas-memory:${recordKey(record)}`);
  const branchRequirement = variant.when.find((requirement) => requirement.startsWith("outcome:") || requirement.startsWith("branch:"));
  const relatedChoices = branchRequirement ? [state.biography.branches[0]!.id] : [];
  const thread = earlyLifeThreadForState(state);
  const bump = band.ageFrom >= 10 && band.ageFrom < 30 ? 1 : 0;
  const affinity = annotation.themes.some((theme) => thread?.themes.includes(theme) || state.biography.themes.includes(theme)) ? 1 : 0;
  // Significance is drawn apart from impact: an ordinary afternoon can matter more to her than a turning point.
  const significance = Math.min(3, random.int(0, 2) + bump + affinity);
  const impact = Math.min(3, annotation.impact + (relatedChoices.length ? 1 : 0));
  const vividness = band.ageFrom < 5 ? 0 : Math.max(1, Math.min(3, significance + random.int(-1, 1)));
  const now = fill(variant.now, state, band);
  return {
    record,
    annotation,
    scene: fill(variant.scene, state, band),
    feeling: fill(variant.feeling, state, band),
    now,
    themes: annotation.themes,
    properties: {
      patternKey: recordKey(record),
      ageFrom: band.ageFrom,
      lifeImpact: IMPACTS[impact]!,
      personalSignificance: SIGNIFICANCES[significance]!,
      memoryVividness: VIVIDNESS[vividness]!,
      emotionalTone: record.emotional_frame_ru.split(/\s+(?:и|или)\s+/).map((tone) => tone.trim()).filter(Boolean),
      currentInterpretation: now,
      relatedPeople: relatedPeople(state, annotation, band),
      relatedChoices
    }
  };
}

/**
 * Atlas memories she carries from the band starting at `ageFrom`, most personally significant first. The
 * plan decides how many (often none); canon decides which: a pattern is offered only when its people,
 * places and choices exist at that age. Lives without a plan (older saves) get none.
 */
export function atlasMemoriesForBand(state: GameSessionState, ageFrom: number): AtlasMemory[] {
  const slots = state.biography.canon?.memoryPlan.find((slot) => slot.ageFrom === ageFrom)?.slots ?? 0;
  if (!slots) return [];
  const band = bandWindow(state, ageFrom);
  const told = new Set(state.memories.map((memory) => memory.atlas?.patternKey).filter(Boolean));
  const random = seededRandom(`${state.selection.runSeed}:atlas-band:${ageFrom}`);
  const candidates = atlasRecords
    .filter((record) => record.age_from === ageFrom && !told.has(recordKey(record)))
    .map((record) => ({ record, annotation: annotationByKey.get(recordKey(record)), order: random.next() }))
    .filter((candidate): candidate is typeof candidate & { annotation: AtlasPatternAnnotation } => Boolean(candidate.annotation))
    .map((candidate) => ({ ...candidate, variant: eligibleVariant(state, candidate.annotation, band) }))
    .filter((candidate): candidate is typeof candidate & { variant: MemoryVariant } => Boolean(candidate.variant))
    // A pattern that echoes her own turning point is preferred; otherwise the seeded order keeps lives distinct.
    .sort((a, b) => Number(b.variant.when.some((requirement) => requirement.startsWith("outcome:"))) - Number(a.variant.when.some((requirement) => requirement.startsWith("outcome:"))) || a.order - b.order);
  return candidates.slice(0, slots)
    .map((candidate) => realise(state, candidate.record, candidate.annotation, candidate.variant, band))
    .sort((a, b) => SIGNIFICANCES.indexOf(b.properties.personalSignificance) - SIGNIFICANCES.indexOf(a.properties.personalSignificance));
}

const reconstructedHedges = [
  "Сама я этого помнить не могу, знаю по рассказам.",
  "Это я знаю больше со слов взрослых, чем помню.",
  "Помнить это по-настоящему я не могла, но в семье так рассказывали."
];

/** Her words for one atlas memory, shaped by the question asked and by how clearly she remembers it. */
export function atlasMemorySpeech(memory: AtlasMemory, angle: "detail" | "feeling" | "meaning", runSeed: string): string {
  const vividness = memory.properties.memoryVividness;
  const body = angle === "detail" ? `${memory.scene} ${memory.feeling}`
    : angle === "feeling" ? `${memory.feeling} ${memory.scene}`
    : `${memory.scene} ${memory.now}`;
  if (vividness === "reconstructed") {
    const hedge = reconstructedHedges[seededRandom(`${runSeed}:hedge:${memory.properties.patternKey}`).int(0, reconstructedHedges.length - 1)]!;
    return `${hedge} ${body}`;
  }
  // Only distant years blur this way; a faint recent memory is simply told more briefly.
  if (vividness === "faint" && memory.properties.ageFrom < 60) return `${body} Хотя помню это смутно, может, что-то и досочинила.`;
  if (vividness === "faint") return angle === "meaning" ? `${memory.scene} ${memory.now}` : memory.scene;
  return body;
}
