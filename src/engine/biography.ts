import { branchCatalog } from "../../content/scenes/branchCatalog";
import { namePalettes } from "../../content/scenes/names";
import { genericRegionNarrative, regionNarratives } from "../../content/scenes/regions";
import { getPlace, placeNameAt } from "../data/world";
import { hasWorldPacks, worldData } from "../data/worldStore";
import type {
  BiographyState,
  BranchDefinition,
  GameSessionState,
  HistoricalAnchor,
  HistoricalEvent,
  LifeEvent,
  MemoryState,
  Person,
  RelationshipState,
  RegionPack,
  StartSelection
} from "../data/types";
import { seededRandom } from "./random";
import { earlyLifeThreadForSeed } from "./earlyLifeThread";
import { validateSelection } from "./setup";
import { chooseBranchWithHistory, lifeProfile } from "./world/biographyLink";
import { getLocation, resolveLocationId } from "./world/geography";
import { checkMove, pickDestination } from "./world/migration";
import { planWork } from "./work";

const traits = ["отвечает не сразу", "любит точные бытовые подробности", "смеётся над собственными ошибками", "не любит говорить торжественно"] as const;
const childlessStatuses = [
  "chose_no_children",
  "wanted_no_children",
  "circumstances_changed",
  "no_strong_preference",
  "mentor_without_children"
] as const;

const childlessDescriptions = {
  chose_no_children: "Она сознательно не хотела собственных детей и не считала свою жизнь неполной.",
  wanted_no_children: "Она хотела детей, но их не было; со временем это осталось частью жизни, а не её единственным объяснением.",
  circumstances_changed: "Она откладывала решение о детях, а потом обстоятельства изменились. Она не сводит к этому всю свою судьбу.",
  no_strong_preference: "Она никогда не чувствовала, что материнство обязательно должно стать центром её жизни.",
  mentor_without_children: "Собственных детей у неё не было, зато она много лет оставалась важным взрослым для младших родственников."
} as const;

export function ageAt(birthYear: number, year: number): number {
  return year - birthYear;
}

export function anchorAsLifeEvent(anchor: HistoricalAnchor, placeId: string): LifeEvent {
  return {
    id: `context:world:${anchor.id}`,
    year: anchor.year,
    title: anchor.title,
    text: `${anchor.summary} Это проверенный исторический фон поворотной ситуации, а не её единственная причина.`,
    placeId,
    peopleIds: [],
    provenance: "VERIFIED_HISTORICAL",
    sourceIds: anchor.sourceIds,
    salience: "historical",
    known: true
  };
}

export function activeBranchDefinition(state: GameSessionState): BranchDefinition {
  const active = state.biography.branches[0];
  const definition = branchCatalog.find((candidate) => candidate.type === active?.type);
  if (!definition) throw new Error("Active branch definition is missing");
  return definition;
}

function warEventForRegion(pack: RegionPack): HistoricalEvent | null {
  return pack.events.find((candidate) => {
    const year = Number(candidate.startDate.slice(0, 4));
    return year >= 1941 && year <= 1945;
  }) ?? null;
}

interface HistoryPlan {
  branch: BranchDefinition;
  anchor: HistoricalAnchor | null;
  destinationPlaceId: string | null;
}

/**
 * With world packs loaded, verified circumstances at her birthplace decide which turning points are plausible
 * and a migration destination is drawn from places that existed and were reachable in that year. A separate
 * random stream keeps the v0.4 generation (no packs) byte-identical.
 */
