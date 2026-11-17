import { beforeAll, describe, expect, it, vi } from "vitest";
import sourcesJson from "../public/data/world/sources.json";
import { worldManifest, ensureWorldPacks, packIdsFor } from "../src/data/worldStore";
import type { WorldData } from "../src/data/worldTypes";
import { generateSession, biographyIssues } from "../src/engine/biography";
import { checkMove } from "../src/engine/world/migration";
import { relevantEvents } from "../src/engine/world/events";
import { contextsAt } from "../src/engine/world/contexts";
import { ancestorsAt, getLocation, parentAt, worldNameAt } from "../src/engine/world/geography";
import { worldRegionOptions } from "../src/engine/setup";
import { knownAtlasEvents, atlasRoute } from "../src/engine/atlas";
import { parseSave, serializeSave } from "../src/engine/persistence";
import { loadWholeWorld, packFor, playToEnd } from "./worldHelpers";
import { selection } from "./helpers";

// The owner confirmed that the 18 explicitly listed cities are the complete scope.
const PLANNED_GROUPS = [
  ["es-madrid", "es-barcelona", "es-oviedo", "es-malaga"],
  ["jp-tokyo", "jp-kyoto", "jp-osaka", "jp-hiroshima"],
  ["br-sao-paulo", "br-rio-de-janeiro", "br-salvador"],
  ["za-johannesburg", "za-cape-town"],
  ["cd-kinshasa", "cd-lubumbashi"],
  ["eg-cairo", "eg-alexandria", "eg-luxor"]
];
const COUNTRIES = new Set(["ES", "JP", "BR", "ZA", "CD", "EG"]);
const authoredLocations = import.meta.glob<{ locations: { id: string; coordinate_evidence_url?: string }[] }>(
  "../data/locations/*.json", { eager: true, import: "default" });
// Country releases are incremental. Every authored city must be exported and tested; a country whose
// authoring file is intentionally absent from this release is deferred, not silently treated as supported.
const authoredIds = new Set(Object.values(authoredLocations).flatMap((file) => (file.locations ?? []).map((row) => row.id)));
const GROUPS = PLANNED_GROUPS.map((group) => group.filter((id) => authoredIds.has(id))).filter((group) => group.length);
const CITIES = GROUPS.flat();
let world: WorldData;
beforeAll(() => { world = loadWholeWorld(); });

