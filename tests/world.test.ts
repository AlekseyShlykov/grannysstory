import worldSources from "../public/data/world/sources.json";
import { beforeAll, describe, expect, it } from "vitest";
import { regionPacks } from "../src/data/catalog";
import { clearWorldPacks, packIdsFor, validateWorldPack, worldData, worldManifest } from "../src/data/worldStore";
import type { RegionId } from "../src/data/types";
import type { WorldData } from "../src/data/worldTypes";
import { atlasRoute, knownAtlasEvents } from "../src/engine/atlas";
import { biographyIssues, commitBranch, generateSession } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { lifeTimelinePoints, timelineBackgrounds } from "../src/engine/lifeTimeline";
import { parseSave, serializeSave } from "../src/engine/persistence";
import { lifeProfile } from "../src/engine/world/biographyLink";
import { bestContext, contextsAt } from "../src/engine/world/contexts";
import { historicalEnvironment } from "../src/engine/world/environment";
import { relevantEvents, type ResidencePeriod } from "../src/engine/world/events";
import { ancestorsAt, sovereignAt, worldNameAt } from "../src/engine/world/geography";
import { checkMove, plausibleDestinations, residenceIssues } from "../src/engine/world/migration";
import { selection } from "./helpers";
import { loadWholeWorld } from "./worldHelpers";

let world: WorldData;
beforeAll(() => {
  world = loadWholeWorld();
});

const women = (birthYear: number, extra: string[] = []) => ({ birthYear, groups: ["women", "all_residents", "urban_residents", ...extra] });
const stay = (placeId: string, fromYear: number, toYear: number): ResidencePeriod[] => [{ placeId, fromYear, toYear }];
const ids = (placeId: string, birthYear = 1930, lastYear = 2025) =>
  new Set(relevantEvents(world, stay(placeId, birthYear, lastYear), women(birthYear), birthYear, lastYear).map((item) => item.event.id));
const ownEvents = (placeId: string) => new Set(world.packs.get(placeId)?.events.map((event) => event.id) ?? []);

function contrast(a: string, b: string) {
  const first = ids(a);
  const second = ids(b);
  const shared = [...first].filter((id) => second.has(id));
  return { first, second, shared, onlyFirst: [...first].filter((id) => !second.has(id)), onlySecond: [...second].filter((id) => !first.has(id)) };
}

describe("geographic hierarchy and sovereignty", () => {
  it("keeps one stable id while names follow the date", () => {
    expect(worldNameAt(world, "ru-tver", "1925-07-01")).toBe("Тверь");
    expect(worldNameAt(world, "ru-tver", "1960-07-01")).toBe("Калинин");
    expect(worldNameAt(world, "ru-tver", "2000-07-01")).toBe("Тверь");
    expect(worldNameAt(world, "ru-saint-petersburg", "1950-07-01")).toBe("Ленинград");
    expect(worldNameAt(world, "tver", "1960-07-01")).toBe("Калинин");
  });

  it("puts a Tver resident in the USSR in 1960 and in the Russian Federation in 2000", () => {
    expect(sovereignAt(world, "ru-tver", "1960-07-01")).toBe("su");
    expect(sovereignAt(world, "ru-tver", "2000-07-01")).toBe("ru");
    expect(ancestorsAt(world, "ru-tver", "1960-07-01")).toContain("ru");
  });

  it("follows Gdańsk and Kraków across border changes", () => {
    expect(sovereignAt(world, "pl-gdansk", "1910-07-01")).toBe("state-de-empire");
    expect(sovereignAt(world, "pl-gdansk", "1930-07-01")).toBe("state-danzig");
    expect(sovereignAt(world, "pl-gdansk", "1960-07-01")).toBe("pl");
    expect(sovereignAt(world, "pl-krakow", "1910-07-01")).toBe("state-at-hu");
    expect(sovereignAt(world, "pl-krakow", "1930-07-01")).toBe("pl");
  });

  it("treats the Regency Kingdom as a transitional administration, not sovereign Poland", () => {
    expect(world.locations.get("state-pl-regency")?.type).toBe("transitional_administration");
    expect(ancestorsAt(world, "pl-warszawa", "1917-07-01")).toContain("state-pl-regency");
    expect(sovereignAt(world, "pl-warszawa", "1917-07-01")).toBe("state-de-empire");
    expect(sovereignAt(world, "pl-warszawa", "1918-11-11")).toBe("pl");
  });

  it("does not confuse England with the United Kingdom", () => {
    const chain = ancestorsAt(world, "gb-manchester", "1990-07-01");
    expect(chain).toContain("gb-eng");
    expect(chain.at(-2)).toBe("gb");
  });

  it("every settlement chain reaches a state and the world root in 1900, 1950 and 2025", () => {
    for (const location of world.locations.values()) {
      if (!location.settlementClass) continue;
      for (const day of ["1900-07-01", "1950-07-01", "2025-07-01"]) {
        if (location.validFrom && location.validFrom > day) continue;
        const chain = ancestorsAt(world, location.id, day);
        expect(chain.at(-1), `${location.id} ${day}`).toBe("world");
        expect(sovereignAt(world, location.id, day), `${location.id} ${day}`).not.toBeNull();
      }
    }
  });
});