function planWithHistory(selection: StartSelection, biography: BiographyState, initial: BranchDefinition, branchYear: number): HistoryPlan {
  const legacyDestination = regionNarratives[selection.birthRegionId]?.destinationPlaceId ?? null;
  const birthPlaceId = biography.residenceHistory[0]!.placeId;
  const world = worldData();
  if (!hasWorldPacks() || !resolveLocationId(world, birthPlaceId)) return { branch: initial, anchor: null, destinationPlaceId: legacyDestination };
  const random = seededRandom(`${selection.runSeed}:history`);
  const profile = lifeProfile(selection.birthYear, world, biography);
  const { definition, anchor } = chooseBranchWithHistory(world, biography.residenceHistory, profile, branchCatalog, initial, branchYear, random);
  const legacyOk = legacyDestination !== null && checkMove(world, birthPlaceId, legacyDestination, branchYear).ok;
  const destinationPlaceId = legacyOk ? legacyDestination : pickDestination(world, birthPlaceId, branchYear, random);
  return { branch: definition, anchor, destinationPlaceId };
}

interface GeneratedFamily {
  people: Person[];
  relationship: RelationshipState;
  familyEvent: Pick<LifeEvent, "year" | "title" | "text" | "peopleIds">;
}

function grandmotherName(country: string, random: ReturnType<typeof seededRandom>): string {
  const palette = namePalettes[country] ?? namePalettes.RU!;
  const first = random.pick(palette.firstNames);
  // Three draws regardless of palette, so the rest of the generated life does not depend on the naming culture.
  const patronymic = random.pick(namePalettes.RU!.patronymics!);
  const surname = random.pick(palette.surnames);
  return palette.patronymics ? `${first} ${patronymic} ${surname}` : `${first} ${surname}`;
}

