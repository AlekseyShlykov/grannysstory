import { describe, expect, it } from "vitest";
import { generateSession, commitBranch } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { lifePathGraph, selectedLifeSteps } from "../src/engine/lifePaths";
import { selection } from "./helpers";
import { packFor } from "./worldHelpers";

describe("final life path graph", () => {
  it.each(["pathA", "pathB"] as const)("shows both possibilities and marks only %s as selected", (outcome) => {
    const start = selection("tver", 1920, `graph-${outcome}`);
    const state = commitBranch(generateSession(start, packFor("tver")), outcome);
    const graph = lifePathGraph(state)!;
    const selected = graph.nodes.find((node) => node.depth === 1 && node.selected)!;
    const alternative = graph.nodes.find((node) => node.depth === 1 && !node.selected)!;

    expect(graph).not.toBeNull();
    expect(selected.id).toContain(`:${outcome}`);
    expect(alternative.id).toContain(`:${outcome === "pathA" ? "pathB" : "pathA"}`);
    expect(graph.nodes.filter((node) => node.kind === "choice")).toHaveLength(2);
    expect(graph.edges.filter((edge) => edge.selected)).toHaveLength(1);
    expect(selected.summary).toContain("Вы спросили");
  });

  it("does not reveal a graph before the turning point is resolved", () => {
    const start = selection("tver", 1920, "graph-open");
    expect(lifePathGraph(generateSession(start, packFor("tver")))).toBeNull();
  });

  it("shows every disclosed turning point and keeps a path closed by an earlier choice visible", () => {
    const start = selection("tver", 1920, "graph-many-branches");
    let state = generateSession(start, packFor("tver"));
    for (let guard = 0; state.screen !== "atlas" && guard < 80; guard += 1) {
      const options = currentScene(state).options;
      state = chooseOption(state, options.find((option) => option.id === "pathB")?.id ?? options[0]!.id);
    }

    expect(state.screen).toBe("atlas");
    expect(state.biography.branches.filter((branch) => branch.resolved)).toHaveLength(6);
    const graph = lifePathGraph(state)!;
    expect(graph.branchCount).toBe(6);
    expect(graph.leafCount).toBeGreaterThan(30);
    expect(graph.nodes.filter((node) => node.kind === "choice").length).toBeGreaterThan(60);
    expect(graph.nodes.filter((node) => node.kind === "choice" && node.selected)).toHaveLength(6);
    expect(graph.nodes.some((node) => node.status === "locked" && node.id.endsWith(":pathA"))).toBe(true);
    expect(graph.width).toBe(760);
    expect(Math.max(...graph.nodes.map((node) => node.x))).toBeLessThanOrEqual(graph.width);
    for (const firstOutcome of graph.nodes.filter((node) => node.depth === 1)) {
      expect(graph.edges.filter((edge) => edge.from === firstOutcome.id)).toHaveLength(2);
    }
    expect(selectedLifeSteps(state)).toHaveLength(7);
    for (const branch of state.biography.branches) {
      const consequence = state.biography.lifeEvents.find((event) => event.id === `life:${branch.type}:consequence`);
      expect(consequence?.year).toBeGreaterThan(branch.year);
      expect(consequence?.year).toBeLessThanOrEqual(state.selection.conversationYear);
    }
  });
});
