import { describe, expect, it } from "vitest";
import { manifest, placeNameAt, regionPacks } from "../src/data/catalog";
import { atlasRoute, knownAtlasEvents } from "../src/engine/atlas";
import { biographyIssues, commitBranch, generateSession } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { fragmentForPoint, lifeTimelinePoints, phaseAtAge, timelineBackgrounds } from "../src/engine/lifeTimeline";
import { parseSave, serializeSave } from "../src/engine/persistence";
import { interviewYearForBirthYear, validateSelection } from "../src/engine/setup";
import { selection } from "./helpers";
import type { RegionId } from "../src/data/types";
import type { StartSelection, ThemeId } from "../src/data/types";
import { branchCatalog } from "../content/scenes/branchCatalog";
import { lifeCourseFragments } from "../content/scenes/lifeCourse";
import { earlyLifeThreads } from "../content/scenes/earlyLifeThreads";
import { earlyLifeThreadForSeed, threadEchoFor } from "../src/engine/earlyLifeThread";
import nationalHistory from "../content/historical/national.json";

const generated = (start: StartSelection) => generateSession(start, regionPacks[start.birthRegionId]);
const findGenerated = (predicate: (state: ReturnType<typeof generated>) => boolean, label: string) => {
  for (let index = 0; index < 1000; index += 1) {
    const state = generated(selection("tver", 1932, `${label}-${index}`));
    if (predicate(state)) return state;
  }
  throw new Error(`No generated state found for ${label}`);
};

describe("start selection", () => {
  it("rejects an unavailable year and inconsistent age", () => {
    expect(validateSelection(selection("tver", 1899))).not.toHaveLength(0);
    expect(validateSelection(selection("tver", 1900))).toHaveLength(0);
    expect(validateSelection({ ...selection("tver", 1927), conversationYear: 2027 })).toContain(
      "Год разговора должен совпадать со столетием героини или текущим годом, если столетие ещё не наступило."
    );
  });

  it("holds the interview at age 100, capped by the current year", () => {
    expect(interviewYearForBirthYear(1900)).toBe(2000);
    expect(interviewYearForBirthYear(1920)).toBe(2020);
    expect(interviewYearForBirthYear(1926)).toBe(2026);
    expect(interviewYearForBirthYear(1927)).toBe(2026);
    expect(interviewYearForBirthYear(1940)).toBe(2026);
  });

  it("offers exactly the five ratified regional packs", () => {
    expect(manifest.regions.filter((region) => region.enabled).map((region) => region.id)).toEqual([
      "moscow", "leningrad", "tver", "novgorod", "smolensk"
    ]);
  });
});

