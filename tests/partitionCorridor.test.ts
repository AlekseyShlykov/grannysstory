import { describe, expect, it } from "vitest";
import type { WorldData, WorldLocation } from "../src/data/worldTypes";
import { annotatePartitions, expandResidences, placeAtYear } from "../src/engine/world/partition";
import { checkMove, corridorDestinations, plausibleDestinations } from "../src/engine/world/migration";
import { relevantEvents } from "../src/engine/world/events";
import type { MigrationCorridor } from "../content/historical/migrationCorridors";

// A synthetic divided city and two states, so the mechanism is tested independently of the research data.
function node(id: string, type: string, level: WorldLocation["level"], parents: WorldLocation["parents"], extra: Partial<WorldLocation> = {}): WorldLocation {
  return {
    id, type, level, country: "XX", settlementClass: ["city", "town"].includes(type) ? "large_city" : null, wikidata: null,
    coordinates: { lat: 50, lon: 10 }, names: [{ name: id, locative: null, from: null, to: null }], parents, occupations: [],
    validFrom: null, validTo: null, legacyIds: [], ...extra
  };
}

const locations = [
  node("world", "world", "international", []),
  node("west", "state", "national", [{ id: "world", from: null, to: null }]),
  node("east", "state", "national", [{ id: "world", from: "1949", to: "1990-10-02" }], { validFrom: "1949", validTo: "1990-10-02" }),
  node("allied", "state", "national", [{ id: "world", from: null, to: "1990-10-02" }], { validTo: "1990-10-02" }),
  node("abroad", "state", "national", [{ id: "world", from: null, to: null }]),
  node("capital", "city", "municipal", [{ id: "allied", from: null, to: "1990-10-02" }, { id: "west", from: "1990-10-03", to: null }], {
    partitions: [{ from: "1949", to: "1990-10-02", into: ["capital-west", "capital-east"] }]
  }),
  node("capital-west", "city", "municipal", [{ id: "west", from: "1949", to: "1990-10-02" }], { validFrom: "1949", validTo: "1990-10-02" }),
  node("capital-east", "city", "municipal", [{ id: "east", from: "1949", to: "1990-10-02" }], { validFrom: "1949", validTo: "1990-10-02" }),
  node("west-town", "town", "municipal", [{ id: "west", from: null, to: null }]),
  node("east-town", "town", "municipal", [{ id: "east", from: "1949", to: "1990-10-02" }, { id: "west", from: "1990-10-03", to: null }]),
  node("abroad-town", "town", "municipal", [{ id: "abroad", from: null, to: null }])
];
const world: WorldData = {
  version: "test",
  locations: new Map(locations.map((location) => [location.id, location])),
  packs: new Map([
    ["capital-west", { locationId: "capital-west", version: "test", contexts: [], events: [{
      id: "west-only", title: "west", start: "1960", end: null, precision: "year", approximate: false, scope: "municipal",
      locationIds: ["capital-west"], countries: ["XX"], category: "infrastructure_transport", summary: "", groups: [],
      eligibility: { minAge: null, maxAge: null, groupsAny: [] }, impacts: [], hooks: [], sensitive: false, sourceIds: [], confidence: "high", legacy: false
    }] }]
  ])
};

describe("divided cities", () => {
  it("places a resident born before the division in one part, the same one for the same seed", () => {
    const first = annotatePartitions(world, [{ placeId: "capital", fromYear: 1930, toYear: 2020 }], "seed-a");
    const again = annotatePartitions(world, first, "seed-a");
    expect(first[0]!.partitions).toHaveLength(1);
    expect(first[0]!.partitions![0]).toMatchObject({ fromYear: 1949, toYear: 1990 });
    expect(again).toEqual(first);
    const sides = new Set(Array.from({ length: 40 }, (_, index) => annotatePartitions(world, [{ placeId: "capital", fromYear: 1930, toYear: 2020 }], `s${index}`)[0]!.partitions![0]!.placeId));
    expect([...sides].sort()).toEqual(["capital-east", "capital-west"]);
  });

  it("reads history through the part for the division years only", () => {
    const residences = [{ placeId: "capital", fromYear: 1930, toYear: 2020, partitions: [{ placeId: "capital-west", fromYear: 1949, toYear: 1990 }] }];
    expect(expandResidences(residences)).toEqual([
      { placeId: "capital", fromYear: 1930, toYear: 1948 },
      { placeId: "capital-west", fromYear: 1949, toYear: 1990 },
      { placeId: "capital", fromYear: 1991, toYear: 2020 }
    ]);
    expect(placeAtYear(residences, 1975)).toBe("capital-west");
    expect(placeAtYear(residences, 1995)).toBe("capital");
    const events = relevantEvents(world, expandResidences(residences), { birthYear: 1930, groups: [] }, 1930, 2020);
    expect(events.map((item) => item.event.id)).toEqual(["west-only"]);
    const eastSide = [{ placeId: "capital", fromYear: 1930, toYear: 2020, partitions: [{ placeId: "capital-east", fromYear: 1949, toYear: 1990 }] }];
    expect(relevantEvents(world, expandResidences(eastSide), { birthYear: 1930, groups: [] }, 1930, 2020)).toEqual([]);
  });

  it("puts a newcomer during the division on the side of the state she came from", () => {
    const fromEast = annotatePartitions(world, [
      { placeId: "east-town", fromYear: 1930, toYear: 1959 },
      { placeId: "capital", fromYear: 1960, toYear: 2020 }
    ], "any");
    expect(fromEast[1]!.partitions![0]!.placeId).toBe("capital-east");
    const fromWest = annotatePartitions(world, [
      { placeId: "west-town", fromYear: 1930, toYear: 1959 },
      { placeId: "capital", fromYear: 1960, toYear: 2020 }
    ], "any");
    expect(fromWest[1]!.partitions![0]!.placeId).toBe("capital-west");
  });

  it("offers the city, never a part, as a destination, and only from a state that holds a part", () => {
    expect(checkMove(world, "west-town", "capital-west", 1970).ok).toBe(false);
    expect(checkMove(world, "west-town", "capital", 1970).ok).toBe(true);
    expect(checkMove(world, "east-town", "capital", 1970).ok).toBe(true);
    expect(checkMove(world, "abroad-town", "capital", 1970).ok).toBe(false);
    expect(plausibleDestinations(world, "west-town", 1970).map((place) => place.id)).toEqual(["capital"]);
    // From the western part she moves within the West; the eastern town is across a state border.
    expect(checkMove(world, "capital-west", "east-town", 1970).ok).toBe(false);
    expect(checkMove(world, "capital-west", "west-town", 1970).ok).toBe(true);
  });
});

describe("cross-border corridors", () => {
  const corridor: MigrationCorridor = {
    id: "test", eventIds: ["x"], fromStates: ["abroad"], toPlaceIds: ["west-town", "east-town"], fromYear: 1961, toYear: 1973, note: ""
  };

  it("opens only for the origin state and the dated years", () => {
    expect(corridorDestinations(world, "abroad-town", 1960, [corridor])).toEqual([]);
    expect(corridorDestinations(world, "abroad-town", 1974, [corridor])).toEqual([]);
    expect(corridorDestinations(world, "west-town", 1965, [corridor])).toEqual([]);
    expect(corridorDestinations(world, "abroad-town", 1965, [corridor])).toEqual(["east-town", "west-town"]);
  });

  it("never crosses a border without a corridor", () => {
    expect(checkMove(world, "abroad-town", "west-town", 1965).ok).toBe(false);
    expect(plausibleDestinations(world, "abroad-town", 1965)).toEqual([]);
  });
});
