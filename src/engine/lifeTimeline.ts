import nationalJson from "../../content/historical/national.json";
import { historicalSignificance, isPaperwork, MIN_SPOKEN_SIGNIFICANCE } from "../../content/historical/significance";
import { spokenFactSentence } from "../../content/scenes/historicalNarration";
import { historicalVoice } from "../../content/scenes/historicalVoice";
import { lifeCourseFragments, questionForms } from "../../content/scenes/lifeCourse";
import type { LifeCourseFragment, LifePhase, ReflectionAngle } from "../../content/scenes/lifeCourse";
import type { GameSessionState, LifeEvent, NationalHistoricalEvent, StartSelection, ThemeId } from "../data/types";
import { hasWorldPacks, worldData } from "../data/worldStore";
import { seededRandom } from "./random";
import { earlyBeatForState, threadAffinity } from "./earlyLifeThread";
import { lifeProfile, lifeResidences } from "./world/biographyLink";
import { eventEndYear, isLocalLevel, relevantEvents } from "./world/events";
import { resolveLocationId } from "./world/geography";
import { milestoneByEventId, milestoneById } from "./history/milestones";

export interface LifeTimelinePoint {
  year: number;
  endYear: number;
  age: number;
  final: boolean;
}

/** Which share of the spoken historical items a background counts toward. */
export type HistoryScope = "national" | "local" | "personal";

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
  /**
   * national: country-level (and constituent/international) records; local: regional and narrower ones;
   * personal: a regional-pack event this biography places her in (blockade, occupation of her city), which is
   * part of her own life and outside the 90/10 share.
   */
  scope: HistoryScope;
  category?: string;
  milestoneId?: string;
  /** A second item in the same years: a milestone beside a personal event, or a second war-class milestone. */
  companion?: TimelineBackground;
}

