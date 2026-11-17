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
import { occupationAt, parentAt, sovereignAt, getLocation } from "../src/engine/world/geography";
import { clearWorldPacks, packIdsFor, registerWorldPack, worldData, worldManifest } from "../src/data/worldStore";
import { historyPlaceIds } from "../src/engine/world/historyLoading";
import { worldRegionOptions } from "../src/engine/setup";
import type { GameSessionState } from "../src/data/types";
import type { WorldData } from "../src/data/worldTypes";
import { selection } from "./helpers";
import { content } from "../content/scenes/countries/jp";
import { loadWholeWorld, packFor } from "./worldHelpers";
import translations from "../src/i18n/en/jp.json";
import { birthStatements, birthStatementsForCountry } from "../content/scenes/birthVoice";

const CITIES = ["jp-tokyo", "jp-kyoto", "jp-osaka", "jp-hiroshima"];
let world: WorldData;
let spokenShare: { national: number; local: number; localPercent: number };
beforeAll(() => { world = loadWholeWorld(); });
function play(state: GameSessionState, outcome: "pathA" | "pathB") {
  for (let guard = 0; guard < 80 && state.screen !== "atlas"; guard += 1) {
    const options = currentScene(state).options.filter((option) => option.id !== "history-more");
    state = chooseOption(state, options.find((option) => option.id === outcome)?.id ?? options[0]!.id);
  }
  return state;
}

