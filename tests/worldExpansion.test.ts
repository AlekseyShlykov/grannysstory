import { beforeAll, describe, expect, it } from "vitest";
import { migrationCorridors } from "../content/historical/migrationCorridors";
import { milestones } from "../content/historical/milestones";
import { worldManifest } from "../src/data/worldStore";
import type { WorldData } from "../src/data/worldTypes";
import { relevantEvents, type ResidencePeriod } from "../src/engine/world/events";
import { contextsAt } from "../src/engine/world/contexts";
import { ancestorsAt, getLocation, sovereignAt, worldNameAt } from "../src/engine/world/geography";
import { checkMove, corridorDestinations } from "../src/engine/world/migration";
import { expandResidences } from "../src/engine/world/partition";
import { loadWholeWorld } from "./worldHelpers";

// Real exported data of world-1.2 (Italy, Germany, China, Finland, Turkey).
let world: WorldData;
beforeAll(() => {
  world = loadWholeWorld();
});

function lifeAt(placeId: string, from = 1930, to = 2020): ResidencePeriod[] {
  return [{ placeId, fromYear: from, toYear: to }];
}

function eventIds(residences: ResidencePeriod[], from = 1930, to = 2020): Set<string> {
  return new Set(relevantEvents(world, residences, { birthYear: from, groups: ["women", "all_residents"] }, from, to).map((item) => item.event.id));
}

function localIds(placeId: string): Set<string> {
  return new Set([...eventIds(lifeAt(placeId))].filter((id) => world.packs.get(placeId)?.events.some((event) => event.id === id)));
}

function expectDistinctLocalHistories(placeIds: string[]) {
  const histories = placeIds.map((id) => ({ id, all: eventIds(lifeAt(id)), local: localIds(id) }));
  for (const place of histories) {
    expect(place.local.size, `${place.id} has its own records`).toBeGreaterThanOrEqual(5);
    for (const other of histories) {
      if (other.id === place.id) continue;
      const leaked = [...place.local].filter((id) => other.all.has(id));
      expect(leaked, `${place.id} records reach ${other.id}`).toEqual([]);
    }
  }
}

describe("places within one country have different histories", () => {
  it("Rome, Milan and Palermo", () => expectDistinctLocalHistories(["it-roma", "it-milano", "it-palermo"]));
  it("Beijing, Shanghai and rural Sichuan", () => {
    expect(getLocation(world, "cn-guanghan")?.settlementClass).toBe("rural");
    expect(ancestorsAt(world, "cn-guanghan", "1990-07-01")).toContain("cn-sichuan");
    expectDistinctLocalHistories(["cn-beijing", "cn-shanghai", "cn-guanghan"]);
  });
  it("Helsinki, Tampere and a rural municipality", () => {
    expect(getLocation(world, "fi-tyrnava")?.settlementClass).toBe("rural");
    expectDistinctLocalHistories(["fi-helsinki", "fi-tampere", "fi-tyrnava"]);
  });
  it("Istanbul, Ankara and rural Konya", () => {
    expect(getLocation(world, "tr-cumra")?.settlementClass).toBe("rural");
    expect(ancestorsAt(world, "tr-cumra", "1990-07-01")).toContain("tr-il-konya");
    expectDistinctLocalHistories(["tr-istanbul", "tr-ankara", "tr-cumra"]);
  });
});