describe("event inheritance gives different places different histories", () => {
  it.each([
    ["fr-paris", "fr-marseille"],
    ["fr-lyon", "fr-le-creusot"],
    ["us-new-york-city", "us-holmes-county-rural"],
    ["gb-london", "gb-manchester"],
    ["pl-warszawa", "pl-krakow"],
    ["ru-moscow", "ru-saint-petersburg"]
  ])("%s and %s share national context but not local events", (a, b) => {
    const result = contrast(a, b);
    expect(result.shared.length, "shared national/regional context").toBeGreaterThan(0);
    expect(result.onlyFirst.length, `${a} local`).toBeGreaterThan(0);
    expect(result.onlySecond.length, `${b} local`).toBeGreaterThan(0);
    for (const id of ownEvents(a)) expect(result.second.has(id), `${b} must not inherit ${a} record ${id}`).toBe(false);
    for (const id of ownEvents(b)) expect(result.first.has(id), `${a} must not inherit ${b} record ${id}`).toBe(false);
  });

  it("never gives rural Ohio a New York City record", () => {
    const rural = ids("us-holmes-county-rural", 1920, 2025);
    for (const id of ownEvents("us-new-york-city")) expect(rural.has(id)).toBe(false);
    const nationalUs = ownEvents("us");
    expect([...rural].some((id) => nationalUs.has(id))).toBe(true);
  });

  it("does not give events from before her birth", () => {
    const items = relevantEvents(world, stay("fr-paris", 1945, 2025), women(1945), 1945, 2025);
    expect(items.every((item) => item.year >= 1945)).toBe(true);
  });

  it("marks only eligible events as personal candidates, never as experience", () => {
    const items = relevantEvents(world, stay("ru-tver", 1932, 2026), women(1932), 1932, 2026);
    for (const item of items.filter((candidate) => candidate.personalCandidate)) {
      const { minAge, maxAge } = item.event.eligibility;
      if (minAge !== null) expect(item.age).toBeGreaterThanOrEqual(minAge);
      if (maxAge !== null) expect(item.age).toBeLessThanOrEqual(maxAge);
    }
  });
});

