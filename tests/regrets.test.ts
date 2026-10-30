import { beforeAll, describe, expect, it } from "vitest";
import top7 from "../data/research/sprouht_regrets_top7.json";
import { reflectionQuestions, regretArchetypes } from "../content/scenes/regretArchetypes";
import type { BranchType, ChildrenStatus, GameSessionState } from "../src/data/types";
import { knownAtlasEvents, laterInterpretation } from "../src/engine/atlas";
import { biographyIssues, commitBranch, generateSession } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { partnershipSpan } from "../src/engine/memory/lifeFacts";
import { parseSave, serializeSave } from "../src/engine/persistence";
import { eligibleArchetypes, reflectionFacts, reflectionPoint } from "../src/engine/regrets";
import { selection } from "./helpers";
import { loadWholeWorld, packFor, playToEnd } from "./worldHelpers";

beforeAll(() => {
  loadWholeWorld();
});

const generated = (region: string, year: number, seed: string) => generateSession(selection(region, year, seed), packFor(region));

function find(predicate: (state: GameSessionState) => boolean, label: string, region = "tver"): GameSessionState {
  for (let index = 0; index < 3000; index += 1) {
    const state = generated(region, 1900 + (index % 41), `${label}-${index}`);
    if (predicate(state)) return state;
  }
  throw new Error(`no life for ${label}`);
}
const withBranch = (type: BranchType) => (state: GameSessionState) => state.biography.branches[0]?.type === type;
const withChildren = (status: ChildrenStatus) => (state: GameSessionState) => state.biography.relationship.childrenStatus === status;
const reflectionTurns = (state: GameSessionState) => state.dialogue.transcript.filter((turn) => turn.speaker === "player" && (reflectionQuestions as readonly string[]).includes(turn.text));
const archetype = (state: GameSessionState) => regretArchetypes.find((candidate) => candidate.id === state.biography.lateLifeReflection?.archetypeId)!;

describe("research status", () => {
  it("ships provisional clusters with no invented counts or ranking", () => {
    expect(top7.status).toBe("provisional");
    expect(top7.clusters).toHaveLength(7);
    for (const cluster of top7.clusters) {
      expect(cluster.respondent_count).toBeNull();
      expect(cluster.share_of_regret_respondents).toBeNull();
      expect(cluster.rank).toBeNull();
    }
    // Original lines only: no quotation marks around speech, no percentages or numbers dressed as findings.
    for (const candidate of regretArchetypes) expect(candidate.speech(reflectionFacts(generated("tver", 1930, "facts")))).not.toMatch(/%|\d/);
  });
});

