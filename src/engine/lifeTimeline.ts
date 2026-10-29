import nationalJson from "../../content/historical/national.json";
import { historicalSignificance, MIN_FALLBACK_SIGNIFICANCE } from "../../content/historical/significance";
import { lifeCourseFragments, questionForms } from "../../content/scenes/lifeCourse";
import type { LifeCourseFragment, LifePhase, ReflectionAngle } from "../../content/scenes/lifeCourse";
import type { GameSessionState, LifeEvent, NationalHistoricalEvent, StartSelection } from "../data/types";
import { hasWorldPacks, worldData } from "../data/worldStore";
import { seededRandom } from "./random";
import { earlyBeatForState, threadAffinity } from "./earlyLifeThread";
import { lifeProfile, lifeResidences } from "./world/biographyLink";
import { eventEndYear, isLocalLevel, relevantEvents } from "./world/events";
import { resolveLocationId } from "./world/geography";

export interface LifeTimelinePoint {
  year: number;
  endYear: number;
  age: number;
  final: boolean;
}

export interface TimelineBackground {
  id: string;
  title: string;
  year: number;
  text: string;
  sourceIds: string[];
  placeId: string;
  existingLifeEventId?: string;
  /** Geographic level through which a world-dataset event reached her residence. */
  level?: string;
}

interface BackgroundCandidate {
  key: string;
  startYear: number;
  endYear: number;
  tier: number;
  significance: number;
  background: TimelineBackground;
}

const nationalEvents = nationalJson.events as NationalHistoricalEvent[];
const angles: ReflectionAngle[] = ["detail", "feeling", "meaning"];

export function lifeTimelinePoints(selection: StartSelection): LifeTimelinePoint[] {
  const years: number[] = [];
  for (let year = selection.birthYear; year <= selection.conversationYear; year += 5) years.push(year);
  if (years.at(-1) !== selection.conversationYear) years.push(selection.conversationYear);
  return years.map((year, index) => ({
    year,
    endYear: Math.min((years[index + 1] ?? selection.conversationYear + 1) - 1, selection.conversationYear),
    age: year - selection.birthYear,
    final: year === selection.conversationYear
  }));
}

export function phaseAtAge(age: number): LifePhase {
  if (age < 10) return "early";
  if (age < 18) return "school";
  if (age < 30) return "youth";
  if (age < 45) return "adult";
  if (age < 60) return "midlife";
  if (age < 75) return "later";
  return "oldAge";
}

export function fragmentForPoint(state: GameSessionState, point: LifeTimelinePoint): LifeCourseFragment {
  const earlyBeat = earlyBeatForState(state, point.age);
  if (earlyBeat) return earlyBeat;
  const phase = phaseAtAge(point.age);
  const pool = lifeCourseFragments[phase];
  const phasePoints = lifeTimelinePoints(state.selection).filter((candidate) => phaseAtAge(candidate.age) === phase);
  const phaseIndex = phasePoints.findIndex((candidate) => candidate.year === point.year);
  const cycle = Math.floor(Math.max(phaseIndex, 0) / pool.length);
  const random = seededRandom(`${state.selection.runSeed}:life-course:${phase}:${cycle}`);
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = random.int(0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex]!, shuffled[index]!];
  }
  // The branch themes and the selected childhood thread bias later memories toward a recognisable life,
  // while the seeded shuffle still preserves variation among equally compatible fragments.
  shuffled.sort((first, second) => threadAffinity(second, state) - threadAffinity(first, state));
  return shuffled[Math.max(phaseIndex, 0) % shuffled.length]!;
}

export function questionsForPoint(state: GameSessionState, point: LifeTimelinePoint): { id: ReflectionAngle; text: string }[] {
  if (point.age === 0) {
    return [
      { id: "detail", text: "Где и когда ты родилась?" },
      { id: "feeling", text: "Ты помнишь, где ты родилась?" },
      { id: "meaning", text: "Откуда ты родом, бабушка?" }
    ];
  }
  const pointIndex = lifeTimelinePoints(state.selection).findIndex((candidate) => candidate.year === point.year);
  const lead = point.final
    ? `Сейчас ${point.year} год, тебе ${point.age} лет.`
    : `В ${point.year} году тебе было ${point.age} лет.`;
  return angles.map((angle, angleIndex) => {
    const forms = questionForms[angle];
    const form = forms[(pointIndex + angleIndex * 3) % forms.length]!;
    return { id: angle, text: `${lead} ${form}` };
  });
}

function residenceAt(state: GameSessionState, year: number): string {
  return state.biography.residenceHistory.find((residence) => year >= residence.fromYear && year <= residence.toYear)?.placeId
    ?? state.biography.residenceHistory.at(-1)?.placeId
    ?? state.biography.residenceHistory[0]?.placeId
    ?? "tver";
}

function overlaps(startYear: number, endYear: number, point: LifeTimelinePoint): boolean {
  return startYear <= point.endYear && endYear >= point.year;
}

function legacyNationalCandidates(): BackgroundCandidate[] {
  return nationalEvents.map((event) => {
    const startYear = Number(event.startDate.slice(0, 4));
    const endYear = Number(event.endDate.slice(0, 4));
    return {
      key: `context:national:${event.id}`,
      startYear,
      endYear,
      tier: 1,
      significance: historicalSignificance(event.id, event.title),
      background: { id: `context:national:${event.id}`, title: event.title, year: startYear, text: event.historicalContext, sourceIds: [event.sourceId], placeId: "" }
    };
  });
}

/**
 * Verified events inherited through the residence hierarchy at each date (city → region → country).
 * Returns null when no world packs are loaded, so the bundled v0.4 national layer is used instead.
 */