describe("lives across the whole 1900–2025 range", () => {
  it.each([
    ["born 1905 in Lyon", 1905, "fr-lyon", 2005],
    ["born 1945 in Kraków", 1945, "pl-krakow", 2025],
    ["born 1945 in Manchester, alive in 2025", 1945, "gb-manchester", 2025],
    ["born 1932 in Kalinin, alive in 2026", 1932, "ru-tver", 2026]
  ])("%s has historical surroundings in most five-year steps", (_label, birthYear, placeId, lastYear) => {
    const points = historicalEnvironment(world, { birthYear, lastYear, residences: stay(placeId, birthYear, lastYear), profile: women(birthYear) });
    expect(points[0]?.year).toBe(birthYear);
    const withEvents = points.filter((point) => point.events.length > 0).length;
    expect(withEvents / points.length).toBeGreaterThanOrEqual(0.6);
    if (lastYear >= 2020) expect(points.some((point) => point.year >= 2000 && point.events.length > 0)).toBe(true);
  });

  it("a woman who moves between regions inherits the new place only after the move", () => {
    const residences: ResidencePeriod[] = [
      { placeId: "ru-tver", fromYear: 1930, toYear: 1955 },
      { placeId: "ru-moscow", fromYear: 1956, toYear: 2025 }
    ];
    expect(residenceIssues(world, residences)).toEqual([]);
    const items = relevantEvents(world, residences, women(1930), 1930, 2025);
    const tverOnly = ownEvents("ru-tver");
    const moscowOnly = ownEvents("ru-moscow");
    expect(items.filter((item) => tverOnly.has(item.event.id)).every((item) => item.year <= 1955)).toBe(true);
    expect(items.filter((item) => moscowOnly.has(item.event.id)).every((item) => item.year >= 1956)).toBe(true);
  });

  it("an emigrant switches national context at the border", () => {
    const residences: ResidencePeriod[] = [
      { placeId: "pl-krakow", fromYear: 1940, toYear: 1968 },
      { placeId: "fr-lyon", fromYear: 1969, toYear: 2025 }
    ];
    expect(checkMove(world, "pl-krakow", "fr-lyon", 1969).ok).toBe(false);
    expect(checkMove(world, "pl-krakow", "fr-lyon", 1969, true).ok).toBe(true);
    const items = relevantEvents(world, residences, women(1940), 1940, 2025);
    const polish = items.filter((item) => item.event.countries.includes("PL"));
    const french = items.filter((item) => item.event.countries.includes("FR"));
    expect(polish.length).toBeGreaterThan(0);
    expect(french.length).toBeGreaterThan(0);
    expect(polish.every((item) => item.year <= 1968)).toBe(true);
    expect(french.every((item) => item.year >= 1969)).toBe(true);
  });

  it("only offers moves to places that existed and stayed within the state", () => {
    for (const destination of plausibleDestinations(world, "ru-tver", 1955)) {
      expect(sovereignAt(world, destination.id, "1955-07-01")).toBe("su");
      expect(destination.coordinates).not.toBeNull();
    }
    expect(checkMove(world, "ru-tver", "ru-tver", 1955).ok).toBe(false);
  });

  it("answers everyday questions from the most specific level and says when it fell back", () => {
    let fallbacks = 0;
    let answered = 0;
    for (const placeId of ["fr-plozevet", "us-marietta", "gb-corby", "pl-zalipie", "ru-torzhok"]) {
      for (const year of [1950, 1975, 2005]) {
        const answers = contextsAt(world, placeId, year);
        if (!answers.length) continue;
        answered += 1;
        fallbacks += answers.filter((answer) => answer.fallback).length;
        // The place's own records always come before anything borrowed from a higher level.
        const firstBorrowed = answers.findIndex((answer) => answer.fallback);
        if (firstBorrowed >= 0) expect(answers.slice(firstBorrowed).every((answer) => answer.fallback)).toBe(true);
        expect(answers.every((answer) => answer.context.from <= year && answer.context.to >= year)).toBe(true);
      }
    }
    expect(answered).toBeGreaterThan(0);
    expect(fallbacks).toBeGreaterThan(0);
    expect(bestContext(world, "fr-paris", 1300, "housing")).toBeNull();
  });
});

