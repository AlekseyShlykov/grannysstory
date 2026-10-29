import { birthAfterwords, birthStatements } from "../../content/scenes/birthVoice";
import { framingVoice, voiceFor } from "../../content/scenes/historicalVoice";
import { spokenChildren, spokenRelationship } from "../../content/scenes/kinshipVoice";
import type { Sex } from "../../content/scenes/kinshipVoice";
import type { ReflectionAngle } from "../../content/scenes/lifeCourse";
import { placeLocative } from "../../content/scenes/regions";
import { placeLocativeAt, placeNameAt } from "../data/world";
import type { EmotionalQualities, GameSessionState, LifeEvent } from "../data/types";
import { activeBranchDefinition, anchorAsLifeEvent, commitBranch } from "./biography";
import {
  backgroundAsLifeEvent,
  fragmentForPoint,
  lifeTimelinePoints,
  personalAnswer,
  phaseAtAge,
  questionsForPoint,
  timelineBackgrounds
} from "./lifeTimeline";
import { threadClosingFor, threadEchoFor } from "./earlyLifeThread";
import { seededRandom } from "./random";
import { currentOccupation, nextWorkStage, workFactId, workLifeEvent, workLine } from "./work";
import type { WorkStage } from "./work";

export interface DialogueOption {
  id: string;
  text: string;
}

export interface DialogueSceneView {
  options: DialogueOption[];
}

function activePoint(state: GameSessionState) {
  const points = lifeTimelinePoints(state.selection);
  return points[Math.min(state.dialogue.step, points.length - 1)]!;
}

function hasBranchInPoint(state: GameSessionState): boolean {
  const branch = state.biography.branches[0];
  const point = activePoint(state);
  return Boolean(branch && !branch.resolved && branch.year >= point.year && branch.year <= point.endYear);
}

function branchSetupFactId(state: GameSessionState): string {
  const branch = state.biography.branches[0];
  return `fact:branch-setup:${branch?.type ?? "unknown"}:${branch?.year ?? 0}`;
}

function isBranchChoiceReady(state: GameSessionState): boolean {
  return hasBranchInPoint(state) && state.discovery.facts.some((fact) => fact.id === branchSetupFactId(state));
}

function revealBranchSetup(state: GameSessionState): GameSessionState {
  const id = branchSetupFactId(state);
  if (state.discovery.facts.some((fact) => fact.id === id)) return state;
  return {
    ...state,
    discovery: {
      facts: [...state.discovery.facts, { id, learnedAtStep: state.dialogue.step + 1, lifeEventIds: [] }]
    }
  };
}

function residenceAt(state: GameSessionState, year: number): string {
  return state.biography.residenceHistory.find((residence) => year >= residence.fromYear && year <= residence.toYear)?.placeId
    ?? state.biography.residenceHistory.at(-1)?.placeId
    ?? state.biography.residenceHistory[0]?.placeId
    ?? "tver";
}

function qualitiesFor(angle: ReflectionAngle): EmotionalQualities {
  return {
    pride: angle === "detail",
    regret: angle === "feeling",
    gratitude: angle !== "feeling",
    acceptance: angle === "meaning"
  };
}

function addKnownEvent(state: GameSessionState, event: LifeEvent, qualities: EmotionalQualities): GameSessionState {
  const existing = state.biography.lifeEvents.some((candidate) => candidate.id === event.id);
  const lifeEvents = existing
    ? state.biography.lifeEvents.map((candidate) => candidate.id === event.id ? { ...candidate, known: true } : candidate)
    : [...state.biography.lifeEvents, event];
  const memoryExists = state.memories.some((memory) => memory.lifeEventId === event.id);
  const memories = memoryExists
    ? state.memories.map((memory) => memory.lifeEventId === event.id ? { ...memory, recalled: true } : memory)
    : [...state.memories, {
        id: `memory:${event.id}`,
        lifeEventId: event.id,
        recalled: true,
        interpretation: event.text,
        qualities
      }];
  const factId = `fact:${event.id}`;
  const factExists = state.discovery.facts.some((fact) => fact.id === factId || fact.lifeEventIds.includes(event.id));
  return {
    ...state,
    biography: { ...state.biography, lifeEvents },
    memories,
    discovery: {
      facts: factExists
        ? state.discovery.facts
        : [...state.discovery.facts, { id: factId, learnedAtStep: state.dialogue.step + 1, lifeEventIds: [event.id] }]
    }
  };
}

