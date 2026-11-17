import { beforeAll, describe, expect, it } from "vitest";
import { generateSession, biographyIssues } from "../src/engine/biography";
import { chooseOption, currentScene } from "../src/engine/dialogue";
import { parseSave, serializeSave } from "../src/engine/persistence";
import { historicalBackdrop, knownAtlasEvents, atlasRoute } from "../src/engine/atlas";
import { lifeMilestones } from "../src/engine/history/milestones";
import { LOCAL_SHARE, timelineBackgrounds } from "../src/engine/lifeTimeline";
import { checkMove } from "../src/engine/world/migration";
import { contextsAt } from "../src/engine/world/contexts";
import { relevantEvents } from "../src/engine/world/events";
import { ancestorsAt, getLocation, worldNameAt } from "../src/engine/world/geography";
import { clearWorldPacks, packIdsFor, registerWorldPack, worldData, worldManifest } from "../src/data/worldStore";
import { historyPlaceIds } from "../src/engine/world/historyLoading";
import { worldRegionOptions } from "../src/engine/setup";
import type { GameSessionState } from "../src/data/types";
import type { WorldData } from "../src/data/worldTypes";
import { selection } from "./helpers";
import { content as spanishContent } from "../content/scenes/countries/es";
import { loadWholeWorld, packFor } from "./worldHelpers";

const CITIES = ["es-barcelona", "es-madrid", "es-oviedo", "es-malaga"];
let world: WorldData;
beforeAll(() => { world = loadWholeWorld(); });

function play(state: GameSessionState, outcome: "pathA" | "pathB") {
  for (let guard = 0; guard < 80 && state.screen !== "atlas"; guard += 1) {
    const options = currentScene(state).options.filter((option) => option.id !== "history-more");
    state = chooseOption(state, options.find((option) => option.id === outcome)?.id ?? options[0]!.id);
  }
  return state;
}

