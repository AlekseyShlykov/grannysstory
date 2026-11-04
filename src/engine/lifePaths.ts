import type { GameSessionState } from "../data/types";
import { branchDefinition, branchOutcomeLock } from "./biography";

export type LifePathNodeKind = "birth" | "turning" | "choice" | "conversation";
export type LifePathStatus = "selected" | "alternative" | "locked";

export interface LifePathNode {
  id: string;
  kind: LifePathNodeKind;
  year: number;
  label: string;
  summary: string;
  x: number;
  y: number;
  selected: boolean;
  status: LifePathStatus;
}

export interface LifePathEdge {
  id: string;
  from: string;
  to: string;
  selected: boolean;
  status: LifePathStatus;
}

export interface LifePathGraph {
  branchCount: number;
  nodes: LifePathNode[];
  edges: LifePathEdge[];
  height: number;
}

/**
 * The selected life is a vertical spine. Every disclosed turning point keeps both reviewed possibilities:
 * the chosen road, the road that was not taken, and (when earlier canon closed it) an explicitly locked road.
 */
export function lifePathGraph(state: GameSessionState): LifePathGraph | null {
  const branches = [...state.biography.branches]
    .filter((branch) => branch.resolved && branch.outcome)
    .sort((a, b) => a.year - b.year);
  if (!branches.length) return null;

  const nodes: LifePathNode[] = [{
    id: "birth",
    kind: "birth",
    year: state.selection.birthYear,
    label: "Рождение",
    summary: "Начало этой сгенерированной жизни.",
    x: 450,
    y: 58,
    selected: true,
    status: "selected"
  }];
  const edges: LifePathEdge[] = [];
  let previousSelectedId = "birth";
  const firstY = 190;
  const rowHeight = 205;

  branches.forEach((branch, index) => {
    const definition = branchDefinition(branch.type);
    const y = firstY + index * rowHeight;
    const turningId = `${branch.id}:turning`;
    const pathAId = `${branch.id}:pathA`;
    const pathBId = `${branch.id}:pathB`;
    const selectedOutcome = branch.outcome!.id;
    nodes.push({
      id: turningId,
      kind: "turning",
      year: branch.year,
      label: definition.label,
      summary: `Поворотная точка. ${definition.setup}`,
      x: 450,
      y,
      selected: true,
      status: "selected"
    });
    edges.push({ id: `${previousSelectedId}:${turningId}`, from: previousSelectedId, to: turningId, selected: true, status: "selected" });

    for (const outcomeId of ["pathA", "pathB"] as const) {
      const selected = selectedOutcome === outcomeId;
      const lockedReason = selected ? null : branchOutcomeLock(state, branch.id, outcomeId);
      const status: LifePathStatus = selected ? "selected" : lockedReason ? "locked" : "alternative";
      const title = outcomeId === "pathA" ? definition.titleA : definition.titleB;
      const question = outcomeId === "pathA" ? definition.questionA : definition.questionB;
      const answer = outcomeId === "pathA" ? definition.answerA : definition.answerB;
      const consequence = outcomeId === "pathA" ? definition.consequenceA : definition.consequenceB;
      const id = outcomeId === "pathA" ? pathAId : pathBId;
      nodes.push({
        id,
        kind: "choice",
        year: branch.year,
        label: title,
        summary: selected
          ? `Вы спросили: «${question}» Она ответила: «${answer}» Позднее: ${consequence}`
          : lockedReason
            ? `Эта дорога стала недоступна. ${lockedReason} Возможный поворот был бы таким: ${title}.`
            : `Другая возможная дорога. Вопрос: «${question}» Возможный ответ: «${answer}» Позднее: ${consequence}`,
        x: outcomeId === "pathA" ? 245 : 655,
        y: y + 92,
        selected,
        status
      });
      edges.push({ id: `${turningId}:${id}`, from: turningId, to: id, selected, status });
    }
    previousSelectedId = selectedOutcome === "pathA" ? pathAId : pathBId;
  });

  const conversationY = firstY + branches.length * rowHeight + 22;
  nodes.push({
    id: "conversation",
    kind: "conversation",
    year: state.selection.conversationYear,
    label: "Этот разговор",
    summary: "Здесь выбранные дороги стали известной вам частью её истории.",
    x: 450,
    y: conversationY,
    selected: true,
    status: "selected"
  });
  edges.push({ id: `${previousSelectedId}:conversation`, from: previousSelectedId, to: "conversation", selected: true, status: "selected" });

  return { branchCount: branches.length, nodes, edges, height: conversationY + 80 };
}