function createFamily(selection: StartSelection, random: ReturnType<typeof seededRandom>, country: string): GeneratedFamily {
  const variant = random.pick(["biological_grandmother", "adoptive_grandmother", "great_aunt", "cousin_grandmother"] as const);
  const parentBirthYear = selection.birthYear + random.int(22, 28);
  const playerBirthYear = parentBirthYear + random.int(20, 26);
  const parentIsDaughter = random.next() < 0.62;
  const grandmother: Person = {
    id: "grandmother",
    name: grandmotherName(country, random),
    birthYear: selection.birthYear,
    parentIds: []
  };
  const player: Person = { id: "player", name: "ты", birthYear: playerBirthYear, parentIds: ["parent"] };

  if (variant === "biological_grandmother" || variant === "adoptive_grandmother") {
    const adoptive = variant === "adoptive_grandmother";
    const parent: Person = {
      id: "parent",
      name: parentIsDaughter ? (adoptive ? "её приёмная дочь, твоя мама" : "её дочь, твоя мама") : (adoptive ? "её приёмный сын, твой папа" : "её сын, твой папа"),
      birthYear: parentBirthYear,
      parentIds: adoptive ? [] : ["grandmother"],
      sex: parentIsDaughter ? "female" : "male"
    };
    return {
      people: [grandmother, parent, player],
      relationship: {
        variant,
        playerRelationLabel: adoptive ? "приёмная бабушка" : "родная бабушка",
        introduction: adoptive
          ? `Она ${parentIsDaughter ? "удочерила твою маму" : "усыновила твоего папу"} задолго до твоего рождения. Слово «приёмная» здесь объясняет родство, но не дистанцию.`
          : `Она твоя родная бабушка, ${parentIsDaughter ? "мама твоей мамы" : "мама твоего папы"}, хотя близость между вами всё равно складывалась не автоматически.`,
        childrenStatus: adoptive ? "adoptive_parent" : "biological_parent",
        childrenText: adoptive
          ? `У неё не было биологических детей; ${parentIsDaughter ? "твою маму она удочерила" : "твоего папу она усыновила"}.`
          : `У неё родил${parentIsDaughter ? "ась дочь, твоя мама" : "ся сын, твой папа"}.`,
        hasOwnChildren: true,
        familyAnchorId: "parent",
        edges: [
          { fromId: "grandmother", toId: "parent", kind: adoptive ? "adoptive_parent" : "biological_parent" },
          { fromId: "parent", toId: "player", kind: "biological_parent" }
        ]
      },
      familyEvent: {
        year: parentBirthYear,
        title: adoptive ? "Стала матерью приёмного ребёнка" : (parentIsDaughter ? "Родилась дочь" : "Родился сын"),
        text: adoptive
          ? "В семье появился ребёнок, которого она растила как своего. Этот личный факт художественный и не предполагает биологического родства."
          : "Так начинается следующая ветвь семьи, которая позднее приведёт к игроку. Этот личный факт художественный.",
        peopleIds: ["grandmother", "parent"]
      }
    };
  }

  // Separate streams: concrete sexes were added later and must not shift the rest of an existing seed's life.
  const bridgeIsSister = seededRandom(`${selection.runSeed}:bridge-sex`).next() < 0.5;
  const collateralParentIsDaughter = seededRandom(`${selection.runSeed}:collateral-parent-sex`).next() < 0.5;
  const grandparentWord = bridgeIsSister ? "твоя бабушка" : "твой дедушка";
  const bridge: Person = {
    id: variant === "great_aunt" ? "grandmother_sibling" : "player_grandparent",
    name: variant === "great_aunt"
      ? `её ${bridgeIsSister ? "сестра" : "брат"}, ${grandparentWord}`
      : `её ${bridgeIsSister ? "двоюродная сестра" : "двоюродный брат"}, ${grandparentWord}`,
    birthYear: selection.birthYear + random.int(0, 3),
    parentIds: [],
    sex: bridgeIsSister ? "female" : "male"
  };
  const collateralParentBirth = bridge.birthYear + random.int(22, 28);
  const collateralPlayerBirth = collateralParentBirth + random.int(20, 26);
  const parent: Person = {
    id: "parent",
    name: collateralParentIsDaughter ? "твоя мама" : "твой папа",
    birthYear: collateralParentBirth,
    parentIds: [bridge.id],
    sex: collateralParentIsDaughter ? "female" : "male"
  };
  player.birthYear = collateralPlayerBirth;
  const childrenStatus = random.pick(childlessStatuses);
  return {
    people: [grandmother, bridge, parent, player],
    relationship: {
      variant,
      playerRelationLabel: variant === "great_aunt" ? "старшая родственница, которую в семье зовут бабушкой" : "двоюродная бабушка",
      introduction: variant === "great_aunt"
        ? `Формально она сестра ${bridgeIsSister ? "твоей бабушки" : "твоего дедушки"}. В семье её всегда звали бабушкой, и ты тоже.`
        : `Она двоюродная сестра ${bridgeIsSister ? "твоей бабушки" : "твоего дедушки"}. Для тебя она всегда была просто бабушкой.`,
      childrenStatus,
      childrenText: childlessDescriptions[childrenStatus],
      hasOwnChildren: false,
      familyAnchorId: bridge.id,
      edges: [
        { fromId: "grandmother", toId: bridge.id, kind: variant === "great_aunt" ? "sibling" : "cousin" },
        { fromId: bridge.id, toId: "parent", kind: "biological_parent" },
        { fromId: "parent", toId: "player", kind: "biological_parent" }
      ]
    },
    familyEvent: {
      year: Math.min(collateralPlayerBirth + 6, selection.conversationYear - 1),
      title: "Стала для младших родственников бабушкой",
      text: `${childlessDescriptions[childrenStatus]} Родство с игроком идёт по боковой ветви семьи и не создаёт ей вымышленных потомков.`,
      peopleIds: ["grandmother", "player"]
    }
  };
}

function historicalLifeEvent(selection: StartSelection, event: HistoricalEvent, flags: string[]): LifeEvent {
  const year = Number(event.startDate.slice(0, 4));
  const present = !event.applicability.requiresFlag || flags.includes(event.applicability.requiresFlag);
  const personalSuffix = present
    ? "В этой биографии она находилась в городе; личная деталь рассказа художественная, дата и контекст проверены."
    : "В этой биографии она не находилась в городе в этот период; событие показано как исторический фон, а не личный опыт.";
  return {
    id: `context:${event.id}`,
    year,
    title: event.title,
    text: `${event.historicalContext} ${personalSuffix}`,
    placeId: event.locationId,
    peopleIds: present ? ["grandmother"] : [],
    provenance: "VERIFIED_HISTORICAL",
    sourceIds: [event.sourceId],
    salience: "historical",
    known: false
  };
}