describe("Spain release", () => {
  it.each(CITIES)("enables %s with local evidence, distinct context and every birth cohort", (city) => {
    expect(worldManifest.coverage[city]?.readiness).toBe("supported");
    expect(worldRegionOptions().some((option) => option.id === city)).toBe(true);
    for (let year = 1900; year <= 1940; year += 1) {
      const state = generateSession(selection(city, year, `es-cohort-${year}`), packFor(city));
      expect(biographyIssues(state)).toEqual([]);
      expect(state.biography.people.find((person) => person.id === "grandmother")!.name).not.toMatch(/овна|евна/);
      expect(state.biography.branches.every((branch) => branch.year < 1936 || branch.year > 1939)).toBe(true);
      expect(state.biography.branches.filter((branch) => branch.type === "education")
        .every((branch) => branch.year - year <= 30)).toBe(true);
      if ([1900, 1910, 1916, 1917, 1920, 1940].includes(year)) {
        for (const outcome of ["pathA", "pathB"] as const) {
          const ended = play(state, outcome);
          expect(ended.screen, `${city}/${year}/${outcome}`).toBe("atlas");
          expect(biographyIssues(ended), `${city}/${year}/${outcome}`).toEqual([]);
        }
      }
    }
  });

  it("keeps geographical Catalonia distinct from dated autonomous institutions and preserves the provincial rename", () => {
    expect(ancestorsAt(world, "es-barcelona", "1933-01-01")).toContain("es-historical-catalonia");
    expect(ancestorsAt(world, "es-barcelona", "1933-01-01")).not.toContain("es-community-catalonia");
    expect(ancestorsAt(world, "es-barcelona", "1980-01-11")).toContain("es-community-catalonia");
    expect(ancestorsAt(world, "es-barcelona", "1980-01-11")).not.toContain("es-historical-catalonia");
    expect(worldNameAt(world, "es-province-oviedo", "1983-04-07")).toBe("Провинция Овьедо");
    expect(worldNameAt(world, "es-province-oviedo", "1983-04-08")).toBe("Провинция Астурия");
    const coords = CITIES.map((city) => getLocation(world, city)!.coordinates!);
    expect(coords).toEqual([{ lat: 41.389, lon: 2.159 }, { lat: 40.417, lon: -3.703 },
      { lat: 43.36029, lon: -5.84476 }, { lat: 36.72016, lon: -4.42034 }]);
  });

  it.each(CITIES)("retains major national events for every %s seed, including foundational reforms", (city) => {
    for (let seed = 0; seed < 4; seed += 1) {
      const state = generateSession(selection(city, 1930, `es-milestones-${seed}`), packFor(city));
      const ids = lifeMilestones(state).map((item) => item.eventId);
      expect(ids).toEqual(expect.arrayContaining(["es-1931-republic-proclaimed", "es-1931-constitution",
        "es-1936-civil-war", "es-1939-dictatorship", "es-1975-franco-death", "es-1977-elections",
        "es-1978-constitution", "es-1986-european-communities", "es-2002-euro-cash", "es-2008-financial-crisis", "es-2020-pandemic-alarm"]));
      expect(historicalBackdrop(state).map((item) => item.id)).toContain("backdrop:es-1978-constitution");
    }
  });

  it("keeps a spoken foundational reform in the known atlas rather than losing it from both categories", () => {
    const state = generateSession(selection("es-madrid", 1932, "es-legal-atlas"), packFor("es-madrid"));
    const event = world.packs.get("es")!.events.find((item) => item.id === "es-1978-constitution")!;
    state.biography.lifeEvents.push({ id: `context:world:${event.id}`, year: 1978, title: event.title,
      text: event.summary, placeId: "es-madrid", peopleIds: [], provenance: "VERIFIED_HISTORICAL",
      sourceIds: event.sourceIds, salience: "historical", known: true });
    expect(historicalBackdrop(state).some((item) => item.id.endsWith(event.id))).toBe(false);
    expect(knownAtlasEvents(state).some((item) => item.id.endsWith(event.id))).toBe(true);
  });

  it("has different local everyday contexts, and inherits regional mining without inventing an Oviedo pit", () => {
    const own = CITIES.map((city) => new Set(world.packs.get(city)!.contexts.map((item) => item.id)));
    for (let a = 0; a < own.length; a += 1) for (let b = a + 1; b < own.length; b += 1) {
      expect([...own[a]!].some((id) => own[b]!.has(id))).toBe(false);
    }
    const record = contextsAt(world, "es-oviedo", 1962).find((item) => item.context.id === "es-ctx-asturias-1962-mining-and-labour")!;
    expect(record.context.locationId).toBe("es-province-oviedo");
    expect(contextsAt(world, "es-madrid", 1962).some((item) => item.context.id === record.context.id)).toBe(false);
    expect(checkMove(world, "es-madrid", "es-barcelona", 1937).ok).toBe(false);
    expect(checkMove(world, "es-madrid", "es-barcelona", 1950).ok).toBe(true);
  });

  it("keeps the spoken historical mixture near ninety percent national context", () => {
    let local = 0, national = 0;
    for (const city of CITIES) for (let seed = 0; seed < 12; seed += 1) {
      const state = generateSession(selection(city, 1900 + seed * 3, `es-share-${seed}`), packFor(city));
      for (const item of timelineBackgrounds(state).values()) for (const entry of [item, ...(item.companion ? [item.companion] : [])]) {
        if (entry.scope === "national") national += 1;
        if (entry.scope === "local") local += 1;
      }
    }
    expect(national + local).toBeGreaterThan(150);
    expect(local / (local + national)).toBeGreaterThan(LOCAL_SHARE - 0.05);
    expect(local / (local + national)).toBeLessThan(LOCAL_SHARE + 0.05);
  });

  it("retains onward-city history when playing offline with only the packs prepared by the app", () => {
    const allPacks = new Map(world.packs);
    try {
      const state = generateSession(selection("es-malaga", 1932, "es-review-pathA"), packFor("es-malaga"));
      const ids = packIdsFor(historyPlaceIds(state, world), 1932, 2020);
      expect(CITIES.every((city) => ids.includes(city))).toBe(true);
      expect(ids.every((id) => id === "es" || id.startsWith("es-"))).toBe(true);
      clearWorldPacks();
      for (const id of ids) registerWorldPack(allPacks.get(id)!);
      const ended = play(state, "pathA");
      expect(ended.screen).toBe("atlas");
      expect(biographyIssues(ended)).toEqual([]);
      expect(ended.biography.residenceHistory.at(-1)!.placeId).toBe("es-oviedo");
      expect(relevantEvents(worldData(), ended.biography.residenceHistory,
        { birthYear: 1932, groups: ["women", "all_residents"] }, 1932, 2020)
        .some((item) => item.event.id === "es-oviedo-1998-world-heritage-extension")).toBe(true);
      expect([...worldData().packs.keys()].sort()).toEqual([...ids].sort());
    } finally { world = loadWholeWorld(); }
  });

  it("plays all four cities through both outcomes with coherent saves, travel, family and an offline atlas", async () => {
    const reviews: unknown[] = [];
    for (const city of CITIES) for (const outcome of ["pathA", "pathB"] as const) {
      const start = generateSession(selection(city, 1932, `es-review-${outcome}`), packFor(city));
      const ended = play(parseSave(serializeSave(start))!, outcome);
      expect(ended.screen, `${city}/${outcome}`).toBe("atlas");
      expect(biographyIssues(ended), `${city}/${outcome}`).toEqual([]);
      expect(parseSave(serializeSave(ended))!.biography).toEqual(ended.biography);
      const residences = ended.biography.residenceHistory;
      for (let index = 1; index < residences.length; index += 1) {
        expect(checkMove(world, residences[index-1]!.placeId, residences[index]!.placeId, residences[index]!.fromYear).ok).toBe(true);
      }
      expect(atlasRoute(ended).points.map((point) => point.placeId)).toEqual(residences.map((item) => item.placeId));
      expect(knownAtlasEvents(ended).every((item) => item.year <= 2020)).toBe(true);
      expect(ended.dialogue.transcript.map((item) => item.text).join(" ")).not.toMatch(/колхоз|комсомол|райком|Алексеевн/);
      const spoken = ended.dialogue.transcript.map((item) => item.text).join(" ");
      expect(spoken).toContain(spanishContent.regionNarratives[city]!.ordinaryText);
      for (const other of CITIES.filter((id) => id !== city)) {
        expect(spoken).not.toContain(spanishContent.regionNarratives[other]!.ordinaryText);
      }
      const essential = lifeMilestones(ended);
      const atlasIds = new Set([...knownAtlasEvents(ended), ...historicalBackdrop(ended)].map((item) => item.id));
      for (const item of essential) expect([...atlasIds].some((id) => id.endsWith(item.eventId)), item.eventId).toBe(true);
      reviews.push({ city, outcome, name: ended.biography.people.find((item) => item.id === "grandmother")!.name,
        relationship: ended.biography.relationship.variant, residences, branches: ended.biography.branches,
        transcript: ended.dialogue.transcript, knownEvents: knownAtlasEvents(ended), background: historicalBackdrop(ended) });
    }
    const path = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.SPAIN_REVIEW;
    if (path) {
      const fs = await import(/* @vite-ignore */ `node:${"fs"}`) as { writeFileSync: (path: string, value: string) => void };
      fs.writeFileSync(path, JSON.stringify({ kind: "generated fictional engine walkthroughs; not historical testimony or human approval", reviews }, null, 2));
    }
  });
});