describe("the late-life conversation", () => {
  it("happens exactly once, between 80 and 90, through natural questions", () => {
    for (let index = 0; index < 12; index += 1) {
      const state = playToEnd(generated(["tver", "fr-paris", "us-chicago", "pl-warszawa"][index % 4]!, 1900 + index * 3, `once-${index}`), index % 2 ? "pathA" : "pathB");
      expect(reflectionTurns(state)).toHaveLength(1);
      const reflection = state.biography.lateLifeReflection!;
      expect(reflection.age).toBeGreaterThanOrEqual(80);
      expect(reflection.age).toBeLessThanOrEqual(90);
      expect(reflection.omittedReason).toBeUndefined();
      expect(reflectionPoint(state).point.year).toBe(reflection.year);
      expect(biographyIssues(state)).toEqual([]);
    }
  });

  it("offers the questions only at that point and never again after the answer is locked", () => {
    let state = generated("tver", 1935, "locked-reflection");
    const atPoint = reflectionPoint(state).point;
    while (!currentScene(state).options.some((option) => option.id.startsWith("reflect-"))) {
      expect(state.screen).toBe("conversation");
      const options = currentScene(state).options;
      state = chooseOption(state, options.find((option) => option.id === "pathA")?.id ?? options[0]!.id);
    }
    expect(lifeTimelinePointYear(state)).toBe(atPoint.year);
    state = chooseOption(state, "reflect-1");
    const locked = state.biography.lateLifeReflection!;
    expect(currentScene(state).options.some((option) => option.id.startsWith("reflect-"))).toBe(false);
    const done = playToEnd(state, "pathA");
    expect(done.biography.lateLifeReflection).toEqual(locked);
    // The atlas shows the actual event and the later view of it, never an alternative life.
    expect(knownAtlasEvents(done).some((event) => event.id === "life:late-reflection")).toBe(true);
    for (const id of locked.relatedEventIds) expect(laterInterpretation(done, id)).toBe(locked.summary);
    expect(parseSave(serializeSave(done))!.biography.lateLifeReflection).toEqual(locked);
  });

  it("ties a regret only to events of this life", () => {
    for (let index = 0; index < 40; index += 1) {
      const state = playToEnd(generated("tver", 1900 + index, `real-${index}`), index % 2 ? "pathA" : "pathB");
      const reflection = state.biography.lateLifeReflection!;
      const ids = new Set(state.biography.lifeEvents.map((event) => event.id));
      for (const id of reflection.relatedEventIds) expect(ids.has(id), id).toBe(true);
      // Archetypes about a turning point always name its decision, which is a known event.
      if (archetype(state).eligible.toString().includes("outcome(")) expect(reflection.relatedEventIds.some((id) => id.endsWith(":decision"))).toBe(true);
    }
  });
});

describe("earlier choices shape the reflection", () => {
  it.each(["migration", "friendship", "marriage", "familyResponsibility", "dream", "profession"] as const)("the %s turning point changes what she can regret", (type) => {
    const state = find(withBranch(type), `choice-${type}`);
    const ids = (outcome: "pathA" | "pathB") => new Set(eligibleArchetypes(reflectionFacts(commitBranch(state, outcome))).map((candidate) => candidate.id));
    const a = ids("pathA");
    const b = ids("pathB");
    expect([...a].some((id) => !b.has(id)) || [...b].some((id) => !a.has(id))).toBe(true);
  });

  it("a grandmother who moved can regret leaving, or be grateful for it", () => {
    const outcomes = new Set<string>();
    for (let index = 0; index < 600 && !(outcomes.has("left_home_missed_mother") && outcomes.has("left_home_grateful")); index += 1) {
      const state = generated("tver", 1900 + (index % 41), `moved-${index}`);
      if (state.biography.branches[0]?.type !== "migration") continue;
      const done = playToEnd(state, "pathA");
      if (done.biography.residenceHistory.length < 2) continue;
      outcomes.add(done.biography.lateLifeReflection!.archetypeId);
    }
    expect([...outcomes].some((id) => id === "left_home_missed_mother")).toBe(true);
    expect([...outcomes].some((id) => id === "left_home_grateful")).toBe(true);
  });

  it("a grandmother who did not make up with her friend can regret it; one who did cannot", () => {
    const state = find(withBranch("friendship"), "friend");
    expect(eligibleArchetypes(reflectionFacts(commitBranch(state, "pathB"))).map((candidate) => candidate.id)).toContain("unreconciled_friend");
    expect(eligibleArchetypes(reflectionFacts(commitBranch(state, "pathA"))).map((candidate) => candidate.id)).not.toContain("unreconciled_friend");
  });

  it("reflects the earlier choice accurately at 85 and keeps the timeline free of contradictions", () => {
    for (const outcome of ["pathA", "pathB"] as const) {
      const done = playToEnd(find((state) => withBranch("friendship")(state) && state.selection.birthYear % 5 === 0 && state.selection.birthYear <= 1935, "eighty-five"), outcome);
      const decision = done.biography.lifeEvents.find((event) => event.id === "life:friendship:decision")!;
      expect(decision.title).toBe(outcome === "pathA" ? "Написала подруге" : "Не стала мириться");
      const reflection = done.biography.lateLifeReflection!;
      if (outcome === "pathA") expect(reflection.archetypeId).not.toBe("unreconciled_friend");
      if (reflection.archetypeId === "reconciled_friend_grateful") expect(outcome).toBe("pathA");
      expect(biographyIssues(done)).toEqual([]);
    }
  });
});

