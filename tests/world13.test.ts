import { beforeAll, describe, expect, it } from "vitest";
import { worldManifest } from "../src/data/worldStore";
import type { WorldData } from "../src/data/worldTypes";
import { relevantEvents, type ResidencePeriod } from "../src/engine/world/events";
import { getLocation, sovereignAt, worldNameAt } from "../src/engine/world/geography";
import { loadWholeWorld } from "./worldHelpers";

// world-1.3 (docs/WORLD_1_3_PROGRESS.md): each finished country adds its cities and comparisons here.
const FINISHED: Record<string, string[]> = {
  RS: ["rs-beograd", "rs-novi-sad", "rs-subotica"],
  HR: ["hr-zagreb"],
  SI: ["si-ljubljana"],
  BA: ["ba-sarajevo"],
  ME: ["me-budva"]
};
const COMPARISONS: string[][] = [
  ["rs-beograd", "rs-novi-sad", "rs-subotica"],
  ["rs-novi-sad", "rs-subotica"],
  ["rs-beograd", "hr-zagreb"],
  ["hr-zagreb", "si-ljubljana"],
  ["ba-sarajevo", "hr-zagreb"],
  ["ba-sarajevo", "rs-beograd"],
  ["me-budva", "ba-sarajevo"],
  ["me-budva", "rs-beograd"]
];

let world: WorldData;
beforeAll(() => {
  world = loadWholeWorld();
});

function eventIds(placeId: string): Set<string> {
  const life: ResidencePeriod[] = [{ placeId, fromYear: 1930, toYear: 2020 }];
  return new Set(relevantEvents(world, life, { birthYear: 1930, groups: ["women", "all_residents"] }, 1930, 2020).map((item) => item.event.id));
}

describe("world-1.3 places", () => {
  it("registers every requested city of finished countries with coordinates", () => {
    for (const [country, cities] of Object.entries(FINISHED)) {
      for (const id of cities) {
        const place = getLocation(world, id);
        expect(place, id).not.toBeNull();
        expect(place!.country).toBe(country);
        expect(place!.coordinates, id).not.toBeNull();
      }
    }
  });

  it("publishes no world-1.3 event after 2020", () => {
    for (const pack of world.packs.values()) {
      for (const event of pack.events) {
        const country = event.countries[0] ?? "";
        if (Object.keys(FINISHED).includes(country)) expect(Number(event.start.slice(0, 4)), event.id).toBeLessThanOrEqual(2020);
      }
    }
  });

  it("offers in the menu only places whose readiness is «supported»", async () => {
    const { worldRegionOptions } = await import("../src/engine/setup");
    for (const region of worldRegionOptions()) {
      const readiness = worldManifest.coverage[region.locationId ?? region.id]?.readiness;
      if (readiness !== undefined) expect(readiness, region.id).toBe("supported");
    }
  });

  it.each(COMPARISONS.map((group) => [group.join(" vs "), group] as const))("%s have their own local histories", (_label, group) => {
    const histories = group.map((id) => ({ id, all: eventIds(id), own: new Set((world.packs.get(id)?.events ?? []).map((event) => event.id)) }));
    for (const place of histories) {
      expect(place.own.size, `${place.id} own records`).toBeGreaterThanOrEqual(8);
      for (const other of histories) {
        if (other.id === place.id) continue;
        const onlyHere = [...place.own].filter((id) => !other.all.has(id));
        expect(onlyHere.length, `${place.id} vs ${other.id}`).toBeGreaterThanOrEqual(5);
      }
    }
  });
});