describe("Germany: FRG and GDR are separate worlds before 1990", () => {
  it("puts Leipzig in the GDR and Munich in the FRG in 1975, and both in one Germany in 1995", () => {
    expect(sovereignAt(world, "de-leipzig", "1975-07-01")).toBe("state-gdr");
    expect(sovereignAt(world, "de-muenchen", "1975-07-01")).toBe("de");
    expect(ancestorsAt(world, "de-leipzig", "1975-07-01")).toContain("de-bezirk-leipzig");
    expect(ancestorsAt(world, "de-leipzig", "1995-07-01")).toContain("de-sachsen");
    expect(sovereignAt(world, "de-leipzig", "1995-07-01")).toBe("de");
    expect(sovereignAt(world, "de-leipzig", "1910-07-01")).toBe("state-de-empire");
  });

  it("gives a Leipzig life GDR national records and a Munich life FRG ones, never the other's", () => {
    const leipzig = eventIds(lifeAt("de-leipzig", 1950, 1989), 1950, 1989);
    const munich = eventIds(lifeAt("de-muenchen", 1950, 1989), 1950, 1989);
    const gdr = world.packs.get("state-gdr")!.events.map((event) => event.id);
    const frg = world.packs.get("de")!.events.filter((event) => event.start < "1990").map((event) => event.id);
    expect(gdr.some((id) => leipzig.has(id))).toBe(true);
    expect(frg.some((id) => munich.has(id))).toBe(true);
    expect(gdr.filter((id) => munich.has(id) && !frg.includes(id))).toEqual([]);
    expect(frg.filter((id) => leipzig.has(id) && !gdr.includes(id))).toEqual([]);
  });

  it("allows Leipzig → Munich only before the border closed, and only along the documented corridor", () => {
    expect(checkMove(world, "de-leipzig", "de-muenchen", 1955).ok).toBe(false);
    expect(corridorDestinations(world, "de-leipzig", 1955, migrationCorridors)).toContain("de-muenchen");
    expect(corridorDestinations(world, "de-leipzig", 1965, migrationCorridors)).toEqual([]);
    expect(checkMove(world, "de-leipzig", "de-halle", 1965).ok).toBe(true);
  });

  it("divides Berlin and reads a Berlin life through its sector", () => {
    const berlin = getLocation(world, "de-berlin")!;
    expect(berlin.partitions?.[0]?.into.sort()).toEqual(["de-berlin-east", "de-berlin-west"]);
    const west = expandResidences([{ placeId: "de-berlin", fromYear: 1930, toYear: 2020, partitions: [{ placeId: "de-berlin-west", fromYear: 1949, toYear: 1990 }] }]);
    expect(sovereignAt(world, west.find((period) => period.fromYear <= 1975 && period.toYear >= 1975)!.placeId, "1975-07-01")).toBe("de");
    const wall = "de-berlin-1961-wall-built";
    expect(eventIds(west).has(wall)).toBe(true);
    expect(eventIds([{ placeId: "de-berlin-east", fromYear: 1949, toYear: 1990 }], 1949, 1990).has(wall)).toBe(true);
    expect(worldManifest.coverage["de-berlin"]?.meetsCoverageGate).toBe(true);
    expect(worldManifest.coverage["de-berlin-west"]?.meetsCoverageGate).toBe(false);
  });
});

describe("historical names and borders", () => {
  it("shows the name valid on the date", () => {
    expect(worldNameAt(world, "tr-istanbul", "1920-07-01")).toBe("Константинополь");
    expect(worldNameAt(world, "tr-istanbul", "1935-07-01")).toBe("Стамбул");
    expect(worldNameAt(world, "tr-ankara", "1925-07-01")).toBe("Ангора");
    expect(worldNameAt(world, "tr-izmir", "1920-07-01")).toBe("Смирна");
    expect(worldNameAt(world, "cn-beijing", "1935-07-01")).toBe("Бэйпин");
    expect(worldNameAt(world, "cn-beijing", "1955-07-01")).toBe("Пекин");
  });

  it("changes sovereignty at the recorded dates", () => {
    expect(sovereignAt(world, "tr-istanbul", "1920-07-01")).toBe("state-ottoman");
    expect(sovereignAt(world, "tr-istanbul", "1935-07-01")).toBe("tr");
    expect(sovereignAt(world, "cn-shanghai", "1935-07-01")).toBe("state-cn-roc");
    expect(sovereignAt(world, "cn-shanghai", "1960-07-01")).toBe("cn");
    expect(sovereignAt(world, "fi-helsinki", "1910-07-01")).toBe("ru-empire");
    expect(ancestorsAt(world, "fi-helsinki", "1910-07-01")).toContain("fi-grand-duchy");
    expect(sovereignAt(world, "fi-helsinki", "1930-07-01")).toBe("fi");
  });

  it("a Finn born under the empire lives in it, but hears no Russian lines that were untrue for Finland", async () => {
    const { lifeMilestones } = await import("../src/engine/history/milestones");
    const { generateSession } = await import("../src/engine/biography");
    const { selection } = await import("./helpers");
    const { worldRegionPack } = await import("./worldHelpers");
    const state = generateSession(selection("fi-helsinki", 1905, "fi-empire"), worldRegionPack("fi-helsinki"));
    const ids = lifeMilestones(state, milestones, world).map((item) => item.definition.id);
    for (const id of ["ru-1905-manifesto", "ru-wwi", "ru-october-revolution", "ru-civil-war"]) expect(ids).not.toContain(id);
    expect(ids).toContain("ru-february-revolution");
    const tver = generateSession(selection("tver", 1905, "ru-empire"), (await import("./worldHelpers")).packFor("tver"));
    expect(lifeMilestones(tver, milestones, world).map((item) => item.definition.id)).toContain("ru-wwi");
  });

  it("removed states that never existed: Germany continues under occupation, Turkey from 1920", () => {
    expect(world.locations.has("state-de-allied")).toBe(false);
    expect(world.locations.has("state-tr-gna")).toBe(false);
    expect(world.locations.has("state-fi-grand-duchy")).toBe(false);
    expect(sovereignAt(world, "de-leipzig", "1947-07-01")).toBe("state-de-reich");
    expect(ancestorsAt(world, "de-leipzig", "1947-07-01")).toContain("de-zone-soviet");
    expect(sovereignAt(world, "tr-ankara", "1921-07-01")).toBe("tr");
    expect(sovereignAt(world, "tr-istanbul", "1921-07-01")).toBe("state-ottoman");
  });
});