describe("childlessness, partners and kinship", () => {
  it("never makes chosen childlessness a regret", () => {
    for (const status of ["chose_no_children", "no_strong_preference", "mentor_without_children"] as const) {
      const state = find(withChildren(status), `childless-${status}`);
      const ids = eligibleArchetypes(reflectionFacts(state)).map((candidate) => candidate.id);
      expect(ids).not.toContain("children_postponed");
      expect(ids).not.toContain("children_wanted_not_regret");
      const done = playToEnd(state, "pathA");
      expect(done.dialogue.transcript.filter((turn) => turn.speaker === "grandmother").map((turn) => turn.text).join(" ")).not.toMatch(/жалею[^.]*дет/i);
    }
  });

  it("lets a grandmother who postponed children feel both ways, and one who could not have them grieve without blame", () => {
    const postponed = eligibleArchetypes(reflectionFacts(find(withChildren("circumstances_changed"), "postponed")));
    expect(postponed.find((candidate) => candidate.id === "children_postponed")?.stance).toBe("mixed");
    const wanted = eligibleArchetypes(reflectionFacts(find(withChildren("wanted_no_children"), "wanted")));
    const grief = wanted.find((candidate) => candidate.id === "children_wanted_not_regret")!;
    expect(grief.stance).toBe("grief_without_regret");
    expect(grief.qualities.regret).toBe(false);
  });

  it("never speaks of a husband to a grandmother who had no partner", () => {
    const single = find((state) => withBranch("marriage")(state), "single");
    const unmarried = commitBranch(single, "pathB");
    expect(partnershipSpan(unmarried)).toBeNull();
    const ids = eligibleArchetypes(reflectionFacts(unmarried)).map((candidate) => candidate.id);
    expect(ids).not.toContain("married_after_the_quarrel");
    const done = playToEnd(single, "pathB");
    expect(done.dialogue.transcript.at(-1)!.text).not.toMatch(/\bмуж\b/);
  });

  it("works for a great-aunt whose closest people are not her descendants", () => {
    const aunt = playToEnd(find((state) => state.biography.relationship.variant === "great_aunt", "aunt"), "pathA");
    expect(aunt.biography.relationship.hasOwnChildren).toBe(false);
    expect(aunt.biography.lateLifeReflection).toBeDefined();
    expect(reflectionTurns(aunt)).toHaveLength(1);
    expect(biographyIssues(aunt)).toEqual([]);
  });
});

describe("emotional range", () => {
  it("includes mixed feelings and sincere answers without a major regret", () => {
    const stances = new Map<string, number>();
    let mixedQualities = 0;
    for (let index = 0; index < 120; index += 1) {
      const done = playToEnd(generated(["tver", "fr-lyon", "gb-london"][index % 3]!, 1900 + (index % 41), `range-${index}`), index % 2 ? "pathA" : "pathB");
      const reflection = done.biography.lateLifeReflection!;
      stances.set(reflection.stance, (stances.get(reflection.stance) ?? 0) + 1);
      if (reflection.qualities.regret && (reflection.qualities.gratitude || reflection.qualities.pride)) mixedQualities += 1;
    }
    expect(stances.get("no_major_regret") ?? 0).toBeGreaterThan(5);
    expect((stances.get("mixed") ?? 0) + (stances.get("regret") ?? 0)).toBeGreaterThan(20);
    expect(mixedQualities).toBeGreaterThan(10);
    // No answer is a single dominant moral: several stances occur.
    expect(stances.size).toBeGreaterThanOrEqual(3);
  });
});

function lifeTimelinePointYear(state: GameSessionState): number {
  return state.selection.birthYear + state.dialogue.step * 5;
}