function withTurn(
  state: GameSessionState,
  playerText: string,
  answer: string,
  finished: boolean,
  advanceTimeline = true
): GameSessionState {
  return {
    ...state,
    dialogue: {
      sceneId: "timeline",
      step: finished || !advanceTimeline ? state.dialogue.step : state.dialogue.step + 1,
      transcript: [
        ...state.dialogue.transcript,
        { speaker: "player", text: playerText },
        { speaker: "grandmother", text: answer }
      ]
    },
    screen: finished ? "atlas" : "conversation",
    updatedAt: new Date().toISOString()
  };
}

function familySexes(state: GameSessionState): { bridge: Sex; parent: Sex } {
  const people = state.biography.people;
  const anchorId = state.biography.relationship.familyAnchorId;
  return {
    bridge: anchorId === "parent" ? undefined : people.find((person) => person.id === anchorId)?.sex,
    parent: people.find((person) => person.id === "parent")?.sex
  };
}

function specialEventsInPoint(state: GameSessionState): LifeEvent[] {
  const point = activePoint(state);
  return state.biography.lifeEvents.filter((event) =>
    event.provenance === "FICTIONAL_PERSONAL"
    && !event.known
    && event.year >= point.year
    && event.year <= point.endYear
    && !event.id.startsWith("life:timeline:")
  );
}

function specialSpeech(state: GameSessionState, events: LifeEvent[]): string[] {
  const speech: string[] = [];
  if (events.some((event) => event.id === "life:family-connection")) {
    const { bridge, parent } = familySexes(state);
    speech.push(
      spokenRelationship(state.biography.relationship.variant, bridge, parent),
      spokenChildren(state.biography.relationship.childrenStatus, parent)
    );
  }
  for (const event of events) if (event.id !== "life:family-connection") speech.push(event.text);
  return speech;
}

const birthAngles: ReflectionAngle[] = ["detail", "feeling", "meaning"];

/**
 * Year and place are canon; who told her and the small detail around them vary by run and by the question,
 * so the passport is only one of many possible sources, and sometimes there is no source at all.
 */
function birthAnswer(state: GameSessionState, angle: ReflectionAngle): string {
  const year = state.selection.birthYear;
  const placeId = state.biography.residenceHistory[0]?.placeId ?? "tver";
  const where = placeLocativeAt(placeId, year) ?? placeLocative(placeNameAt(placeId, year));
  const random = seededRandom(`${state.selection.runSeed}:birth-voice`);
  const base = random.int(0, birthStatements.length - 1);
  const offset = Math.max(birthAngles.indexOf(angle), 0) * 5;
  const statement = birthStatements[(base + offset) % birthStatements.length]!(year, where);
  const afterword = birthAfterwords[random.int(0, birthAfterwords.length - 1)]!;
  return [statement, afterword].filter(Boolean).join(" ");
}

/** Says one stage of her working life and records it; the first stage also enters the atlas. */
function tellWork(state: GameSessionState, stage: WorkStage): { state: GameSessionState; line: string | null } {
  const occupation = currentOccupation(state);
  if (!occupation) return { state, line: null };
  let next: GameSessionState = {
    ...state,
    discovery: { facts: [...state.discovery.facts, { id: workFactId(stage), learnedAtStep: state.dialogue.step + 1, lifeEventIds: stage === "start" ? ["life:work"] : [] }] }
  };
  if (stage === "start") {
    const year = next.biography.work?.startYear ?? next.selection.birthYear + 18;
    next = addKnownEvent(next, workLifeEvent(next, occupation, residenceAt(next, year)), { pride: true, regret: false, gratitude: true, acceptance: false });
  }
  return { state: next, line: workLine(next, occupation, stage) };
}

function isPointBeforeBranch(state: GameSessionState): boolean {
  const branch = state.biography.branches[0];
  const point = activePoint(state);
  return Boolean(branch && !branch.resolved && branch.year > point.endYear && branch.year <= point.endYear + 5);
}

export function currentScene(state: GameSessionState): DialogueSceneView {
  const point = activePoint(state);
  if (isBranchChoiceReady(state)) {
    const branch = activeBranchDefinition(state);
    return { options: [{ id: "pathA", text: branch.questionA }, { id: "pathB", text: branch.questionB }] };
  }
  return { options: questionsForPoint(state, point) };
}