describe("six-country research packages", () => {
  it.each(CITIES)("registers %s with a real coordinate reference, without enabling an unreviewed life", (id) => {
    const location = getLocation(world, id)!;
    expect(location, id).toBeDefined();
    expect(location.coordinates, id).not.toBeNull();
    const authored = authoredLocations[`../data/locations/${location.country!.toLowerCase()}.json`]!
      .locations.find((row) => row.id === id)!;
    expect(authored.coordinate_evidence_url).toMatch(/^https:\/\/www\.geonames\.org\//);
    expect(world.packs.get(id)?.events.length, id).toBeGreaterThan(0);
    const ready = worldManifest.coverage[id]?.readiness === "supported";
    expect(Boolean(location.researchOnly)).toBe(!ready);
    if (!ready) {
      expect(worldRegionOptions().some((region) => region.id === id)).toBe(false);
      expect(() => generateSession(selection(id), packFor(id))).toThrow();
      expect(checkMove(world, "tver", id, 1970, true).ok).toBe(false);
    }
  });

  it.each(GROUPS.map((group) => [group.join(" / "), group] as const))("filters distinct local histories: %s", (_title, group) => {
    for (const city of group) {
      const own = world.packs.get(city)!.events.map((event) => event.id);
      const reached = relevantEvents(world, [{ placeId: city, fromYear: 1900, toYear: 2020 }],
        { birthYear: 1900, groups: ["women", "all_residents"] }, 1900, 2020);
      expect(own.some((id) => reached.some((item) => item.event.id === id))).toBe(true);
      expect(reached.filter((item) => item.event.sensitive).every((item) => !item.personalCandidate)).toBe(true);
      for (const other of group.filter((id) => id !== city)) {
        const otherEvents = relevantEvents(world, [{ placeId: other, fromYear: 1900, toYear: 2020 }],
          { birthYear: 1900, groups: [] }, 1900, 2020);
        expect(otherEvents.filter((item) => own.includes(item.event.id))).toEqual([]);
      }
    }
  });

  it.skipIf(!authoredIds.has("cd-kinshasa"))("retains dated Congo place names and does not offer Lubumbashi before its recorded existence", () => {
    expect(worldNameAt(world, "cd-kinshasa", "1930-01-01")).toBe("Леопольдвиль");
    expect(worldNameAt(world, "cd-lubumbashi", "1930-01-01")).toBe("Элизабетвиль");
    expect(worldNameAt(world, "cd-kinshasa", "1970-01-01")).toBe("Киншаса");
    expect(worldNameAt(world, "cd-lubumbashi", "1970-01-01")).toBe("Лубумбаши");
    expect(getLocation(world, "cd-lubumbashi")!.validFrom).toBe("1910");
  });

  it.skipIf(!authoredIds.has("br-rio-de-janeiro"))("changes Rio's administrative chain on the effective dates without creating a migration", () => {
    expect(parentAt(world, "br-rio-de-janeiro", "1960-04-20")).toBe("br-rio-federal-district");
    expect(parentAt(world, "br-rio-de-janeiro", "1960-04-21")).toBe("br-guanabara");
    expect(parentAt(world, "br-rio-de-janeiro", "1975-03-14")).toBe("br-guanabara");
    expect(parentAt(world, "br-rio-de-janeiro", "1975-03-15")).toBe("br-rio-state");
    expect(worldNameAt(world, "br-rio-de-janeiro", "1975-03-15")).toBe("Рио-де-Жанейро");
  });

  it.skipIf(!authoredIds.has("jp-tokyo"))("keeps the Tokyo urban place stable across the abolition of Tokyo-shi and retains other prefectural parents", () => {
    expect(parentAt(world, "jp-tokyo", "1943-06-30")).toBe("jp-tokyo-fu");
    expect(parentAt(world, "jp-tokyo", "1943-07-01")).toBe("jp-tokyo-to");
    expect(worldNameAt(world, "jp-tokyo", "1943-07-01")).toBe("Токио");
    for (const city of ["jp-kyoto", "jp-osaka", "jp-hiroshima"]) {
      expect(parentAt(world, city, "1930-01-01")).toBe(`${city}-prefecture`);
      expect(parentAt(world, city, "2000-01-01")).toBe(`${city}-prefecture`);
    }
  });

  it("distinguishes the Oviedo province rename from the city and the autonomous community", () => {
    expect(worldNameAt(world, "es-province-oviedo", "1983-04-07")).toBe("Провинция Овьедо");
    expect(worldNameAt(world, "es-province-oviedo", "1983-04-08")).toBe("Провинция Астурия");
    expect(worldNameAt(world, "es-oviedo", "1983-04-08")).toBe("Овьедо");
    expect(ancestorsAt(world, "es-oviedo", "1982-01-30")).not.toContain("es-community-asturias");
    expect(ancestorsAt(world, "es-oviedo", "1982-01-31")).toContain("es-community-asturias");
    expect(ancestorsAt(world, "es-barcelona", "1980-01-11")).toContain("es-community-catalonia");
    expect(ancestorsAt(world, "es-malaga", "1982-01-11")).toContain("es-community-andalusia");
    expect(ancestorsAt(world, "es-madrid", "1983-03-01")).toContain("es-community-madrid");
  });

  it("exports complete source links and no new event or context beyond 1900–2020", () => {
    const ids = new Set<string>(sourcesJson.sources.map((source) => source.id));
    for (const pack of world.packs.values()) {
      for (const event of pack.events.filter((row) => row.countries.some((country) => COUNTRIES.has(country)))) {
        expect(Number(event.start.slice(0, 4))).toBeGreaterThanOrEqual(1900);
        expect(Number((event.end ?? event.start).slice(0, 4))).toBeLessThanOrEqual(2020);
        expect(event.sourceIds.every((id) => ids.has(id)), event.id).toBe(true);
      }
      for (const context of pack.contexts.filter((row) => /^(es|jp|br|za|cd|eg)-/.test(row.locationId))) {
        expect(context.from).toBeGreaterThanOrEqual(1900);
        expect(context.to).toBeLessThanOrEqual(2020);
      }
    }
  });

  it("has local everyday records and keeps city statistics at their stated geographic scope", () => {
    for (const city of CITIES) {
      const context = world.packs.get(city)!.contexts[0]!;
      expect(context, city).toBeDefined();
      expect(contextsAt(world, city, context.from).some((answer) => answer.context.id === context.id && !answer.fallback)).toBe(true);
    }
    const statistic = world.packs.get("es-province-barcelona")!.contexts
      .flatMap((context) => context.statistics).find((row) => row.area_id === "es-province-barcelona")!;
    expect(statistic.area_id).toBe("es-province-barcelona");
    expect(statistic.method_note).toContain("not municipal");
  });

  it("retains Madrid's original housing units, approval/completion distinction and register reference date", () => {
    const contexts = world.packs.get("es-madrid")!.contexts;
    const housing = contexts.find((row) => row.id === "es-ctx-madrid-1950-housing-construction")!;
    const approved = housing.statistics.find((row) => row.indicator === "new_dwellings_projects_approved")!;
    const completed = housing.statistics.find((row) => row.indicator === "new_dwellings_completed")!;
    expect(approved.value).toBe(7529);
    expect(completed.value).toBe(1597);
    expect(completed.unit).toBe("dwellings");
    expect(completed.area_id).toBe("es-madrid");
    expect(completed.method_note).toContain("not the same project cohort");
    const register = contexts.find((row) => row.id === "es-ctx-madrid-1949-population-boundaries")!;
    expect(register.from).toBe(1949);
    expect(register.statistics[0]!.value).toBe(1509289);
    expect(register.statistics[0]!.method_note).toContain("excluding the separate planned-annexation column");
  });

  it("preserves the dates of legal creation and distinguishes a railway tender from an opening", () => {
    const oviedo = world.packs.get("es-oviedo")!.events;
    const malaga = world.packs.get("es-malaga")!.events;
    expect(oviedo.find((row) => row.id === "es-oviedo-1968-medical-faculty")!.start).toBe("1968-08-18");
    expect(malaga.find((row) => row.id === "es-malaga-1972-university")!.start).toBe("1972-10-01");
    const tender = oviedo.find((row) => row.id === "es-oviedo-1925-station-link-tender")!;
    expect(tender.start).toBe("1925-12-16");
    expect(tender.summary).toContain("конкурс");
    expect(tender.summary).not.toContain("открыли");
  });

  it("loads only residence chains and reuses loaded packs with the network unavailable", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    try {
      for (const city of CITIES) {
        expect(await ensureWorldPacks([city], 1900, 2020)).toEqual([]);
        const ids = packIdsFor([city], 1900, 2020);
        expect(ids).toContain(city);
        expect(CITIES.filter((id) => id !== city).some((id) => ids.includes(id))).toBe(false);
      }
      expect(fetchMock).not.toHaveBeenCalled();
    } finally { vi.unstubAllGlobals(); }
  });

  it.each(["pathA", "pathB"] as const)("preserves a saved existing life, its atlas and family through %s", (outcome) => {
    const original = generateSession(selection("tver", 1932, "archive-regression"), packFor("tver"));
    const resumed = parseSave(serializeSave(original))!;
    expect(resumed.biography).toEqual(original.biography);
    const ended = playToEnd(resumed, outcome);
    expect(ended.screen).toBe("atlas");
    expect(biographyIssues(ended)).toEqual([]);
    expect(knownAtlasEvents(ended).every((event) => event.known && event.year <= 2020)).toBe(true);
    expect(atlasRoute(ended).points.length).toBe(ended.biography.residenceHistory.length);
  });
});