describe("coverage through 2025", () => {
  it("every new country has national records after 2000 and in the 2020s", () => {
    for (const state of ["it", "de", "cn", "fi", "tr"]) {
      const years = world.packs.get(state)!.events.map((event) => Number(event.start.slice(0, 4)));
      expect(years.filter((year) => year >= 2000).length, state).toBeGreaterThanOrEqual(5);
      expect(years.some((year) => year >= 2020 && year <= 2025), state).toBe(true);
    }
  });

  it("falls back to the country when a settlement has no own everyday record, and says so", () => {
    const answers = contextsAt(world, "tr-cumra", 1980);
    expect(answers.length).toBeGreaterThan(0);
    const own = answers.filter((answer) => !answer.fallback);
    for (const answer of answers.filter((item) => item.fallback)) expect(answer.context.locationId).not.toBe("tr-cumra");
    expect(own.every((answer) => answer.context.locationId === "tr-cumra")).toBe(true);
  });
});

describe("migration corridors", () => {
  it("cite verified records and lead to real settlements across a border", () => {
    const verified = new Map([...world.packs.values()].flatMap((pack) => pack.events.map((event) => [event.id, event] as const)));
    for (const corridor of migrationCorridors) {
      expect(corridor.eventIds.filter((id) => !verified.has(id)), corridor.id).toEqual([]);
      for (const destination of corridor.toPlaceIds) expect(getLocation(world, destination), destination).not.toBeNull();
    }
  });

  it("Italy and Turkey to West Germany open only in their dated years", () => {
    expect(checkMove(world, "tr-cumra", "de-koeln", 1965).ok).toBe(false);
    expect(corridorDestinations(world, "tr-cumra", 1965, migrationCorridors)).toEqual(["de-koeln"]);
    expect(corridorDestinations(world, "tr-cumra", 1958, migrationCorridors)).toEqual([]);
    expect(corridorDestinations(world, "tr-cumra", 1980, migrationCorridors)).toEqual([]);
    expect(corridorDestinations(world, "it-napoli", 1960, migrationCorridors)).toEqual(["de-koeln", "de-wolfsburg"]);
    expect(corridorDestinations(world, "it-napoli", 1950, migrationCorridors)).toEqual([]);
  });

  it("an emigrant changes national context at the border", () => {
    const life: ResidencePeriod[] = [{ placeId: "tr-cumra", fromYear: 1940, toYear: 1964 }, { placeId: "de-koeln", fromYear: 1965, toYear: 2020 }];
    const ids = eventIds(life, 1940, 2020);
    const turkishAfter = world.packs.get("tr")!.events.filter((event) => Number(event.start.slice(0, 4)) >= 1966).map((event) => event.id);
    const germanAfter = world.packs.get("de")!.events.filter((event) => Number(event.start.slice(0, 4)) >= 1966).map((event) => event.id);
    expect(turkishAfter.filter((id) => ids.has(id))).toEqual([]);
    expect(germanAfter.some((id) => ids.has(id))).toBe(true);
  });
});