interface BackgroundCandidate {
  key: string;
  startYear: number;
  endYear: number;
  significance: number;
  speakable: boolean;
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
    const id = `context:national:${event.id}`;
    return {
      key: id,
      startYear,
      endYear,
      significance: historicalSignificance(event.id, event.title),
      speakable: Boolean(historicalVoice[event.id] || spokenFactSentence(event.historicalContext)),
      background: { id, title: event.title, year: startYear, text: event.historicalContext, sourceIds: [event.sourceId], placeId: "", scope: "national", milestoneId: milestoneByEventId.get(event.id)?.id }
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
    .map((item) => ({ item, milestone: milestoneByEventId.get(item.event.id) }))
    // Sensitive records are spoken only through a milestone's hand-written lines, never from their summary.
    .filter(({ item, milestone }) => (!item.event.sensitive || item.event.legacy || milestone) && !reserved.has(item.event.id) && !ownLifeEvents.has(`context:${item.event.id}`))
    .map(({ item, milestone }) => {
      const key = item.event.legacy && item.level === "national" ? `context:national:${item.event.id}` : `context:world:${item.event.id}`;
      return {
        key,
        startYear: item.year,
        endYear: Math.max(item.year, eventEndYear(item.event)),
        significance: historicalSignificance(item.event.id, item.event.title, item.event.category),
        speakable: Boolean(milestone || historicalVoice[item.event.id] || spokenFactSentence(item.event.summary)),
        background: {
          id: key,
          title: item.event.title,
          year: item.year,
          text: item.event.summary,
          sourceIds: item.event.sourceIds,
          placeId: "",
          level: item.level,
          // Constituent (England) and international records reach her as country-level history.
          scope: isLocalLevel(item.level) ? "local" as const : "national" as const,
          category: item.event.category,
          milestoneId: milestone?.id
        }
      };
    });
  return candidates.length ? candidates : null;
}

/** Target share of local items among spoken historical context; personal events are outside it. */
export const LOCAL_SHARE = 0.1;

/**
 * The first interval between 80 and 90 holds the late-life reflection, so it carries no historical aside.
 * Lives without the life canon (older saves) keep their earlier conversation shape.
 */
export function reflectionPointYear(state: GameSessionState): number | null {
  if (!state.biography.canon) return null;
  return lifeTimelinePoints(state.selection).find((point) => !point.final && point.age >= 80 && point.age <= 90)?.year ?? null;
}

/** World categories that can illuminate what a life is about at a given age; history follows the person. */
const themeCategories: Partial<Record<ThemeId, string[]>> = {
  workAndVocation: ["labor", "local_economy", "economic_crisis", "technology"],
  moneyAndSecurity: ["economic_crisis", "consumer_life", "local_economy", "social_policy"],
  familyAndResponsibility: ["social_policy", "housing_urban", "healthcare", "public_health"],
  freedomAndIndependence: ["political_change", "migration", "infrastructure_transport", "women_rights"],
  loveAndIntimacy: ["culture_leisure", "everyday_life", "housing_urban"],
  friendshipAndLoneliness: ["culture_leisure", "sport", "media_communication"],
  timeAndMissedOpportunities: ["education", "migration", "infrastructure_transport"],
  healthAgingAndIndependence: ["healthcare", "public_health", "social_policy"],
  hardshipAndVulnerability: ["disaster", "economic_crisis", "public_health"],
  smallJoysAndGratitude: ["consumer_life", "media_communication", "culture_leisure", "everyday_life"],
  meaningAndLegacy: ["political_change", "technology"]
};

const phaseCategories: Record<LifePhase, string[]> = {
  early: [],
  school: ["education", "media_communication"],
  youth: ["education", "labor", "migration", "culture_leisure"],
  adult: ["labor", "housing_urban", "consumer_life"],
  midlife: ["labor", "economic_crisis", "consumer_life"],
  later: ["social_policy", "healthcare", "technology"],
  oldAge: ["healthcare", "social_policy", "technology", "media_communication"]
};

function relevantCategories(state: GameSessionState, age: number): Set<string> {
  return new Set([...state.biography.themes.flatMap((theme) => themeCategories[theme] ?? []), ...phaseCategories[phaseAtAge(age)]]);
}

/**
 * History she brings up herself, at most one item per five years. Milestones come first; otherwise an item
 * is spoken only when it is of the gravest kind (significance ≥ 5), touches what her life is about at that age,
 * or happened in her own place.
 * Scope is allocated per life: ⌊LOCAL_SHARE × spoken items + seeded dither⌋ intervals with a local record
 * speak locally, the rest nationally, so across many conversations about nine in ten historical items are
 * national. A regional-pack event she lived through is personal, outside the share, and always told. Records
 * she cannot say in a sentence are never spoken.
 */
export function timelineBackgrounds(state: GameSessionState): Map<number, TimelineBackground> {
  const reflectionYear = reflectionPointYear(state);
  const points = lifeTimelinePoints(state.selection).filter((point) => !point.final && point.year !== reflectionYear);
  const existing: BackgroundCandidate[] = state.biography.lifeEvents
    .filter((event) => event.provenance === "VERIFIED_HISTORICAL" && event.id.startsWith("context:") && !event.id.startsWith("context:national:") && !event.id.startsWith("context:world:"))
    .map((event) => ({
      key: event.id,
      startYear: event.year,
      endYear: event.year,
      significance: Number.POSITIVE_INFINITY,
      speakable: true,
      background: {
        id: event.id,
        title: event.title,
        year: event.year,
        text: event.text.split(" В этой биографии")[0] ?? event.text,
        sourceIds: event.sourceIds,
        placeId: event.placeId,
        existingLifeEventId: event.id,
        scope: event.peopleIds.includes("grandmother") ? "personal" as const : "local" as const
      } satisfies TimelineBackground
    }));
  const pool = worldCandidates(state) ?? legacyNationalCandidates();
  const candidates = [...existing, ...pool]
    .filter((candidate) => candidate.speakable)
    .sort((a, b) => a.startYear - b.startYear || a.key.localeCompare(b.key));
  // Records already told keep their place: if the pool shifts (a move, a dataset update), they are not repeated later.
  const alreadyTold = new Map(state.biography.lifeEvents.filter((event) => event.known && event.provenance === "VERIFIED_HISTORICAL").map((event) => [event.id, event.year]));
  const claimed = new Set<string>();
  // First pass: what each interval could say. A record belongs to the first interval it fits.
  const options = points.map((point, pointIndex) => {
    const random = seededRandom(`${state.selection.runSeed}:historical-pool:${point.year}`);
    const categories = relevantCategories(state, point.age);
    const matches = candidates.filter((candidate) => !claimed.has(candidate.key)
      && !((alreadyTold.get(candidate.key) ?? Infinity) < point.year)
      // A long period (a city name, a construction) is mentioned when it begins, not as news decades later.
      && (candidate.startYear >= point.year - 4 || pointIndex === 0)
      && overlaps(candidate.startYear, candidate.endYear, point)
      && (candidate.background.scope === "personal"
        || Boolean(candidate.background.milestoneId)
        || candidate.significance >= 5
        // Her own place: a tram line or a new library is relevant by being hers; the quota keeps it rare.
        || (candidate.background.scope === "local" && candidate.significance >= 1 && !isPaperwork(candidate.background.title))
        || (candidate.significance >= MIN_SPOKEN_SIGNIFICANCE && (!candidate.background.category || categories.has(candidate.background.category)))));
    for (const candidate of matches) claimed.add(candidate.key);
    const best = (list: BackgroundCandidate[]) => {
      if (!list.length) return undefined;
      const top = Math.max(...list.map((candidate) => candidate.significance));
      const tied = list.filter((candidate) => candidate.significance === top);
      return tied[random.int(0, tied.length - 1)];
    };
    const isUrgent = (candidate: BackgroundCandidate) => URGENT_KINDS.has(milestoneById.get(candidate.background.milestoneId ?? "")?.kind ?? "");
    const milestones = matches.filter((candidate) => candidate.background.milestoneId);
    // Two war-class milestones in one interval (occupation, then liberation) are told in order, not one of them.
    const urgentPair = milestones.filter(isUrgent).sort((a, b) => a.startYear - b.startYear).slice(0, 2);
    const milestone = urgentPair[0] ?? best(milestones);
    return {
      second: urgentPair[1],
      point,
      personal: matches.find((candidate) => candidate.background.scope === "personal"),
      milestone,
      urgent: Boolean(milestone && URGENT_KINDS.has(milestoneById.get(milestone.background.milestoneId!)?.kind ?? "")),
      national: best(matches.filter((candidate) => candidate.background.scope === "national" && !candidate.background.milestoneId)),
      local: best(matches.filter((candidate) => candidate.background.scope === "local"))
    };
  });
  // Second pass: which intervals speak. After an aside the next interval breathes, unless a war, a revolution,
  // an occupation or her own experience falls there; history must not crowd out her life.
  const speaks: boolean[] = [];
  options.forEach((option, index) => {
    const any = Boolean(option.personal || option.milestone || option.national || option.local);
    speaks.push(any && (Boolean(option.personal) || option.urgent || !speaks[index - 1]));
  });
  // Third pass: scope. Among speaking intervals without a milestone or personal event, a seeded choice of
  // ⌊LOCAL_SHARE × spoken items + dither⌋ intervals that have a local record speak locally; the rest nationally.
  const random = seededRandom(`${state.selection.runSeed}:historical-scope-quota`);
  const dither = random.next();
  const spokenCount = speaks.filter(Boolean).length;
  const localSlots = Math.floor(LOCAL_SHARE * spokenCount + dither);
  const localEligible = options.map((option, index) => index).filter((index) => speaks[index] && !options[index]!.milestone && !options[index]!.personal && options[index]!.local);
  for (let index = localEligible.length - 1; index > 0; index -= 1) {
    const swap = random.int(0, index);
    [localEligible[index], localEligible[swap]] = [localEligible[swap]!, localEligible[index]!];
  }
  const localPoints = new Set(localEligible.slice(0, localSlots));
  const result = new Map<number, TimelineBackground>();
  options.forEach((option, index) => {
    if (!speaks[index]) return;
    const { point, personal, milestone } = option;
    const selected = milestone ?? (localPoints.has(index) ? option.local : option.national);
    const primary = personal ?? selected;
    if (!primary) return;
    const companion = personal && milestone ? milestone : !personal ? option.second : undefined;
    const place = (candidate: BackgroundCandidate) => ({
      ...candidate.background,
      year: Math.max(point.year, candidate.startYear),
      placeId: candidate.background.placeId || residenceAt(state, point.year)
    });
    result.set(point.year, { ...place(primary), ...(companion ? { companion: place(companion) } : {}) });
  });
  return result;
}

/** Milestones that are spoken even right after another aside. */
const URGENT_KINDS = new Set(["war", "war_end", "revolution", "civil_war", "occupation", "state_change"]);

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
