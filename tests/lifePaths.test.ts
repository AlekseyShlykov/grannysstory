import { describe, expect, it } from "vitest";
import { generateSession, commitBranch } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { lifePathGraph } from "../src/engine/lifePaths";
import { selection } from "./helpers";
import { packFor } from "./worldHelpers";

describe("final life path graph", () => {
  it.each(["pathA", "pathB"] as const)("shows both possibilities and marks only %s as selected", (outcome) => {
    const start = selection("tver", 1920, `graph-${outcome}`);
    const state = commitBranch(generateSession(start, packFor("tver")), outcome);
    const graph = lifePathGraph(state)!;
    const branchId = state.biography.branches[0]!.id;

    expect(graph).not.toBeNull();
    expect(graph.nodes.find((node) => node.id === `${branchId}:${outcome}`)?.selected).toBe(true);
    expect(graph.nodes.find((node) => node.id === `${branchId}:${outcome === "pathA" ? "pathB" : "pathA"}`)?.selected).toBe(false);
    expect(graph.nodes.filter((node) => node.kind === "choice")).toHaveLength(2);
    expect(graph.edges.filter((edge) => edge.from === `${branchId}:turning` && edge.selected)).toHaveLength(1);
    expect(graph.nodes.find((node) => node.id === `${branchId}:${outcome}`)?.summary).toContain("Вы спросили");
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
    expect(graph.nodes.filter((node) => node.kind === "choice")).toHaveLength(12);
    expect(graph.nodes.some((node) => node.status === "locked" && node.id.endsWith(":pathA"))).toBe(true);
    for (const branch of state.biography.branches) {
      const consequence = state.biography.lifeEvents.find((event) => event.id === `life:${branch.type}:consequence`);
      expect(consequence?.year).toBeGreaterThan(branch.year);
      expect(consequence?.year).toBeLessThanOrEqual(state.selection.conversationYear);
    }
  });
});