function initialBiography(selection: StartSelection, pack: RegionPack): BiographyState {
  const random = seededRandom(selection.runSeed);
  const earlyThread = earlyLifeThreadForSeed(selection.runSeed);
  const birthPlaceId = random.pick(pack.birthPlaces);
  const country = getLocation(worldData(), birthPlaceId)?.country ?? "RU";
  const family = createFamily(selection, random, country);
  const people = family.people;
  const branch = random.pick(branchCatalog);
  const branchYear = Math.min(selection.birthYear + random.int(19, 27), 1965);
  const flags: string[] = [];
  if (selection.birthRegionId === "leningrad" && random.next() < 0.55) flags.push("in_city_during_blockade");
  if (selection.birthRegionId === "leningrad" && !flags.includes("in_city_during_blockade")) flags.push("left_city_before_blockade");
  const historical = warEventForRegion(pack);
  const narrative = regionNarratives[selection.birthRegionId] ?? genericRegionNarrative;
  const ordinaryYear = Math.min(selection.birthYear + narrative.ordinaryYearOffset, 2002);
  const birthEvent: LifeEvent = {
    id: "life:birth",
    year: selection.birthYear,
    title: `Родилась в городе ${placeNameAt(birthPlaceId, selection.birthYear)}`,
    text: `Начало этой сгенерированной жизни. Персонаж художественный; место и историческое название проверяются по справочнику.`,
    placeId: birthPlaceId,
    peopleIds: ["grandmother"],
    provenance: "FICTIONAL_PERSONAL",
    sourceIds: [],
    salience: "personal",
    known: true
  };
  const familyEvent: LifeEvent = {
    id: "life:family-connection",
    year: family.familyEvent.year,
    title: family.familyEvent.title,
    text: family.familyEvent.text,
    placeId: birthPlaceId,
    peopleIds: family.familyEvent.peopleIds,
    provenance: "FICTIONAL_PERSONAL",
    sourceIds: [],
    salience: "personal",
    known: false
  };
  const ordinaryEvent: LifeEvent = {
    id: "life:ordinary",
    year: ordinaryYear,
    title: "Обычный день, который остался",
    text: narrative.ordinaryText,
    placeId: birthPlaceId,
    peopleIds: people.filter((person) => person.id === "grandmother" || (person.birthYear <= ordinaryYear && person.id === family.relationship.familyAnchorId)).map((person) => person.id),
    provenance: "FICTIONAL_PERSONAL",
    sourceIds: [],
    salience: "quiet",
    known: false
  };
  const draft: BiographyState = {
    people,
    relationship: family.relationship,
    narrativeThreadId: earlyThread.id,
    traits: [random.pick(traits), random.pick(traits)],
    themes: [],
    residenceHistory: [{ placeId: birthPlaceId, fromYear: selection.birthYear, toYear: selection.conversationYear }],
    lifeEvents: [birthEvent, ...(historical ? [historicalLifeEvent(selection, historical, flags)] : []), familyEvent, ordinaryEvent],
    branches: [],
    flags
  };
  const plan = planWithHistory(selection, draft, branch, branchYear);
  const work = planWork(selection, birthPlaceId, plan.branch, branchYear, plan.destinationPlaceId);
  return {
    ...draft,
    ...(work ? { work } : {}),
    themes: [...new Set([...plan.branch.themes, "healthAgingAndIndependence", "smallJoysAndGratitude", "meaningAndLegacy"])] as BiographyState["themes"],
    branches: [{
      id: `branch:${plan.branch.type}`,
      type: plan.branch.type,
      year: branchYear,
      resolved: false,
      outcome: null,
      historicalAnchor: plan.anchor,
      destinationPlaceId: plan.destinationPlaceId
    }]
  };
}