describe("Japan release", () => {
  it.each(CITIES)("supports %s for all birth cohorts and both boundary paths", (city) => {
    expect(worldManifest.coverage[city]?.readiness).toBe("supported");
    expect(worldRegionOptions().some((option) => option.id === city)).toBe(true);
    for (let year = 1900; year <= 1940; year += 1) {
      const state = generateSession(selection(city, year, `jp-cohort-${year}`), packFor(city));
      expect(biographyIssues(state)).toEqual([]);
      expect(state.biography.people.find((person) => person.id === "grandmother")!.name).not.toMatch(/овна|евна/);
      expect(state.biography.branches.every((branch) => branch.year < 1944 || branch.year > 1951)).toBe(true);
      expect(state.biography.branches.filter((branch) => branch.type === "education").every((branch) => branch.year - year <= 30)).toBe(true);
      if ([1900, 1910, 1920, 1926, 1930, 1932, 1940].includes(year)) {
        for (const outcome of ["pathA", "pathB"] as const) {
          const ended = play(state, outcome);
          expect(ended.screen, `${city}/${year}/${outcome}`).toBe("atlas");
          expect(biographyIssues(ended), `${city}/${year}/${outcome}`).toEqual([]);
        }
      }
    }
  });

  it("keeps Tokyo’s dated prefectures and occupation distinct from sovereignty", () => {
    expect(parentAt(world, "jp-tokyo", "1943-06-30")).toBe("jp-tokyo-fu");
    expect(parentAt(world, "jp-tokyo", "1943-07-01")).toBe("jp-tokyo-to");
    expect(CITIES.map((id) => getLocation(world, id)!.coordinates)).toEqual([
      { lat: 35.69, lon: 139.692 }, { lat: 35.021, lon: 135.754 },
      { lat: 34.694, lon: 135.501 }, { lat: 34.4, lon: 132.45 }
    ]);
    for (const city of CITIES) {
      expect(occupationAt(world, city, "1945-09-01")).toBeNull();
      expect(occupationAt(world, city, "1945-09-02")).toContain("SCAP");
      expect(occupationAt(world, city, "1952-04-28")).toBeNull();
      expect(sovereignAt(world, city, "1950-07-01")).toBe("jp");
    }
  });

  it.each(CITIES)("preserves essential national history for every %s seed", (city) => {
    for (let seed = 0; seed < 4; seed += 1) {
      const state = generateSession(selection(city, 1930, `jp-milestone-${seed}`), packFor(city));
      const ids = lifeMilestones(state).map((item) => item.eventId);
      expect(ids).toEqual(expect.arrayContaining([
        "jp-1931-manchurian-invasion", "jp-1937-war-in-china", "jp-1941-pacific-war", "jp-1945-atomic-bombings",
        "jp-1945-surrender", "jp-1945-allied-occupation", "jp-1945-women-voting-rights", "jp-1947-constitution",
        "jp-1947-education-reform", "jp-1952-occupation-ends", "jp-1964-shinkansen", "jp-1973-oil-crisis",
        "jp-1986-equal-employment", "jp-1992-bubble-collapse", "jp-2011-tohoku-earthquake", "jp-2011-fukushima-accident", "jp-2020-pandemic-emergency"
      ]));
      expect(historicalBackdrop(state).some((item) => item.id.endsWith("jp-1947-constitution"))).toBe(true);
    }
  });

  it("uses distinct local histories and context without counting inherited national copies", () => {
    const own = CITIES.map((city) => new Set(world.packs.get(city)!.events.map((event) => event.id)));
    for (let a = 0; a < own.length; a += 1) for (let b = a + 1; b < own.length; b += 1) {
      expect([...own[a]!].some((id) => own[b]!.has(id))).toBe(false);
    }
    expect(contextsAt(world, "jp-osaka", 1954).some((row) => row.context.id === "jp-ctx-osaka-1954-industry-subsidence")).toBe(true);
    expect(contextsAt(world, "jp-kyoto", 1954).some((row) => row.context.id === "jp-ctx-osaka-1954-industry-subsidence")).toBe(false);
    expect(contextsAt(world, "jp-hiroshima", 1950).some((row) => row.context.type === "housing" && !row.fallback)).toBe(true);
  });

  it("offers reviewed postwar moves and keeps late-war/occupation routes outside the authored travel model", () => {
    for (const from of CITIES) for (const to of CITIES.filter((city) => city !== from)) {
      expect(checkMove(world, from, to, 1945).ok).toBe(false);
      expect(checkMove(world, from, to, 1950).ok).toBe(false);
      expect(checkMove(world, from, to, 1953).ok).toBe(true);
    }
  });

  it("does not create a survivor status, personal injury or bereavement from Hiroshima birth", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const state = generateSession(selection("jp-hiroshima", 1920 + seed, `jp-hiroshima-${seed}`), packFor("jp-hiroshima"));
      const personal = state.biography.lifeEvents.filter((event) => event.provenance === "FICTIONAL_PERSONAL");
      expect(personal.map((event) => event.text).join(" ")).not.toMatch(/хибакуся|облучени|атомн|бомбардиров/);
      const reached = relevantEvents(world, state.biography.residenceHistory, { birthYear: 1920 + seed, groups: [] }, 1900, 2020);
      expect(reached.filter((item) => item.event.sensitive).every((item) => !item.personalCandidate)).toBe(true);
    }
  });

  it("keeps the national/local spoken background share near90/10", () => {
    let local = 0, national = 0;
    for (const city of CITIES) for (let seed = 0; seed < 12; seed += 1) {
      const state = generateSession(selection(city, 1900 + seed * 3, `jp-share-${seed}`), packFor(city));
      for (const item of timelineBackgrounds(state).values()) for (const entry of [item, ...(item.companion ? [item.companion] : [])]) {
        if (entry.scope === "national") national += 1;
        if (entry.scope === "local") local += 1;
      }
    }
    expect(national + local).toBeGreaterThan(150);
    expect(local / (local + national)).toBeGreaterThan(LOCAL_SHARE - 0.02);
    expect(local / (local + national)).toBeLessThan(LOCAL_SHARE + 0.02);
    spokenShare = { national, local, localPercent: 100 * local / (national + local) };
  });

  it("keeps all Japanese domestic destinations available offline without loading other countries", () => {
    const all = new Map(world.packs);
    try {
      const state = generateSession(selection("jp-kyoto", 1932, "jp-offline"), packFor("jp-kyoto"));
      const ids = packIdsFor(historyPlaceIds(state, world), 1932, 2020);
      expect(CITIES.every((city) => ids.includes(city))).toBe(true);
      expect(ids.every((id) => id === "jp" || id.startsWith("jp-"))).toBe(true);
      clearWorldPacks();
      for (const id of ids) registerWorldPack(all.get(id)!);
      const ended = play(state, "pathA");
      expect(ended.screen).toBe("atlas");
      expect(biographyIssues(ended)).toEqual([]);
      expect(ended.biography.residenceHistory.length).toBeGreaterThan(1);
      for (const residence of ended.biography.residenceHistory) expect(worldData().packs.has(residence.placeId)).toBe(true);
    } finally { world = loadWholeWorld(); }
  });

  it("has English for every authored spoken line", () => {
    const exact: Record<string, string> = translations.exact;
    const strings = [...Object.values(content.regionNarratives).flatMap((row) => [row.openingObject,row.openingText,row.historyPrompt,row.ordinaryText,row.destinationText]),
      ...content.occupations.flatMap((row) => [row.title,row.start,row.middle,row.late]),
      ...content.milestones.flatMap((row) => Object.values(row.voice)),
      ...Object.values(content.historicalVoice).flatMap((row) => Object.values(row))];
    for (const text of strings) expect(exact[text], text).toBeTruthy();
  });

  it("uses neutral Japanese birth records and dates war milestones within the same year", () => {
    for (const say of birthStatementsForCountry("JP")) expect(say(1930, "в Киото")).not.toMatch(/паспорт|метрик|метель/);
    expect(birthStatementsForCountry("ES")).toBe(birthStatements);
    const state = generateSession(selection("jp-tokyo", 1932, "jp-chronology"), packFor("jp-tokyo"));
    const backgrounds = [...timelineBackgrounds(state).values()].flatMap((item) => [item, ...(item.companion ? [item.companion] : [])]);
    const atomic = backgrounds.findIndex((item) => item.id.endsWith("jp-1945-atomic-bombings"));
    const surrender = backgrounds.findIndex((item) => item.id.endsWith("jp-1945-surrender"));
    expect(atomic).toBeGreaterThanOrEqual(0);
    expect(surrender).toBeGreaterThan(atomic);
  });

  it("plays comparative lives through saves, migration and the final atlas", async () => {
    const reviews: unknown[] = [];
    for (const city of CITIES) for (const outcome of ["pathA", "pathB"] as const) {
      const start = generateSession(selection(city, 1932, `jp-review-${outcome}`), packFor(city));
      const ended = play(parseSave(serializeSave(start))!, outcome);
      expect(ended.screen).toBe("atlas");
      expect(biographyIssues(ended)).toEqual([]);
      expect(parseSave(serializeSave(ended))!.biography).toEqual(ended.biography);
      const residences = ended.biography.residenceHistory;
      for (let index = 1; index < residences.length; index += 1) expect(checkMove(world, residences[index-1]!.placeId, residences[index]!.placeId, residences[index]!.fromYear).ok).toBe(true);
      expect(atlasRoute(ended).points.map((point) => point.placeId)).toEqual(residences.map((row) => row.placeId));
      const spoken = ended.dialogue.transcript.map((row) => row.text).join(" ");
      expect(spoken).not.toMatch(/колхоз|комсомол|райком|Алексеевн|завесили зеркало|в паспорте записано|По метрике/);
      expect(spoken).toContain(content.regionNarratives[city]!.ordinaryText);
      for (const other of CITIES.filter((id) => id !== city)) expect(spoken).not.toContain(content.regionNarratives[other]!.ordinaryText);
      const atlas = [...knownAtlasEvents(ended), ...historicalBackdrop(ended)];
      expect(atlas.every((row) => row.year <= 2020)).toBe(true);
      for (const item of lifeMilestones(ended)) expect(atlas.some((row) => row.id.endsWith(item.eventId)), item.eventId).toBe(true);
      reviews.push({ city, outcome, name: ended.biography.people.find((person) => person.id === "grandmother")!.name,
        kinship: ended.biography.relationship.variant, residences, transcript: ended.dialogue.transcript, atlas });
    }
    const path = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.JAPAN_REVIEW;
    if (path) {
      const fs = await import(/* @vite-ignore */ `node:${"fs"}`) as { writeFileSync: (path: string, value: string) => void };
      fs.writeFileSync(path, JSON.stringify({ kind: "generated fictional engine walkthroughs; not testimony or human approval", spokenShare, reviews }, null, 2));
    }
  });
});
