import {
  provisionalClusterWeight,
  reflectionClosings,
  reflectionOpenings,
  regretArchetypes
} from "../../content/scenes/regretArchetypes";
import type { ReflectionFacts, RegretArchetype } from "../../content/scenes/regretArchetypes";
import { placeNameAt } from "../data/world";
import type { GameSessionState, LateLifeReflection, LifeEvent } from "../data/types";
import { lifeTimelinePoints, type LifeTimelinePoint } from "./lifeTimeline";
import { partnershipSpan, personById, workSpan } from "./memory/lifeFacts";
import { seededRandom } from "./random";
import { currentOccupation } from "./work";

export const REFLECTION_EVENT_ID = "life:late-reflection";

/**
 * The one reflective conversation of late life: the first interval she reaches between 80 and 90. Every
 * supported birth year reaches 80 before the conversation; if a future range does not, the final point is
 * used instead and the omission is recorded on the reflection.
 */
export function reflectionPoint(state: GameSessionState): { point: LifeTimelinePoint; omittedReason?: string } {
  const points = lifeTimelinePoints(state.selection);
  const late = points.find((point) => !point.final && point.age >= 80 && point.age <= 90);
  if (late) return { point: late };
  return { point: points.at(-1)!, omittedReason: "Героиня не достигает 80 лет к году разговора; размышление перенесено в последний разговор." };
}

export function isReflectionPoint(state: GameSessionState, point: LifeTimelinePoint): boolean {
  // Saves from before this system have no life canon; their conversation keeps its earlier shape.
  return Boolean(state.biography.canon) && reflectionPoint(state).point.year === point.year && !state.biography.lateLifeReflection;
}

export function reflectionFacts(state: GameSessionState): ReflectionFacts {
  const branch = state.biography.branches[0];
  const resolved = branch?.resolved && branch.outcome ? branch : null;
  const birthPlaceId = state.biography.residenceHistory[0]!.placeId;
  const moved = state.biography.residenceHistory[1];
  const mother = personById(state, "grandmother_mother");
  const partnership = partnershipSpan(state);
  const occupation = currentOccupation(state);
  const work = workSpan(state);
  const toldPatterns = new Map<string, string>();
  for (const memory of state.memories) if (memory.atlas && memory.recalled) toldPatterns.set(memory.atlas.patternKey, memory.lifeEventId);
  const quiet = state.biography.lifeEvents.find((event) => event.known && event.salience === "quiet" && event.provenance === "FICTIONAL_PERSONAL");
  return {
    branch: resolved ? { type: resolved.type, outcome: resolved.outcome!.id, year: resolved.year, eventId: `life:${resolved.type}:decision` } : null,
    birthPlace: placeNameAt(birthPlaceId, state.selection.birthYear),
    movedTo: moved ? placeNameAt(moved.placeId, moved.fromYear) : null,
    motherAliveAtBranch: Boolean(mother && resolved && (mother.deathYear ?? Infinity) >= resolved.year),
    motherDiedAtAge: mother?.deathYear !== null && mother?.deathYear !== undefined ? mother.deathYear - state.selection.birthYear : null,
    hasOwnChildren: state.biography.relationship.hasOwnChildren,
    childrenStatus: state.biography.relationship.childrenStatus,
    childIsDaughter: personById(state, "parent")?.sex === "female",
    partnership: partnership === null || partnership === "undetermined" ? "none"
      : !partnership.end ? "together"
      : partnership.end.kind === "death" ? "widowed" : "separated",
    work: occupation && work ? { title: occupation.title, years: work.end - work.start, eventId: "life:work" } : null,
    toldPatterns,
    quietMemoryTitle: quiet?.title ?? null
  };
}

export function eligibleArchetypes(facts: ReflectionFacts): RegretArchetype[] {
  return regretArchetypes.filter((archetype) => archetype.eligible(facts));
}

/** Weighted draw: provisional cluster weight × how strongly this life points at the archetype. */
export function chooseArchetype(state: GameSessionState, facts = reflectionFacts(state)): RegretArchetype {
  const eligible = eligibleArchetypes(facts);
  const weight = (archetype: RegretArchetype) => (archetype.clusterId ? provisionalClusterWeight[archetype.clusterId] : 1) * archetype.personalWeight(facts);
  const total = eligible.reduce((sum, archetype) => sum + weight(archetype), 0);
  let ticket = seededRandom(`${state.selection.runSeed}:late-life`).next() * total;
  return eligible.find((archetype) => (ticket -= weight(archetype)) <= 0) ?? eligible.at(-1)!;
}

/**
 * Says the reflection once and locks it. The question changes only her first reaction, never the canon; a
 * second call returns the locked answer instead of drawing again.
 */
export function tellReflection(state: GameSessionState, questionIndex: number, point: LifeTimelinePoint): { state: GameSessionState; speech: string } {
  const facts = reflectionFacts(state);
  const locked = state.biography.lateLifeReflection;
  const archetype = locked ? regretArchetypes.find((candidate) => candidate.id === locked.archetypeId)! : chooseArchetype(state, facts);
  const random = seededRandom(`${state.selection.runSeed}:late-life-voice:${questionIndex}`);
  const openings = reflectionOpenings[questionIndex] ?? reflectionOpenings[1]!;
  const speech = [random.pick(openings), archetype.speech(facts), random.pick(reflectionClosings)].join(" ");
  if (locked) return { state, speech };
  const { omittedReason } = reflectionPoint(state);
  const known = new Set(state.biography.lifeEvents.map((event) => event.id));
  const reflection: LateLifeReflection = {
    archetypeId: archetype.id,
    clusterId: archetype.clusterId,
    stance: archetype.stance,
    year: point.year,
    age: point.age,
    relatedEventIds: archetype.relatedEventIds(facts).filter((id) => known.has(id)),
    qualities: archetype.qualities,
    summary: archetype.summary(facts),
    ...(omittedReason ? { omittedReason } : {})
  };
  const residence = state.biography.residenceHistory.find((period) => point.year >= period.fromYear && point.year <= period.toYear) ?? state.biography.residenceHistory.at(-1)!;
  const event: LifeEvent = {
    id: REFLECTION_EVENT_ID,
    year: point.year,
    title: "О чём она жалеет и о чём нет",
    text: reflection.summary,
    placeId: residence.placeId,
    peopleIds: ["grandmother", "player"],
    provenance: "FICTIONAL_PERSONAL",
    sourceIds: [],
    salience: "personal",
    known: true
  };
  return {
    speech,
    state: {
      ...state,
      biography: { ...state.biography, lateLifeReflection: reflection, lifeEvents: [...state.biography.lifeEvents, event] },
      memories: [...state.memories, { id: `memory:${REFLECTION_EVENT_ID}`, lifeEventId: REFLECTION_EVENT_ID, recalled: true, interpretation: reflection.summary, qualities: reflection.qualities }],
      discovery: { facts: [...state.discovery.facts, { id: `fact:${REFLECTION_EVENT_ID}`, learnedAtStep: state.dialogue.step + 1, lifeEventIds: [REFLECTION_EVENT_ID, ...reflection.relatedEventIds] }] }
    }
  };
}