describe("history inside generated lives", () => {
  const generated = (region: RegionId, year: number, seed: string) => generateSession(selection(region, year, seed), regionPacks[region]!);

  function play(region: RegionId, seed: string, outcome: "pathA" | "pathB") {
    let state = generated(region, 1932, seed);
    for (let guard = 0; state.screen !== "atlas" && guard < 30; guard += 1) {
      const options = currentScene(state).options;
      state = chooseOption(state, options.find((option) => option.id === outcome)?.id ?? options[guard % options.length]!.id);
    }
    return state;
  }

  it("frames turning points with verified circumstances from her own place and time", () => {
    let anchored = 0;
    for (let index = 0; index < 60; index += 1) {
      const state = generated("tver", 1932, `anchor-${index}`);
      const branch = state.biography.branches[0]!;
      if (!branch.historicalAnchor) continue;
      anchored += 1;
      expect(branch.historicalAnchor.year).toBeLessThanOrEqual(branch.year);
      expect(branch.historicalAnchor.year).toBeGreaterThanOrEqual(branch.year - 4);
      expect(branch.historicalAnchor.sourceIds.length).toBeGreaterThan(0);
    }
    expect(anchored).toBeGreaterThan(0);
  });

  it("lets the education or career decision carry its historical framing into the atlas", () => {
    for (let index = 0; index < 400; index += 1) {
      const state = generated("tver", 1932, `career-${index}`);
      const branch = state.biography.branches[0]!;
      if (!["education", "profession"].includes(branch.type) || !branch.historicalAnchor) continue;
      const finished = play("tver", `career-${index}`, "pathA");
      const decision = finished.biography.lifeEvents.find((event) => event.id === `life:${branch.type}:decision`)!;
      expect(decision.historicalContextIds).toEqual([branch.historicalAnchor.id]);
      expect(knownAtlasEvents(finished).some((event) => event.id === `context:world:${branch.historicalAnchor!.id}`)).toBe(true);
      return;
    }
    throw new Error("no anchored education/profession branch found");
  });

  it("a migration decision moves her to a reachable place and the atlas shows the route", () => {
    for (let index = 0; index < 400; index += 1) {
      const state = generated("tver", 1932, `move-${index}`);
      const branch = state.biography.branches[0]!;
      if (branch.type !== "migration" || !branch.destinationPlaceId) continue;
      const moved = commitBranch(state, "pathA");
      expect(moved.biography.residenceHistory.at(-1)?.placeId).toBe(branch.destinationPlaceId);
      expect(checkMove(world, "tver", branch.destinationPlaceId, branch.year).ok).toBe(true);
      expect(atlasRoute(moved).points).toHaveLength(2);
      const stayed = commitBranch(state, "pathB");
      expect(atlasRoute(stayed).points).toHaveLength(1);
      return;
    }
    throw new Error("no migration branch found");
  });

  it.each(["tver", "moscow", "leningrad"] as const)("finishes both outcomes without contradictions or repeated history in %s", (region) => {
    for (const outcome of ["pathA", "pathB"] as const) {
      const state = play(region, `world-play-${region}`, outcome);
      expect(state.screen).toBe("atlas");
      expect(biographyIssues(state)).toEqual([]);
      const historical = state.biography.lifeEvents.filter((event) => event.provenance === "VERIFIED_HISTORICAL" && event.known);
      expect(new Set(historical.map((event) => event.id)).size).toBe(historical.length);
      expect(historical.every((event) => event.year >= state.selection.birthYear && event.year <= state.selection.conversationYear)).toBe(true);
      expect(knownAtlasEvents(state).every((event) => event.known)).toBe(true);
    }
  });

  it("keeps a childless, never-married life coherent and out of mother-only eligibility", () => {
    for (let index = 0; index < 500; index += 1) {
      const state = generated("tver", 1932, `single-${index}`);
      if (state.biography.relationship.hasOwnChildren || state.biography.branches[0]?.type !== "marriage") continue;
      const single = commitBranch(state, "pathB");
      expect(single.biography.flags).toContain("chose_not_to_marry");
      expect(biographyIssues(single)).toEqual([]);
      expect(lifeProfile(1932, world, single.biography).groups).not.toContain("mothers");
      return;
    }
    throw new Error("no childless marriage-branch life found");
  });

  it("uses world background in every five-year step and keeps it after a save round-trip", () => {
    const state = generated("tver", 1932, "world-save");
    const before = [...timelineBackgrounds(state).entries()];
    expect(before.map(([year]) => year)).toEqual(lifeTimelinePoints(state.selection).filter((point) => !point.final).map((point) => point.year));
    expect(before.some(([, background]) => background.id.startsWith("context:world:"))).toBe(true);
    const restored = parseSave(serializeSave(state))!;
    expect([...timelineBackgrounds(restored).entries()]).toEqual(before);
  });

  it("mixes local and country-or-world background across one life", () => {
    const backgrounds = [...timelineBackgrounds(generated("tver", 1900, "balanced-scales")).values()];
    expect(backgrounds.some((background) => ["local", "municipal", "district", "regional"].includes(background.level ?? ""))).toBe(true);
    expect(backgrounds.some((background) => ["constituent", "national", "international"].includes(background.level ?? ""))).toBe(true);
  });

  it("never voices unreviewed sensitive records", () => {
    const sensitive = new Set([...world.packs.values()].flatMap((pack) => pack.events.filter((event) => event.sensitive && !event.legacy).map((event) => event.id)));
    for (let index = 0; index < 30; index += 1) {
      for (const background of timelineBackgrounds(generated("leningrad", 1925, `sensitive-${index}`)).values()) {
        expect(sensitive.has(background.id.replace(/^context:(national:|world:)?/, ""))).toBe(false);
      }
    }
  });
});

describe("offline data and fallbacks", () => {
  it("loads only the packs a life can inherit from", () => {
    const needed = packIdsFor(["ru-tver"], 1932, 2026);
    expect(needed).toContain("ru-tver");
    expect(needed.some((id) => id.startsWith("fr-") || id.startsWith("us-"))).toBe(false);
  });

  it("rejects corrupt or mismatched packs", () => {
    expect(() => validateWorldPack({ locationId: "ru-tver", version: "other", events: [], contexts: [] }, "ru-tver")).toThrow();
    expect(() => validateWorldPack(null, "ru-tver")).toThrow();
    expect(() => validateWorldPack({ locationId: "fr-lyon", version: worldManifest.worldDatasetVersion, events: [], contexts: [] }, "ru-tver")).toThrow();
  });

  it("falls back to the bundled national layer when no packs are available", () => {
    clearWorldPacks();
    const state = generateSession(selection("tver", 1932, "offline"), regionPacks.tver!);
    const backgrounds = [...timelineBackgrounds(state).values()];
    expect(backgrounds.length).toBe(lifeTimelinePoints(state.selection).filter((point) => !point.final).length);
    expect(backgrounds.every((background) => !background.id.startsWith("context:world:"))).toBe(true);
    world = loadWholeWorld();
    expect(worldData().packs.size).toBeGreaterThan(0);
  });

  it("publishes only verified, sourced records whose scope matches their geography", () => {
    const sources = new Set(worldSources.sources.map((source) => source.id));
    for (const pack of world.packs.values()) {
      for (const event of pack.events) {
        expect(event.sourceIds.length, event.id).toBeGreaterThan(0);
        for (const sourceId of event.sourceIds) expect(sources.has(sourceId), `${event.id} → ${sourceId}`).toBe(true);
        for (const locationId of event.locationIds) {
          const level = world.locations.get(locationId)?.level;
          expect(level === event.scope || (event.scope === "international" && level === "national"), `${event.id} scope`).toBe(true);
        }
        if (event.precision === "year") expect(event.start).toMatch(/^\d{4}$/);
      }
    }
  });
});

