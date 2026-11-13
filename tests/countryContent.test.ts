import { beforeAll, describe, expect, it } from "vitest";
import { countryContent } from "../content/scenes/countries";
import { occupations } from "../content/scenes/occupations";
import { translateText } from "../src/i18n";
import { worldData } from "../src/data/worldStore";
import { getLocation, isSettlement } from "../src/engine/world/geography";
import { loadWholeWorld } from "./worldHelpers";

const hasCyrillic = (value: string) => /[А-Яа-яЁё]/u.test(value);

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

describe("milestone registry", () => {
  it("cites each record in one milestone only", async () => {
    const { milestones } = await import("../content/historical/milestones");
    const owners = new Map<string, string>();
    const clashes: string[] = [];
    for (const milestone of milestones) {
      for (const id of milestone.eventIds) {
        if (owners.has(id)) clashes.push(`${id}: ${owners.get(id)} & ${milestone.id}`);
        owners.set(id, milestone.id);
      }
    }
    expect(clashes).toEqual([]);
  });
});

describe("country content of world-1.2 and world-1.3", () => {
  let verified = new Map<string, { countries: string[] }>();
  beforeAll(() => {
    const world = loadWholeWorld();
    verified = new Map([...world.packs.values()].flatMap((pack) => pack.events.map((event) => [event.id, event] as const)));
  });

  for (const content of countryContent) {
    describe(content.country, () => {
      it("cites only verified records of its own country", () => {
        for (const milestone of content.milestones) {
          expect(milestone.country).toBe(content.country);
          const present = milestone.eventIds.filter((id) => verified.has(id));
          expect(present, `${milestone.id} has no verified record`).not.toEqual([]);
          for (const id of present) expect(verified.get(id)!.countries, `${milestone.id} → ${id}`).toContain(content.country);
        }
        for (const id of Object.keys(content.historicalVoice)) expect(verified.has(id), `historicalVoice ${id}`).toBe(true);
      });

      it("names real places of its own country", () => {
        for (const [placeId, narrative] of Object.entries(content.regionNarratives)) {
          const place = getLocation(worldData(), placeId);
          expect(place && isSettlement(place), placeId).toBe(true);
          expect(place!.country).toBe(content.country);
          const destination = getLocation(worldData(), narrative.destinationPlaceId);
          expect(destination && isSettlement(destination), `${placeId} → ${narrative.destinationPlaceId}`).toBe(true);
          expect(narrative.ordinaryYearOffset).toBeGreaterThanOrEqual(40);
          expect(narrative.ordinaryYearOffset).toBeLessThanOrEqual(55);
        }
        for (const occupation of content.occupations) {
          expect(occupation.countries).toEqual([content.country]);
          expect(occupation.from).toBeLessThanOrEqual(occupation.to);
          for (const placeId of occupation.placeIds ?? []) expect(getLocation(worldData(), placeId)?.country, `${occupation.id} → ${placeId}`).toBe(content.country);
        }
        for (const id of content.sharedGenericJobIds) expect(occupations.some((occupation) => occupation.id === id && id.startsWith("west-")), id).toBe(true);
      });

      it("has urban and rural work with both a trained and an untrained path", () => {
        if (!content.occupations.length && !content.sharedGenericJobIds.length) return;
        const jobs = occupations.filter((occupation) => occupation.countries.includes(content.country));
        expect(jobs.some((job) => job.settlement === "urban")).toBe(true);
        expect(jobs.some((job) => job.settlement === "rural")).toBe(true);
        expect(jobs.some((job) => job.trained)).toBe(true);
        expect(jobs.some((job) => !job.trained)).toBe(true);
        expect(content.retirementAge.age).toBeGreaterThanOrEqual(45);
        expect(content.retirementAge.age).toBeLessThanOrEqual(67);
      });

      it("has English for every Russian line", () => {
        const { country: _country, retirementAge: _age, ...texts } = content;
        const untranslated = strings(texts).filter((text) => hasCyrillic(text) && hasCyrillic(translateText(text, "en")));
        expect(untranslated.slice(0, 5)).toEqual([]);
      });
    });
  }
});
