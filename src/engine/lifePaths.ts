import type { GameSessionState } from "../data/types";
import { activeBranchDefinition } from "./biography";

export type LifePathNodeKind = "birth" | "turning" | "choice" | "consequence" | "conversation";

export interface LifePathNode {
  id: string;
  kind: LifePathNodeKind;
  year: number;
  label: string;
  summary: string;
  x: number;
  y: number;
  selected: boolean;
}

export interface LifePathEdge {
  id: string;
  from: string;
  to: string;
  selected: boolean;
}

export interface LifePathGraph {
  branchLabel: string;
  selectedOutcome: "pathA" | "pathB";
  nodes: LifePathNode[];
  edges: LifePathEdge[];
}

/**
 * A final-screen view of the one unresolved turning point this generated life contained.
 * Alternative nodes describe possibilities from reviewed branch copy, never hidden facts from canon.
 */
export function lifePathGraph(state: GameSessionState): LifePathGraph | null {
  const branch = state.biography.branches[0];
  if (!branch?.resolved || !branch.outcome) return null;
  const definition = activeBranchDefinition(state);
  const selectedOutcome = branch.outcome.id;
  const consequenceYear = state.biography.lifeEvents.find((event) => event.id === `life:${branch.type}:consequence`)?.year
    ?? Math.min(branch.year + 18, state.selection.conversationYear - 10);
  const pathASelected = selectedOutcome === "pathA";
  const pathBSelected = selectedOutcome === "pathB";

  const nodes: LifePathNode[] = [
    {
      id: "birth",
      kind: "birth",
      year: state.selection.birthYear,
      label: "Рождение",
      summary: "Начало этой сгенерированной жизни.",
      x: 80,
      y: 150,
      selected: true
    },
    {
      id: "turning",
      kind: "turning",
      year: branch.year,
      label: definition.label,
      summary: `Поворотная точка. ${definition.setup}`,
      x: 285,
      y: 150,
      selected: true
    },
    {
      id: "pathA",
      kind: "choice",
      year: branch.year,
      label: definition.titleA,
      summary: pathASelected
        ? `Вы спросили: «${definition.questionA}» Она ответила: «${definition.answerA}»`
        : `Другая возможная дорога. Вопрос: «${definition.questionA}» Возможный ответ: «${definition.answerA}»`,
      x: 505,
      y: 70,
      selected: pathASelected
    },
    {
      id: "pathB",
      kind: "choice",
      year: branch.year,
      label: definition.titleB,
      summary: pathBSelected
        ? `Вы спросили: «${definition.questionB}» Она ответила: «${definition.answerB}»`
        : `Другая возможная дорога. Вопрос: «${definition.questionB}» Возможный ответ: «${definition.answerB}»`,
      x: 505,
      y: 230,
      selected: pathBSelected
    },
    {
      id: "consequenceA",
      kind: "consequence",
      year: consequenceYear,
      label: "Позднее последствие",
      summary: pathASelected
        ? `Так продолжился выбранный путь. ${definition.consequenceA}`
        : `Так могла продолжиться другая дорога. ${definition.consequenceA}`,
      x: 730,
      y: 70,
      selected: pathASelected
    },
    {
      id: "consequenceB",
      kind: "consequence",
      year: consequenceYear,
      label: "Позднее последствие",
      summary: pathBSelected
        ? `Так продолжился выбранный путь. ${definition.consequenceB}`
        : `Так могла продолжиться другая дорога. ${definition.consequenceB}`,
      x: 730,
      y: 230,
      selected: pathBSelected
    },
    {
      id: "conversation",
      kind: "conversation",
      year: state.selection.conversationYear,
      label: "Этот разговор",
      summary: "Здесь выбранная дорога стала известной вам частью её истории.",
      x: 940,
      y: 150,
      selected: true
    }
  ];

  return {
    branchLabel: definition.label,
    selectedOutcome,
    nodes,
    edges: [
      { id: "birth-turning", from: "birth", to: "turning", selected: true },
      { id: "turning-a", from: "turning", to: "pathA", selected: pathASelected },
      { id: "turning-b", from: "turning", to: "pathB", selected: pathBSelected },
      { id: "a-consequence", from: "pathA", to: "consequenceA", selected: pathASelected },
      { id: "b-consequence", from: "pathB", to: "consequenceB", selected: pathBSelected },
      { id: "a-conversation", from: "consequenceA", to: "conversation", selected: pathASelected },
      { id: "b-conversation", from: "consequenceB", to: "conversation", selected: pathBSelected }
    ]
  };
}
