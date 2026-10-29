import { framingVoice, voiceFor } from "../../content/scenes/historicalVoice";
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
import { threadEchoFor } from "./earlyLifeThread";

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

function spokenRelationship(state: GameSessionState): string {
  switch (state.biography.relationship.variant) {
    case "biological_grandmother":
      return "Я твоя родная бабушка. Но само родство ещё не делает людей близкими, это мы уже потом устроили.";
    case "adoptive_grandmother":
      return "Твоего родителя я приняла в семью задолго до твоего рождения. Слово «приёмная» всё объясняет на бумаге и почти ничего между нами.";
    case "great_aunt":
      return "Формально я сестра твоей бабушки или дедушки. Но в семье меня всегда звали бабушкой, и ты тоже.";
    case "cousin_grandmother":
      return "Я двоюродная родственница твоей бабушки или дедушки. Для тебя с самого начала была просто бабушкой.";
  }
}

function spokenChildren(state: GameSessionState): string {
  switch (state.biography.relationship.childrenStatus) {
    case "biological_parent": return "У меня родился ребёнок, который потом стал твоим родителем. Только не думай, что после этого я сразу всё поняла про семью.";
    case "adoptive_parent": return "Биологических детей у меня не было. Твоего родителя я усыновила или удочерила, а дальше были обычные семейные дни, хорошие и невозможные.";
    case "chose_no_children": return "Я сознательно не хотела собственных детей. Не из-за одной большой причины, просто не видела себя матерью. Жизнь от этого пустой не стала.";
    case "wanted_no_children": return "Детей я хотела, но их не было. Это было больно, потом стало частью жизни, но не единственным её названием.";
    case "circumstances_changed": return "Я всё откладывала решение о детях, а потом обстоятельства изменились. Иногда думаю об этом, но не считаю всю жизнь ошибкой.";
    case "no_strong_preference": return "Я никогда не чувствовала, что материнство обязательно должно стать центром моей жизни. Вокруг это понимали не все, а мне объяснять надоело.";
    case "mentor_without_children": return "Собственных детей у меня не было. Зато младшие родственники всё время оказывались у меня на кухне, и я для них была важным взрослым, хоть и не всегда удобным.";
  }
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
  if (events.some((event) => event.id === "life:family-connection")) speech.push(spokenRelationship(state), spokenChildren(state));
  for (const event of events) if (event.id !== "life:family-connection") speech.push(event.text);
  return speech;
}

function birthAnswer(state: GameSessionState): string {
  const year = state.selection.birthYear;
  const placeId = state.biography.residenceHistory[0]?.placeId ?? "tver";
  const where = placeLocativeAt(placeId, year) ?? placeLocative(placeNameAt(placeId, year));
  return `Родилась я в ${year} году, ${where}. Это я точно знаю, так в паспорте записано. А что было совсем маленькой, почти не помню, так, обрывки.`;
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
    return withTurn(next, option.text, answer, point.final);
  }

  const angle = optionId as ReflectionAngle;
  const mainAnswer = point.age === 0
    ? `${birthAnswer(next)} ${fragment.detail}`
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

  const background = timelineBackgrounds(next).get(point.year);
  if (background) {
    const historicalEvent = background.existingLifeEventId
      ? next.biography.lifeEvents.find((event) => event.id === background.existingLifeEventId)
      : backgroundAsLifeEvent(background);
    if (historicalEvent) next = addKnownEvent(next, { ...historicalEvent, known: true }, { pride: false, regret: false, gratitude: false, acceptance: false });
    const eventId = background.id.replace(/^context:(national:|world:)?/, "");
    const wasPresent = !background.existingLifeEventId || Boolean(historicalEvent?.peopleIds.includes("grandmother"));
    speech.push(voiceFor(eventId, Math.max(0, background.year - state.selection.birthYear), wasPresent, background.text, background.level, background.title));
  }

  if (introducesBranch) {
    const branch = activeBranchDefinition(next);
    const anchor = next.biography.branches[0]?.historicalAnchor;
    if (anchor) {
      next = addKnownEvent(next, anchorAsLifeEvent(anchor, residenceAt(next, anchor.year)), { pride: false, regret: false, gratitude: false, acceptance: false });
      speech.push(framingVoice(anchor.year - state.selection.birthYear, anchor.summary, anchor.title));
    }
    speech.push(branch.setup);
    next = revealBranchSetup(next);
    return withTurn(next, option.text, speech.filter(Boolean).join("\n\n"), false, false);
  }

  if (point.final) {
    const hundred = point.age === 100 ? " Сто лет, подумать только." : "";
    speech.push(`Вот и дошли до ${point.year} года.${hundred} Я пока здесь, так что не делай из моей жизни законченную книгу. Давай лучше поставим чайник.`);
  }

  return withTurn(next, option.text, speech.filter(Boolean).join("\n\n"), point.final);
}