export function generateSession(selection: StartSelection, pack: RegionPack): GameSessionState {
  const errors = validateSelection(selection);
  if (errors.length) throw new Error(errors.join(" "));
  if (pack.regionId !== selection.birthRegionId || pack.version !== selection.datasetVersion) throw new Error("Regional pack does not match selection");
  const biography = initialBiography(selection, pack);
  return {
    saveFormatVersion: 2,
    selection,
    biography,
    memories: biography.lifeEvents.map((event) => ({
      id: `memory:${event.id}`,
      lifeEventId: event.id,
      recalled: event.known,
      interpretation: event.salience === "quiet" ? "маленькая память" : "часть биографии",
      qualities: {
        pride: event.id === "life:family-connection",
        regret: false,
        gratitude: event.salience === "quiet" || event.id === "life:family-connection",
        acceptance: event.id === "life:birth"
      }
    })),
    dialogue: {
      sceneId: "timeline",
      step: 0,
      transcript: [{ speaker: "grandmother", text: earlyLifeThreadForSeed(selection.runSeed).opening }]
    },
    discovery: { facts: [{ id: "fact:birth", learnedAtStep: 0, lifeEventIds: ["life:birth"] }] },
    screen: "conversation",
    updatedAt: new Date().toISOString()
  };
}

export function commitBranch(state: GameSessionState, outcomeId: "pathA" | "pathB"): GameSessionState {
  const active = state.biography.branches[0];
  if (!active) throw new Error("No active branch");
  if (active.resolved) {
    if (active.outcome?.id !== outcomeId) throw new Error("A disclosed branch cannot be rewritten");
    return state;
  }
  const definition = activeBranchDefinition(state);
  const birthPlaceId = state.biography.residenceHistory[0]?.placeId;
  if (!birthPlaceId) throw new Error("Birth residence is missing");
  const destination = active.destinationPlaceId === undefined ? regionNarratives[state.selection.birthRegionId]?.destinationPlaceId ?? null : active.destinationPlaceId;
  // Without a reachable destination she stays: the decision text still holds, but no move is invented.
  const moves = Boolean((outcomeId === "pathA" ? definition.movesOnA : definition.movesOnB) && destination);
  const placeId = moves && destination ? destination : birthPlaceId;
  const branchEvent: LifeEvent = {
    id: `life:${active.type}:decision`,
    year: active.year,
    title: outcomeId === "pathA" ? definition.titleA : definition.titleB,
    text: outcomeId === "pathA" ? definition.answerA : definition.answerB,
    placeId,
    peopleIds: ["grandmother"],
    provenance: "FICTIONAL_PERSONAL",
    sourceIds: [],
    salience: "personal",
    known: true,
    ...(active.historicalAnchor ? { historicalContextIds: [active.historicalAnchor.id] } : {})
  };
  const consequenceYear = Math.min(active.year + 18, state.selection.conversationYear - 10);
  const consequenceEvent: LifeEvent = {
    id: `life:${active.type}:consequence`,
    year: consequenceYear,
    title: `Позднее последствие: ${outcomeId === "pathA" ? definition.titleA.toLocaleLowerCase("ru") : definition.titleB.toLocaleLowerCase("ru")}`,
    text: outcomeId === "pathA" ? definition.consequenceA : definition.consequenceB,
    placeId,
    peopleIds: ["grandmother"],
    provenance: "FICTIONAL_PERSONAL",
    sourceIds: [],
    salience: "personal",
    known: false
  };
  const residenceHistory = moves
    ? [
        { placeId: birthPlaceId, fromYear: state.selection.birthYear, toYear: active.year - 1 },
        { placeId, fromYear: active.year, toYear: state.selection.conversationYear }
      ]
    : state.biography.residenceHistory;
  const flags = [...state.biography.flags];
  if (active.type === "marriage") flags.push(outcomeId === "pathA" ? "married" : "chose_not_to_marry");
  return {
    ...state,
    biography: {
      ...state.biography,
      residenceHistory,
      flags,
      branches: [{ ...active, resolved: true, outcome: { id: outcomeId, committedAtStep: state.dialogue.step } }],
      lifeEvents: [...state.biography.lifeEvents, branchEvent, consequenceEvent]
    },
    memories: [
      ...state.memories,
      {
        id: `memory:${branchEvent.id}`,
        lifeEventId: branchEvent.id,
        recalled: true,
        interpretation: "решение, которым она одновременно гордится и о котором иногда жалеет",
        qualities: { pride: true, regret: true, gratitude: false, acceptance: false }
      },
      {
        id: `memory:${consequenceEvent.id}`,
        lifeEventId: consequenceEvent.id,
        recalled: false,
        interpretation: "последствие, раскрываемое позднее",
        qualities: { pride: outcomeId === "pathA", regret: outcomeId === "pathB", gratitude: true, acceptance: true }
      }
    ]
  };
}