function worldCandidates(state: GameSessionState): BackgroundCandidate[] | null {
  if (!hasWorldPacks()) return null;
  const world = worldData();
  if (!state.biography.residenceHistory.every((residence) => resolveLocationId(world, residence.placeId))) return null;
  const reserved = new Set(state.biography.branches.map((branch) => branch.historicalAnchor?.id).filter(Boolean));
  const ownLifeEvents = new Set(state.biography.lifeEvents.map((event) => event.id));
  const profile = lifeProfile(state.selection.birthYear, world, state.biography);
  const candidates = relevantEvents(world, lifeResidences(state.biography), profile, state.selection.birthYear, state.selection.conversationYear)
    // Sensitive records stay out of the voiced conversation until an editor has reviewed them.
    .filter((item) => (!item.event.sensitive || item.event.legacy) && !reserved.has(item.event.id) && !ownLifeEvents.has(`context:${item.event.id}`))
    .map((item) => {
      const key = item.event.legacy && item.level === "national" ? `context:national:${item.event.id}` : `context:world:${item.event.id}`;
      return {
        key,
        startYear: item.year,
        endYear: Math.max(item.year, eventEndYear(item.event)),
        // Regional and narrower records form the local layer; country and international records form the global layer.
        tier: isLocalLevel(item.level) ? 1 : item.level === "international" ? 3 : 2,
        significance: historicalSignificance(item.event.id, item.event.title, item.event.category),
        background: { id: key, title: item.event.title, year: item.year, text: item.event.summary, sourceIds: item.event.sourceIds, placeId: "", level: item.level }
      };
    });
  return candidates.length ? candidates : null;
}

export function timelineBackgrounds(state: GameSessionState): Map<number, TimelineBackground> {
  const points = lifeTimelinePoints(state.selection).filter((point) => !point.final);
  const existing: BackgroundCandidate[] = state.biography.lifeEvents
    .filter((event) => event.provenance === "VERIFIED_HISTORICAL" && event.id.startsWith("context:") && !event.id.startsWith("context:national:") && !event.id.startsWith("context:world:"))
    .map((event) => ({
      key: event.id,
      startYear: event.year,
      endYear: event.year,
      tier: 0,
      significance: Number.POSITIVE_INFINITY,
      background: {
        id: event.id,
        title: event.title,
        year: event.year,
        text: event.text.split(" В этой биографии")[0] ?? event.text,
        sourceIds: event.sourceIds,
        placeId: event.placeId,
        existingLifeEventId: event.id
      } satisfies TimelineBackground
    }));
  const pool = worldCandidates(state) ?? legacyNationalCandidates();
  const candidates = [...existing, ...pool].sort((a, b) => a.startYear - b.startYear || a.tier - b.tier || a.key.localeCompare(b.key));
  const used = new Set<string>();
  // Records already told keep their place: if the pool shifts (a move, a dataset update), they are not repeated later.
  const alreadyTold = new Map(state.biography.lifeEvents.filter((event) => event.known && event.provenance === "VERIFIED_HISTORICAL").map((event) => [event.id, event.year]));
  const result = new Map<number, TimelineBackground>();
  const localFirst = seededRandom(`${state.selection.runSeed}:historical-scope-order`).int(0, 1) === 0;
  for (const [pointIndex, point] of points.entries()) {
    const matches = candidates.filter((candidate) => !used.has(candidate.key)
      && candidate.significance >= MIN_FALLBACK_SIGNIFICANCE
      && !((alreadyTold.get(candidate.key) ?? Infinity) < point.year)
      // A long period (a city name, a construction) is mentioned when it begins, not as news decades later.
      && (candidate.startYear >= point.year - 4 || pointIndex === 0)
      && overlaps(candidate.startYear, candidate.endYear, point));
    const random = seededRandom(`${state.selection.runSeed}:historical-pool:${point.year}`);
    // The most significant event of those years wins; local and global scope only alternate between equals.
    // Secondary records only fill otherwise empty years; years with only acts or paperwork stay without an aside.
    const wantsLocal = pointIndex % 2 === (localFirst ? 0 : 1);
    const best = Math.max(...matches.map((candidate) => candidate.significance));
    const top = matches.filter((candidate) => candidate.significance === best);
    const preferred = top.filter((candidate) => candidate.tier === 0 || (candidate.tier === 1) === wantsLocal);
    const selectionPool = preferred.length ? preferred : top;
    const selected = selectionPool.length ? selectionPool[random.int(0, selectionPool.length - 1)] : undefined;
    if (!selected) continue;
    used.add(selected.key);
    result.set(point.year, {
      ...selected.background,
      year: Math.max(point.year, selected.startYear),
      placeId: selected.background.placeId || residenceAt(state, point.year)
    });
  }
  return result;
}

export function personalAnswer(fragment: LifeCourseFragment, angle: ReflectionAngle): string {
  if (angle === "detail") return `${fragment.detail} ${fragment.feeling}`;
  if (angle === "feeling") return `${fragment.feeling} ${fragment.detail}`;
  return `${fragment.meaning} ${fragment.detail}`;
}

export function backgroundAsLifeEvent(background: TimelineBackground): LifeEvent {
  return {
    id: background.id,
    year: background.year,
    title: background.title,
    text: `${background.text} Это проверенный исторический фон, а не утверждение о её личном опыте.`,
    placeId: background.placeId,
    peopleIds: [],
    provenance: "VERIFIED_HISTORICAL",
    sourceIds: background.sourceIds,
    salience: "historical",
    known: true
  };
}