export function chooseOption(state: GameSessionState, optionId: string): GameSessionState {
  const scene = currentScene(state);
  const option = scene.options.find((candidate) => candidate.id === optionId);
  if (!option) throw new Error(`Option ${optionId} is not available at timeline step ${state.dialogue.step}`);

  const point = activePoint(state);
  const fragment = fragmentForPoint(state, point);
  const branchChoice = isBranchChoiceReady(state);
  const introducesBranch = hasBranchInPoint(state) && !branchChoice;
  let next = branchChoice ? commitBranch(state, optionId as "pathA" | "pathB") : state;

  if (branchChoice) {
    const branch = activeBranchDefinition(next);
    const answer = optionId === "pathA" ? branch.answerA : branch.answerB;
    const decision = next.biography.lifeEvents.find((event) => event.id === `life:${branch.type}:decision`);
    if (decision) next = addKnownEvent(next, decision, { pride: true, regret: true, gratitude: false, acceptance: false });
    // When the turning point decides her work, the concrete job follows the decision in the same answer.
    const work = nextWorkStage(next, point.age, Math.max(point.endYear, next.biography.branches[0]?.year ?? 0)) === "start" ? tellWork(next, "start") : null;
    if (work?.line) next = work.state;
    return withTurn(next, option.text, [answer, work?.line].filter(Boolean).join(" "), point.final);
  }

  const angle = optionId as ReflectionAngle;
  const mainAnswer = point.age === 0
    ? `${birthAnswer(next, angle)} ${fragment.detail}`
    : personalAnswer(fragment, angle);
  const threadEcho = threadEchoFor(next, point.age, phaseAtAge(point.age));
  const linkedAnswer = threadEcho ? `${threadEcho} ${mainAnswer}` : mainAnswer;

  const personalEvent: LifeEvent = {
    id: `life:timeline:${point.year}`,
    year: point.year,
    title: fragment.title,
    text: linkedAnswer,
    placeId: residenceAt(next, point.year),
    peopleIds: ["grandmother"],
    provenance: "FICTIONAL_PERSONAL",
    sourceIds: [],
    salience: fragment.salience,
    known: true
  };
  next = addKnownEvent(next, personalEvent, qualitiesFor(angle));

  const specials = specialEventsInPoint(next);
  const speech = [linkedAnswer, ...specialSpeech(next, specials)];
  for (const event of specials) next = addKnownEvent(next, { ...event, known: true }, { pride: false, regret: false, gratitude: true, acceptance: true });

  const workStage = nextWorkStage(next, point.age, point.endYear);
  if (workStage) {
    const work = tellWork(next, workStage);
    next = work.state;
    if (work.line) speech.push(work.line);
  }

  const backgrounds = timelineBackgrounds(next);
  const background = backgrounds.get(point.year);
  if (background) {
    const historicalEvent = background.existingLifeEventId
      ? next.biography.lifeEvents.find((event) => event.id === background.existingLifeEventId)
      : backgroundAsLifeEvent(background);
    if (historicalEvent) next = addKnownEvent(next, { ...historicalEvent, known: true }, { pride: false, regret: false, gratitude: false, acceptance: false });
    const eventId = background.id.replace(/^context:(national:|world:)?/, "");
    const wasPresent = !background.existingLifeEventId || Boolean(historicalEvent?.peopleIds.includes("grandmother"));
    // The order of this aside among all asides of the life keeps lead-in phrases from repeating.
    const order = [...backgrounds.keys()].sort((a, b) => a - b).indexOf(point.year);
    speech.push(voiceFor(eventId, Math.max(0, background.year - state.selection.birthYear), wasPresent, background.text, background.level, background.title, state.selection.runSeed, order));
  }

  if (isPointBeforeBranch(next)) {
    speech.push(activeBranchDefinition(next).foreshadow);
  }

  if (introducesBranch) {
    const branch = activeBranchDefinition(next);
    const anchor = next.biography.branches[0]?.historicalAnchor;
    if (anchor) {
      next = addKnownEvent(next, anchorAsLifeEvent(anchor, residenceAt(next, anchor.year)), { pride: false, regret: false, gratitude: false, acceptance: false });
      const framing = framingVoice(anchor.year - state.selection.birthYear, anchor.summary, anchor.title, state.selection.runSeed, anchor.kind);
      if (framing) speech.push(framing);
    }
    speech.push(branch.setup);
    next = revealBranchSetup(next);
    return withTurn(next, option.text, speech.filter(Boolean).join("\n\n"), false, false);
  }

  if (point.final) {
    const resolved = next.biography.branches[0];
    if (resolved?.resolved && resolved.outcome) {
      const definition = activeBranchDefinition(next);
      speech.push(resolved.outcome.id === "pathA" ? definition.lateA : definition.lateB);
    }
    const closing = threadClosingFor(next);
    if (closing) speech.push(closing);
    const hundred = point.age === 100 ? " Сто лет, подумать только." : "";
    speech.push(`Вот и дошли до ${point.year} года.${hundred} Я пока здесь, так что не делай из моей жизни законченную книгу. Давай лучше поставим чайник.`);
  }

  return withTurn(next, option.text, speech.filter(Boolean).join("\n\n"), point.final);
}