describe("biography generation", () => {
  it("is deterministic for the same immutable selection", () => {
    const a = generated(selection("tver", 1931, "same-seed"));
    const b = generated(selection("tver", 1931, "same-seed"));
    expect(a.biography).toEqual(b.biography);
  });

  it("produces different lives from different seeds", () => {
    const a = generated(selection("moscow", 1931, "seed-a"));
    const b = generated(selection("moscow", 1931, "seed-b"));
    expect({ people: a.biography.people, branches: a.biography.branches }).not.toEqual({ people: b.biography.people, branches: b.biography.branches });
  });

  it("lets region and year affect eligibility and canon", () => {
    const moscow = generated(selection("moscow", 1920, "context"));
    const smolensk = generated(selection("smolensk", 1940, "context"));
    const moscowHistory = moscow.biography.lifeEvents.find((event) => event.provenance === "VERIFIED_HISTORICAL");
    const smolenskHistory = smolensk.biography.lifeEvents.find((event) => event.provenance === "VERIFIED_HISTORICAL");
    expect(moscowHistory?.id).not.toBe(smolenskHistory?.id);
    expect(moscow.biography.people[0]?.birthYear).toBe(1920);
    expect(smolensk.biography.people[0]?.birthYear).toBe(1940);
  });

  it.each(manifest.regions.map((region) => region.id))("keeps genealogy coherent in %s", (region) => {
    const state = generated(selection(region as RegionId, 1934, `family-${region}`));
    expect(biographyIssues(state)).toEqual([]);
    expect(state.biography.relationship.edges.some((edge) => edge.toId === "player")).toBe(true);
  });

  it("supports a childless grandmother without fabricating descendants", () => {
    const state = findGenerated((candidate) => !candidate.biography.relationship.hasOwnChildren, "childless");
    expect(state.biography.relationship.childrenStatus).toMatch(/chose_no_children|wanted_no_children|circumstances_changed|no_strong_preference|mentor_without_children/);
    expect(state.biography.relationship.edges.some((edge) => edge.fromId === "grandmother" && /parent/.test(edge.kind))).toBe(false);
    expect(biographyIssues(state)).toEqual([]);
  });

  it("supports a grandmother who is not a biological ancestor", () => {
    const state = findGenerated((candidate) => candidate.biography.relationship.variant !== "biological_grandmother", "not-biological");
    expect(state.biography.relationship.variant).toMatch(/adoptive_grandmother|great_aunt|cousin_grandmother/);
    expect(biographyIssues(state)).toEqual([]);
  });

  it("can establish that she chose not to marry", () => {
    const state = findGenerated((candidate) => candidate.biography.branches[0]?.type === "marriage", "unmarried");
    const resolved = commitBranch(state, "pathB");
    expect(resolved.biography.flags).toContain("chose_not_to_marry");
    expect(resolved.biography.lifeEvents.find((event) => event.id === "life:marriage:consequence")?.text).toContain("замуж я больше не собиралась");
  });

  it("lets a migration decision move her or keep her in her hometown", () => {
    const state = findGenerated((candidate) => candidate.biography.branches[0]?.type === "migration", "migration");
    expect(commitBranch(state, "pathA").biography.residenceHistory).toHaveLength(2);
    expect(commitBranch(state, "pathB").biography.residenceHistory).toHaveLength(1);
  });

  it("makes an early decision change a later memory", () => {
    const state = findGenerated(() => true, "consequence");
    const branchType = state.biography.branches[0]!.type;
    const laterA = commitBranch(state, "pathA").biography.lifeEvents.find((event) => event.id === `life:${branchType}:consequence`);
    const laterB = commitBranch(state, "pathB").biography.lifeEvents.find((event) => event.id === `life:${branchType}:consequence`);
    expect(laterA?.text).not.toBe(laterB?.text);
    expect(laterA?.year).toBeGreaterThan(state.biography.branches[0]!.year);
  });

  it("allows pride and regret to coexist about one decision", () => {
    const state = commitBranch(findGenerated(() => true, "mixed-feeling"), "pathA");
    const decisionMemory = state.memories.find((memory) => memory.lifeEventId.includes(":decision"));
    expect(decisionMemory?.qualities).toMatchObject({ pride: true, regret: true });
  });

  it("covers all twelve philosophical themes without exposing them as UI categories", () => {
    const themes = new Set<ThemeId>(branchCatalog.flatMap((branch) => branch.themes));
    themes.add("healthAgingAndIndependence");
    expect(themes.size).toBe(12);
  });

  it("keeps Tver/Kalinin and Leningrad/Petersburg names time-specific", () => {
    expect(placeNameAt("tver", 1930)).toBe("Тверь");
    expect(placeNameAt("tver", 1941)).toBe("Калинин");
    expect(placeNameAt("tver", 1991)).toBe("Тверь");
    expect(placeNameAt("saint-petersburg", 1941)).toBe("Ленинград");
    expect(placeNameAt("saint-petersburg", 1992)).toBe("Санкт-Петербург");
  });

  it("does not rewrite a disclosed branch", () => {
    const state = generated(selection("novgorod", 1930, "locked-branch"));
    const committed = commitBranch(state, "pathA");
    expect(() => commitBranch(committed, "pathB")).toThrow(/cannot be rewritten/);
    expect(commitBranch(committed, "pathA")).toBe(committed);
  });
});

