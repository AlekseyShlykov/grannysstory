import type { BranchType, GameSessionState } from "../data/types";
import { branchDefinition, branchOutcomeLockForHistory } from "./biography";

export type LifePathNodeKind = "birth" | "choice";
export type LifePathStatus = "selected" | "alternative" | "locked";

export interface LifePathNode {
  id: string;
  parentId: string | null;
  kind: LifePathNodeKind;
  depth: number;
  year: number;
  label: string;
  summary: string;
  replayText: string;
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
  leafCount: number;
  nodes: LifePathNode[];
  edges: LifePathEdge[];
  width: number;
  height: number;
}

interface DraftNode extends Omit<LifePathNode, "x" | "y"> {
  children: DraftNode[];
  x: number;
  y: number;
}

function selectedOutcomes(state: GameSessionState): Map<BranchType, "pathA" | "pathB"> {
  return new Map(state.biography.branches
    .filter((branch) => branch.resolved && branch.outcome)
    .map((branch) => [branch.type, branch.outcome!.id] as const));
}

function outcomeCopy(type: BranchType, outcomeId: "pathA" | "pathB", selected: boolean, lockedReason: string | null) {
  const definition = branchDefinition(type);
  const title = outcomeId === "pathA" ? definition.titleA : definition.titleB;
  const question = outcomeId === "pathA" ? definition.questionA : definition.questionB;
  const answer = outcomeId === "pathA" ? definition.answerA : definition.answerB;
  const consequence = outcomeId === "pathA" ? definition.consequenceA : definition.consequenceB;
  return {
    label: title,
    replayText: `${title}. ${consequence}`,
    summary: selected
      ? `Вы спросили: «${question}» Она ответила: «${answer}» Позднее: ${consequence}`
      : lockedReason
        ? `Эта дорога стала недоступна. ${lockedReason}`
        : `Возможная другая жизнь. Вопрос: «${question}» Возможный ответ: «${answer}» Позднее: ${consequence}`
  };
}

/**
 * Builds every life that was still possible before the first answer. The actual outcome sequence is the only
 * solid route; all counterfactual continuations remain visible as dashed routes. Impossible combinations end
 * at a locked node instead of inventing a continuation that violates earlier canon.
 */
export function lifePathGraph(state: GameSessionState): LifePathGraph | null {
  const branches = [...state.biography.branches]
    .filter((branch) => branch.resolved && branch.outcome)
    .sort((a, b) => a.year - b.year);
  if (!branches.length) return null;

  const actual = selectedOutcomes(state);
  const root: DraftNode = {
    id: "birth",
    parentId: null,
    kind: "birth",
    depth: 0,
    year: state.selection.birthYear,
    label: "Рождение",
    summary: "Начало этой сгенерированной жизни.",
    replayText: `Она родилась в ${state.selection.birthYear} году.`,
    selected: true,
    status: "selected",
    children: [],
    x: 0,
    y: 0
  };

  const grow = (
    parent: DraftNode,
    branchIndex: number,
    history: Map<BranchType, "pathA" | "pathB">,
    selectedPrefix: boolean
  ) => {
    const branch = branches[branchIndex];
    if (!branch) return;
    for (const outcomeId of ["pathA", "pathB"] as const) {
      const lockedReason = branchOutcomeLockForHistory(branch, outcomeId, history);
      const selected = selectedPrefix && actual.get(branch.type) === outcomeId;
      const status: LifePathStatus = selected ? "selected" : lockedReason ? "locked" : "alternative";
      const copy = outcomeCopy(branch.type, outcomeId, selected, lockedReason);
      const prefix = `${parent.id}/${branch.type}:${outcomeId}`;
      const node: DraftNode = {
        id: prefix,
        parentId: parent.id,
        kind: "choice",
        depth: branchIndex + 1,
        year: branch.year,
        ...copy,
        selected,
        status,
        children: [],
        x: 0,
        y: 0
      };
      parent.children.push(node);
      if (!lockedReason) {
        const nextHistory = new Map(history);
        nextHistory.set(branch.type, outcomeId);
        grow(node, branchIndex + 1, nextHistory, selected);
      }
    }
  };
  grow(root, 0, new Map(), true);

  const terminalNodes: DraftNode[] = [];
  const collectTerminals = (node: DraftNode) => {
    if (!node.children.length) terminalNodes.push(node);
    else node.children.forEach(collectTerminals);
  };
  collectTerminals(root);

  // A fixed coordinate width lets the complete tree scale down as one picture on phones instead of becoming
  // a horizontally scrolling diagram. Leaves remain separate but labels are intentionally absent.
  const width = 760;
  const sidePadding = 30;
  const leafSpacing = terminalNodes.length > 1 ? (width - sidePadding * 2) / (terminalNodes.length - 1) : 0;
  terminalNodes.forEach((node, index) => { node.x = sidePadding + index * leafSpacing; });
  const placeParents = (node: DraftNode) => {
    node.children.forEach(placeParents);
    if (node.children.length) node.x = node.children.reduce((sum, child) => sum + child.x, 0) / node.children.length;
    node.y = 38 + node.depth * 86;
  };
  placeParents(root);

  const nodes: LifePathNode[] = [];
  const edges: LifePathEdge[] = [];
  const flatten = (node: DraftNode) => {
    const { children, ...view } = node;
    nodes.push(view);
    for (const child of children) {
      edges.push({
        id: `${node.id}->${child.id}`,
        from: node.id,
        to: child.id,
        selected: child.selected,
        status: child.status
      });
      flatten(child);
    }
  };
  flatten(root);

  return {
    branchCount: branches.length,
    leafCount: terminalNodes.length,
    nodes,
    edges,
    width,
    height: 38 + branches.length * 86 + 38
  };
}

export function selectedLifeSteps(state: GameSessionState): LifePathNode[] {
  const graph = lifePathGraph(state);
  if (!graph) return [];
  return graph.nodes.filter((node) => node.selected).sort((a, b) => a.depth - b.depth);
}