describe("whole lives in the new countries", () => {
  it("plays coherent lives from every new menu place, crossing borders only along corridors", async () => {
    const { worldRegionOptions } = await import("../src/engine/setup");
    const { generateSession, biographyIssues } = await import("../src/engine/biography");
    const { atlasRoute } = await import("../src/engine/atlas");
    const { selection } = await import("./helpers");
    const { playToEnd, worldRegionPack } = await import("./worldHelpers");
    const places = worldRegionOptions().filter((region) => /^(it|de|cn|fi|tr)-/.test(region.id));
    const corridorPlaces = new Set(migrationCorridors.flatMap((corridor) => corridor.toPlaceIds));
    let crossed = 0;
    for (const place of places) {
      for (const [index, year] of [1900, 1915, 1928, 1940].entries()) {
        const outcome = index % 2 ? "pathA" : "pathB";
        let state = generateSession(selection(place.id, year, `w12-${place.id}-${year}`), worldRegionPack(place.id));
        state = playToEnd(state, outcome);
        expect(state.screen, place.id).toBe("atlas");
        expect(biographyIssues(state), `${place.id} ${year}`).toEqual([]);
        expect(atlasRoute(state).points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
        const birthCountry = getLocation(world, place.id)!.country;
        for (const residence of state.biography.residenceHistory) {
          const country = getLocation(world, residence.placeId)!.country;
          if (country !== birthCountry) {
            crossed += 1;
            expect(corridorPlaces.has(residence.placeId), `${place.id} → ${residence.placeId}`).toBe(true);
          }
          expect(residence.toYear).toBeLessThanOrEqual(2020);
        }
        for (const residence of state.biography.residenceHistory.filter((item) => item.placeId === "de-berlin")) {
          const divided = residence.fromYear <= 1990 && residence.toYear >= 1948;
          expect(residence.partitions?.length ?? 0, `Berlin ${residence.fromYear}–${residence.toYear}`).toBe(divided ? 1 : 0);
        }
      }
    }
    expect(places.length).toBeGreaterThan(0);
    expect(crossed).toBeGreaterThanOrEqual(0);
  }, 120000);
});

describe("choosing a side of Berlin", () => {
  it("keeps the chosen side for the whole division and through a move inside her state", async () => {
    const { loadRegionPack } = await import("../src/data/regionStore");
    const { generateSession } = await import("../src/engine/biography");
    const { selection } = await import("./helpers");
    const { playToEnd } = await import("./worldHelpers");
    const { placeAtYear } = await import("../src/engine/world/partition");
    for (const [side, state] of [["de-berlin-west", "de"], ["de-berlin-east", "state-gdr"]] as const) {
      const pack = await loadRegionPack(side);
      expect(pack.birthPlaces).toEqual(["de-berlin"]);
      for (let index = 0; index < 6; index += 1) {
        let life = generateSession(selection(side, 1925, `${side}-${index}`), pack);
        expect(life.biography.residenceHistory[0]!.placeId).toBe("de-berlin");
        expect(life.biography.residenceHistory[0]!.partitions?.[0]?.placeId).toBe(side);
        life = playToEnd(life, index % 2 ? "pathA" : "pathB");
        const berlinYears = life.biography.residenceHistory.filter((item) => item.placeId === "de-berlin" && item.fromYear <= 1975 && item.toYear >= 1975);
        if (berlinYears.length) {
          expect(placeAtYear(life.biography.residenceHistory, 1975)).toBe(side);
          expect(sovereignAt(world, side, "1975-07-01")).toBe(state);
        }
        // Wherever she lives in 1975, it is in the state of her side or reached along a documented corridor.
        const where = placeAtYear(life.biography.residenceHistory, 1975)!;
        const sovereign = sovereignAt(world, where, "1975-07-01");
        if (sovereign !== state) expect(migrationCorridors.some((corridor) => corridor.toPlaceIds.includes(life.biography.residenceHistory.find((item) => item.fromYear <= 1975 && item.toYear >= 1975)!.placeId))).toBe(true);
      }
    }
  });
});