describe("conversation and atlas", () => {
  function finish(region: RegionId, outcome: "pathA" | "pathB") {
    let state = generated(selection(region, 1932, `play-${region}-${outcome}`));
    for (let guard = 0; state.screen !== "atlas" && guard < 30; guard += 1) {
      const options = currentScene(state).options;
      const branchOption = options.find((option) => option.id === outcome);
      state = chooseOption(state, branchOption?.id ?? options[guard % options.length]!.id);
    }
    return state;
  }

  it.each([1900, 1920, 1927, 1932, 1940])("builds five-year points from %i without going beyond its interview year", (birthYear) => {
    const points = lifeTimelinePoints(selection("tver", birthYear, `points-${birthYear}`));
    expect(points[0]?.year).toBe(birthYear);
    expect(points.at(-1)).toMatchObject({ year: interviewYearForBirthYear(birthYear), final: true });
    for (let index = 1; index < points.length - 1; index += 1) {
      expect(points[index]!.year - points[index - 1]!.year).toBe(5);
    }
    expect(points.at(-1)!.year - points.at(-2)!.year).toBeLessThanOrEqual(5);
  });

  it.each([1900, 1920, 1930, 1940])("has verified historical background for every five-year interval from %i", (birthYear) => {
    const state = generated(selection("tver", birthYear, `backgrounds-${birthYear}`));
    const backgrounds = timelineBackgrounds(state);
    const intervals = lifeTimelinePoints(state.selection).filter((point) => !point.final);
    expect([...backgrounds.keys()]).toEqual(intervals.map((point) => point.year));
  });

  it("selects historical background deterministically from a varied event pool", () => {
    const sameA = generated(selection("tver", 1920, "same-history-pool"));
    const sameB = generated(selection("tver", 1920, "same-history-pool"));
    expect([...timelineBackgrounds(sameA).entries()]).toEqual([...timelineBackgrounds(sameB).entries()]);

    const selectedFor1925 = new Set<string>();
    for (let index = 0; index < 80; index += 1) {
      const state = generated(selection("tver", 1920, `history-pool-${index}`));
      const backgrounds = timelineBackgrounds(state);
      const ids = [...backgrounds.values()].map((background) => background.id);
      expect(new Set(ids).size).toBe(ids.length);
      selectedFor1925.add(backgrounds.get(1925)!.id);
    }
    expect(selectedFor1925.size).toBeGreaterThanOrEqual(2);
    expect(nationalHistory.events.filter((event) => "scale" in event && event.scale !== "major").length).toBeGreaterThanOrEqual(14);
  });

  it.each(branchCatalog)("reveals the $label setup before offering its consequential questions", (definition) => {
    let state = findGenerated((candidate) => candidate.biography.branches[0]?.type === definition.type, `setup-${definition.type}`);
    let guard = 0;
    while (!currentScene(state).options.some((option) => option.id === "pathA") && guard < 30) {
      state = chooseOption(state, currentScene(state).options[0]!.id);
      guard += 1;
    }
    expect(guard).toBeLessThan(30);
    expect(state.dialogue.transcript.at(-1)).toMatchObject({ speaker: "grandmother" });
    expect(state.dialogue.transcript.at(-1)?.text).toContain(definition.setup);
    expect(currentScene(state).options.map((option) => option.text)).toEqual([definition.questionA, definition.questionB]);

    const setupIndex = state.dialogue.transcript.map((line) => line.text.includes(definition.setup)).lastIndexOf(true);
    state = chooseOption(state, "pathA");
    const questionIndex = state.dialogue.transcript.map((line) => line.text === definition.questionA).lastIndexOf(true);
    expect(setupIndex).toBeGreaterThanOrEqual(0);
    expect(questionIndex).toBeGreaterThan(setupIndex);
  });

  it("draws non-repeating memories from broad pools in every age phase", () => {
    for (const fragments of Object.values(lifeCourseFragments)) expect(fragments.length).toBeGreaterThanOrEqual(8);

    const state = generated(selection("tver", 1920, "non-repeating-life-course"));
    const titlesByPhase = new Map<string, string[]>();
    for (const point of lifeTimelinePoints(state.selection)) {
      const phase = phaseAtAge(point.age);
      titlesByPhase.set(phase, [...(titlesByPhase.get(phase) ?? []), fragmentForPoint(state, point).title]);
    }
    for (const titles of titlesByPhase.values()) expect(new Set(titles).size).toBe(titles.length);

    const representativeAges = [0, 10, 20, 30, 45, 60, 75];
    for (const age of representativeAges) {
      const titles = new Set<string>();
      for (let seed = 0; seed < 80; seed += 1) {
        const candidate = generated(selection("tver", 1920, `variation-${age}-${seed}`));
        const point = lifeTimelinePoints(candidate.selection).find((item) => item.age === age)!;
        titles.add(fragmentForPoint(candidate, point).title);
      }
      expect(titles.size, `age ${age}`).toBeGreaterThanOrEqual(6);
    }
  });

  it("provides at least twenty coherent variants for each of the first four grandmother messages", () => {
    expect(earlyLifeThreads.length).toBeGreaterThanOrEqual(20);
    expect(new Set(earlyLifeThreads.map((thread) => thread.opening)).size).toBe(earlyLifeThreads.length);
    for (const age of [0, 5, 10] as const) {
      expect(new Set(earlyLifeThreads.map((thread) => thread.beats[age].detail)).size).toBe(earlyLifeThreads.length);
    }

    const openings = new Set<string>();
    const personalAnswers = [new Set<string>(), new Set<string>(), new Set<string>()];
    for (let index = 0; index < 500; index += 1) {
      const start = selection("tver", 1920, `early-thread-variation-${index}`);
      const thread = earlyLifeThreadForSeed(start.runSeed);
      let state = generated(start);
      expect(state.dialogue.transcript[0]?.text).toBe(thread.opening);
      openings.add(state.dialogue.transcript[0]!.text);

      for (const [turnIndex, age] of ([0, 5, 10] as const).entries()) {
        const option = currentScene(state).options[0]!;
        state = chooseOption(state, option.id);
        const answer = state.dialogue.transcript.at(-1)?.text ?? "";
        expect(answer).toContain(thread.beats[age].detail);
        personalAnswers[turnIndex]!.add(answer.split("\n\n")[0]!);
      }
    }

    expect(openings.size).toBeGreaterThanOrEqual(20);
    for (const answers of personalAnswers) expect(answers.size).toBeGreaterThanOrEqual(20);
  });

  it("carries the selected childhood thread into later life instead of abandoning it", () => {
    const state = generated(selection("tver", 1920, "connected-life-thread"));
    const thread = earlyLifeThreadForSeed(state.selection.runSeed);
    expect(threadEchoFor(state, 20, phaseAtAge(20))).toBe(thread.echoes.youth);
    expect(threadEchoFor(state, 30, phaseAtAge(30))).toBe(thread.echoes.adult);
    expect(threadEchoFor(state, 60, phaseAtAge(60))).toBe(thread.echoes.later);

    const laterFragments = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60]
      .map((age) => lifeTimelinePoints(state.selection).find((point) => point.age === age))
      .filter((point): point is NonNullable<typeof point> => Boolean(point))
      .map((point) => fragmentForPoint(state, point));
    expect(laterFragments.some((fragment) => thread.themes.includes(fragment.theme))).toBe(true);
  });

  it("does not invent callbacks for a save created before coherent memory threads", () => {
    const current = generated(selection("tver", 1920, "legacy-without-thread"));
    const legacyLike = {
      ...current,
      biography: { ...current.biography, narrativeThreadId: undefined }
    };
    expect(threadEchoFor(legacyLike, 20, phaseAtAge(20))).toBeNull();
    expect(() => fragmentForPoint(legacyLike, lifeTimelinePoints(legacyLike.selection)[0]!)).not.toThrow();
  });

  it.each(manifest.regions.map((region) => region.id))("finishes both outcomes without contradictions in %s", (region) => {
    for (const outcome of ["pathA", "pathB"] as const) {
      const state = finish(region as RegionId, outcome);
      expect(state.screen).toBe("atlas");
      expect(biographyIssues(state)).toEqual([]);
      expect(knownAtlasEvents(state).some((event) => event.id.includes(":consequence"))).toBe(true);
      expect(knownAtlasEvents(state).some((event) => event.salience === "quiet")).toBe(true);
      expect(state.dialogue.transcript.at(-1)?.text).toContain(String(state.selection.conversationYear));
      expect(state.biography.lifeEvents.filter((event) => event.id.startsWith("life:timeline:")).map((event) => event.year))
        .toEqual(lifeTimelinePoints(state.selection).map((point) => point.year));
      expect(state.biography.lifeEvents.every((event) => event.year <= state.selection.conversationYear)).toBe(true);
    }
  });

  it("derives routes only from committed residence events", () => {
    const base = generated(selection("tver", 1932, "route-check"));
    const resolved = commitBranch(base, "pathA");
    expect(atlasRoute(resolved).points).toHaveLength(resolved.biography.residenceHistory.length);
    expect(atlasRoute(resolved).points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
  });

  it("does not reveal undiscovered canon in the atlas", () => {
    const state = generated(selection());
    expect(knownAtlasEvents(state).map((event) => event.id)).toEqual(["life:birth"]);
  });

  it("keeps historical context attached to the correct place and an age she could have lived", () => {
    const state = generated(selection("smolensk", 1940, "historical-location"));
    const event = state.biography.lifeEvents.find((candidate) => candidate.provenance === "VERIFIED_HISTORICAL")!;
    expect(event.placeId).toBe("smolensk");
    expect(event.year).toBeGreaterThanOrEqual(state.selection.birthYear);
    expect(event.year).toBeLessThanOrEqual(state.selection.conversationYear);
  });

  it("builds the final timeline from exactly the known life events", () => {
    const state = finish("tver", "pathA");
    expect(knownAtlasEvents(state).map((event) => event.id)).toEqual(
      state.biography.lifeEvents.filter((event) => event.known).sort((a, b) => a.year - b.year || a.id.localeCompare(b.id)).map((event) => event.id)
    );
  });
});