describe("world-dataset birthplaces in the main menu", () => {
  it("publishes coverage-gated places with reviewed narratives", async () => {
    const { menuRegions, worldRegionOptions } = await import("../src/engine/setup");
    const published = worldRegionOptions();
    expect(menuRegions(false).map((region) => region.id)).toContain("fr-lyon");
    expect(menuRegions(false).map((region) => region.id)).toContain("pl-warszawa");
    expect(menuRegions(false).map((region) => region.id)).toContain("us-detroit");
    for (const region of published) {
      expect(worldManifest.coverage[region.id]?.meetsCoverageGate).toBe(true);
      expect(region.countryId).toBeTruthy();
      expect(region.preview).toBe(false);
    }
    expect(published.map((region) => region.id)).not.toContain("pl-gdansk");
    expect(published.map((region) => region.id)).not.toContain("pl-zalipie");
  });

  it.each(["fr-lyon", "pl-warszawa", "gb-manchester", "us-detroit"])("plays a whole %s life coherently", async (placeId) => {
    const { loadRegionPack } = await import("../src/data/regionStore");
    const pack = await loadRegionPack(placeId);
    for (const outcome of ["pathA", "pathB"] as const) {
      let state = generateSession(selection(placeId, 1930, `preview-${placeId}`), pack);
      expect(state.biography.people[0]!.name.split(" ")).toHaveLength(2);
      for (let guard = 0; state.screen !== "atlas" && guard < 30; guard += 1) {
        const options = currentScene(state).options;
        state = chooseOption(state, options.find((option) => option.id === outcome)?.id ?? options[guard % options.length]!.id);
      }
      expect(state.screen).toBe("atlas");
      expect(biographyIssues(state)).toEqual([]);
      const country = placeId.slice(0, 2).toUpperCase();
      for (const residence of state.biography.residenceHistory) expect(world.locations.get(residence.placeId)?.country).toBe(country);
      expect(atlasRoute(state).points.every((point) => Number.isFinite(point.x))).toBe(true);
      expect(state.dialogue.transcript.some((line) => line.text.includes("Калинин"))).toBe(false);
    }
  });
});

describe("spoken history", () => {
  it("keeps reference-book abbreviations out of her speech", async () => {
    const { spokenFact } = await import("../content/scenes/historicalVoice");
    expect(spokenFact("4 мая 1942 г. выдана первая продовольственная книжка (сахарная). Потом ещё.", "Карточки военного времени")).toBe("Карточки военного времени.");
    expect(spokenFact("Город получил трамвай. Подробности позже.", "Трамвай")).toBe("Город получил трамвай.");
  });
});

describe("branch framing", () => {
  it("never frames a turning point with reproductive law or an unrelated category", () => {
    const allowed: Record<string, string[]> = { education: ["education"], profession: ["local_economy", "labor", "technology", "economic_crisis"] };
    for (let index = 0; index < 200; index += 1) {
      for (const region of ["tver", "moscow", "leningrad"]) {
        const state = generateSession(selection(region, 1930, `framing-${region}-${index}`), regionPacks[region]!);
        const branch = state.biography.branches[0]!;
        const anchor = branch.historicalAnchor;
        if (!anchor || anchor.kind !== "event") continue;
        expect(`${anchor.title} ${anchor.summary}`).not.toMatch(/аборт|контрацеп|беремен/i);
        const event = [...world.packs.values()].flatMap((pack) => pack.events).find((candidate) => candidate.id === anchor.id)!;
        expect(event.sensitive).toBe(false);
        if (allowed[branch.type]) expect(allowed[branch.type]).toContain(event.category);
      }
    }
  });
});
