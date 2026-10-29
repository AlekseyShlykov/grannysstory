import { describe, expect, it } from "vitest";
import { manifest, regionPacks } from "../src/data/catalog";
import { biographyIssues, commitBranch, generateSession } from "../src/engine/biography";
import { selection } from "./helpers";
import type { RegionId } from "../src/data/types";

describe("5000 biography simulations", () => {
  it.each(manifest.regions.map((region) => region.id))("runs 1000 coherent lives for %s", (region) => {
    const signatures = new Set<string>();
    const kinshipVariants = new Set<string>();
    const childlessVariants = new Set<string>();
    for (let index = 0; index < 1000; index += 1) {
      const year = 1920 + (index % 21);
      const start = selection(region as RegionId, year, `${region}-simulation-${index}`);
      const state = generateSession(start, regionPacks[start.birthRegionId]);
      const resolved = commitBranch(state, index % 2 ? "pathA" : "pathB");
      expect(biographyIssues(resolved), `simulation ${region}/${index}`).toEqual([]);
      const grandmother = resolved.biography.people.find((person) => person.id === "grandmother");
      signatures.add(`${grandmother?.name}|${resolved.biography.branches[0]?.type}|${resolved.biography.branches[0]?.outcome?.id}`);
      kinshipVariants.add(resolved.biography.relationship.variant);
      if (!resolved.biography.relationship.hasOwnChildren) childlessVariants.add(resolved.biography.relationship.childrenStatus);
    }
    expect(signatures.size).toBeGreaterThan(40);
    expect(kinshipVariants).toEqual(new Set(["biological_grandmother", "adoptive_grandmother", "great_aunt", "cousin_grandmother"]));
    expect(childlessVariants).toEqual(new Set(["chose_no_children", "wanted_no_children", "circumstances_changed", "no_strong_preference", "mentor_without_children"]));
  });
});
