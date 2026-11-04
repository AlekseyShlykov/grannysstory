import { describe, expect, it } from "vitest";
import { generateSession, commitBranch } from "../src/engine/biography";
import { lifePathGraph } from "../src/engine/lifePaths";
import { selection } from "./helpers";
import { packFor } from "./worldHelpers";

describe("final life path graph", () => {
  it.each(["pathA", "pathB"] as const)("shows both possibilities and marks only %s as selected", (outcome) => {
    const start = selection("tver", 1920, `graph-${outcome}`);
    const state = commitBranch(generateSession(start, packFor("tver")), outcome);
    const graph = lifePathGraph(state)!;

    expect(graph).not.toBeNull();
    expect(graph.nodes.find((node) => node.id === outcome)?.selected).toBe(true);
    expect(graph.nodes.find((node) => node.id === (outcome === "pathA" ? "pathB" : "pathA"))?.selected).toBe(false);
    expect(graph.nodes.filter((node) => node.kind === "choice")).toHaveLength(2);
    expect(graph.edges.filter((edge) => edge.id.startsWith("turning-") && edge.selected)).toHaveLength(1);
    expect(graph.nodes.find((node) => node.id === outcome)?.summary).toContain("Вы спросили");
  });

  it("does not reveal a graph before the turning point is resolved", () => {
    const start = selection("tver", 1920, "graph-open");
    expect(lifePathGraph(generateSession(start, packFor("tver")))).toBeNull();
  });
});