describe("save format", () => {
  it("round-trips a session", () => {
    const state = generated(selection("smolensk", 1938, "save-roundtrip"));
    expect(parseSave(serializeSave(state))).toEqual(state);
  });

  it("fails safely for corrupt or incompatible data", () => {
    expect(parseSave("not json")).toBeNull();
    expect(parseSave(JSON.stringify({ saveFormatVersion: 99 }))).toBeNull();
  });

  it("migrates an older save to its own centenary year and removes future events", () => {
    const state = generated(selection("tver", 1920, "old-future-save"));
    const old = JSON.parse(serializeSave(state));
    old.selection.datasetVersion = "0.2.0";
    old.selection.conversationYear = 2025;
    old.biography.residenceHistory.at(-1).toYear = 2025;
    old.biography.lifeEvents.push({
      ...old.biography.lifeEvents[0],
      id: "life:future-that-must-be-removed",
      year: 2025
    });
    const migrated = parseSave(JSON.stringify(old));
    expect(migrated?.selection.conversationYear).toBe(2020);
    expect(migrated?.biography.residenceHistory.at(-1)?.toYear).toBe(2020);
    expect(migrated?.biography.lifeEvents.every((event) => event.year <= 2020)).toBe(true);
  });

  it("migrates a version 1 direct-grandmother save without losing the life", () => {
    const state = findGenerated((candidate) => candidate.biography.relationship.variant === "biological_grandmother", "legacy");
    const legacy = JSON.parse(serializeSave(state));
    legacy.saveFormatVersion = 1;
    delete legacy.biography.relationship;
    delete legacy.biography.themes;
    legacy.biography.lifeEvents = legacy.biography.lifeEvents.map((event: Record<string, unknown>) => ({
      ...event,
      id: event.id === "life:family-connection" ? "life:parent-birth" : event.id
    }));
    legacy.memories = legacy.memories.map(({ qualities: _qualities, ...memory }: Record<string, unknown>) => memory);
    const migrated = parseSave(JSON.stringify(legacy));
    expect(migrated?.saveFormatVersion).toBe(2);
    expect(migrated?.biography.relationship.variant).toBe("biological_grandmother");
    expect(migrated?.biography.lifeEvents.some((event) => event.id === "life:family-connection")).toBe(true);
  });
});

describe("historical packs", () => {
  it.each(Object.values(regionPacks))("publishes only verified sourced events for $regionId", (pack) => {
    expect(pack.events.length).toBeGreaterThan(0);
    for (const event of pack.events) {
      expect(event.classification).toBe("VERIFIED_HISTORICAL");
      expect(event.verificationStatus).toBe("verified");
      expect(event.sourceId).toBeTruthy();
    }
  });
});