describe("Serbia", () => {
  it("puts Novi Sad in Austria-Hungary before 1918 and Belgrade in the Kingdom of Serbia", () => {
    expect(sovereignAt(world, "rs-novi-sad", "1910-07-01")).toBe("state-at-hu");
    expect(sovereignAt(world, "rs-subotica", "1910-07-01")).toBe("state-at-hu");
    expect(sovereignAt(world, "rs-beograd", "1910-07-01")).not.toBe("state-at-hu");
    for (const id of FINISHED.RS!) expect(sovereignAt(world, id, "1960-07-01"), id).toBe("state-yu");
    for (const id of FINISHED.RS!) expect(sovereignAt(world, id, "2015-07-01"), id).toBe("rs");
    expect(worldNameAt(world, "rs-beograd", "1960-07-01")).toBe("Белград");
  });
});

describe("Croatia", () => {
  it("follows Zagreb from Austria-Hungary through Yugoslavia to independent Croatia", () => {
    expect(sovereignAt(world, "hr-zagreb", "1910-07-01")).toBe("state-at-hu");
    expect(sovereignAt(world, "hr-zagreb", "1930-07-01")).toBe("state-yu");
    expect(sovereignAt(world, "hr-zagreb", "1943-07-01")).toBe("state-yu");
    expect(sovereignAt(world, "hr-zagreb", "1970-07-01")).toBe("state-yu");
    expect(sovereignAt(world, "hr-zagreb", "2000-07-01")).toBe("hr");
  });
});

describe("Slovenia", () => {
  it("follows Ljubljana from Austria-Hungary through Yugoslavia to independent Slovenia", () => {
    expect(sovereignAt(world, "si-ljubljana", "1910-07-01")).toBe("state-at-hu");
    expect(sovereignAt(world, "si-ljubljana", "1930-07-01")).toBe("state-yu");
    expect(sovereignAt(world, "si-ljubljana", "1942-07-01")).toBe("state-yu");
    expect(sovereignAt(world, "si-ljubljana", "2000-07-01")).toBe("si");
  });
});

describe("Bosnia and Herzegovina", () => {
  it("follows Sarajevo from Ottoman sovereignty through annexation and Yugoslavia to independent Bosnia", () => {
    expect(sovereignAt(world, "ba-sarajevo", "1905-07-01")).toBe("state-ottoman");
    expect(sovereignAt(world, "ba-sarajevo", "1910-07-01")).toBe("state-at-hu");
    expect(sovereignAt(world, "ba-sarajevo", "1930-07-01")).toBe("state-yu");
    expect(sovereignAt(world, "ba-sarajevo", "1943-07-01")).toBe("state-yu");
    expect(sovereignAt(world, "ba-sarajevo", "1984-02-08")).toBe("state-yu");
    expect(sovereignAt(world, "ba-sarajevo", "2000-07-01")).toBe("ba");
  });

  it("keeps Ottoman reforms out of Austro-Hungarian-run Sarajevo but not out of Istanbul", () => {
    const early = (placeId: string) => new Set(relevantEvents(world, [{ placeId, fromYear: 1900, toYear: 1908 }], { birthYear: 1900, groups: ["women", "all_residents"] }, 1900, 1908).map((item) => item.event.id));
    expect(early("ba-sarajevo").has("tr-nat-1908-constitution-restored")).toBe(false);
    expect([...early("ba-sarajevo")].filter((id) => id.startsWith("tr-"))).toEqual([]);
    expect(early("tr-istanbul").has("tr-nat-1908-constitution-restored")).toBe(true);
  });
});

describe("Montenegro", () => {
  it("follows Budva from Austro-Hungarian Dalmatia through Yugoslavia and Serbia and Montenegro to independence", () => {
    expect(sovereignAt(world, "me-budva", "1910-07-01")).toBe("state-at-hu");
    expect(sovereignAt(world, "me-budva", "1930-07-01")).toBe("state-yu");
    expect(sovereignAt(world, "me-budva", "1979-04-15")).toBe("state-yu");
    expect(sovereignAt(world, "me-budva", "2000-07-01")).toBe("state-yu-fr");
    expect(sovereignAt(world, "me-budva", "2010-07-01")).toBe("me");
  });
});