export function biographyIssues(state: GameSessionState): string[] {
  const issues: string[] = [];
  const grandmother = state.biography.people.find((person) => person.id === "grandmother");
  const player = state.biography.people.find((person) => person.id === "player");
  const relationship = state.biography.relationship;
  if (!grandmother || !player || !relationship) return ["Неполный семейный граф"];
  const peopleById = new Map(state.biography.people.map((person) => [person.id, person]));
  for (const edge of relationship.edges) {
    const from = peopleById.get(edge.fromId);
    const to = peopleById.get(edge.toId);
    if (!from || !to) {
      issues.push("Связь указывает на отсутствующего человека");
      continue;
    }
    if ((edge.kind === "biological_parent" || edge.kind === "adoptive_parent") && to.birthYear <= from.birthYear + 14) {
      issues.push("Недопустимый возраст в связи взрослый → ребёнок");
    }
  }
  const grandmotherParentEdges = relationship.edges.filter((edge) => edge.fromId === grandmother.id && (edge.kind === "biological_parent" || edge.kind === "adoptive_parent"));
  if (!relationship.hasOwnChildren && grandmotherParentEdges.length) issues.push("Бездетной героине приписан ребёнок");
  if (relationship.hasOwnChildren && !grandmotherParentEdges.length) issues.push("Заявленный ребёнок отсутствует в семейном графе");
  if (relationship.variant === "biological_grandmother" && !grandmotherParentEdges.some((edge) => edge.kind === "biological_parent")) issues.push("Нет биологической связи с родной бабушкой");
  if (relationship.variant === "adoptive_grandmother" && !grandmotherParentEdges.some((edge) => edge.kind === "adoptive_parent")) issues.push("Нет приёмной связи");
  if (relationship.variant === "great_aunt" && !relationship.edges.some((edge) => edge.fromId === grandmother.id && edge.kind === "sibling")) issues.push("Нет боковой связи через сестру или брата");
  if (relationship.variant === "cousin_grandmother" && !relationship.edges.some((edge) => edge.fromId === grandmother.id && edge.kind === "cousin")) issues.push("Нет двоюродной связи");
  if (!relationship.edges.some((edge) => edge.toId === player.id && edge.kind === "biological_parent")) issues.push("Игрок не связан со своей родительской ветвью");
  const sorted = [...state.biography.lifeEvents].sort((a, b) => a.year - b.year);
  if (sorted.some((event) => event.year < grandmother.birthYear || event.year > state.selection.conversationYear)) issues.push("Событие вне жизни героини");
  const residences = [...state.biography.residenceHistory].sort((a, b) => a.fromYear - b.fromYear);
  for (let index = 1; index < residences.length; index += 1) {
    if ((residences[index - 1]?.toYear ?? 0) >= (residences[index]?.fromYear ?? 0)) issues.push("Пересекающиеся постоянные места жительства");
  }
  for (const residence of residences) getPlace(residence.placeId);
  return issues;
}
