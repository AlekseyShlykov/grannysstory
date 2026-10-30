import { beforeAll, describe, expect, it } from "vitest";
import { milestones } from "../content/historical/milestones";
import type { MilestoneDefinition } from "../content/historical/milestoneSchema";
import { narrateMilestone, narrateRecord, softenDates, spokenFactSentence } from "../content/scenes/historicalNarration";
import { historicalVoice } from "../content/scenes/historicalVoice";
import type { GameSessionState } from "../src/data/types";
import type { WorldData, WorldEvent, WorldLocation } from "../src/data/worldTypes";
import { historicalBackdrop, knownAtlasEvents } from "../src/engine/atlas";
import { biographyIssues, generateSession } from "../src/engine/biography";
import { lifeMilestones } from "../src/engine/history/milestones";
import { LOCAL_SHARE, lifeTimelinePoints, timelineBackgrounds } from "../src/engine/lifeTimeline";
import type { TimelineBackground } from "../src/engine/lifeTimeline";
import { selection } from "./helpers";
import { loadWholeWorld, packFor, playToEnd } from "./worldHelpers";

let world: WorldData;
beforeAll(() => {
  world = loadWholeWorld();
});

const generated = (region: string, year: number, seed: string) => generateSession(selection(region, year, seed), packFor(region));
const regions = ["tver", "moscow", "leningrad", "fr-paris", "fr-lyon", "fr-marseille", "gb-london", "gb-manchester", "pl-warszawa", "pl-lodz", "us-chicago", "us-new-york-city"];
const spokenItems = (state: GameSessionState): TimelineBackground[] =>
  [...timelineBackgrounds(state).values()].flatMap((item) => [item, ...(item.companion ? [item.companion] : [])]);
const allWorldEvents = () => [...world.packs.values()].flatMap((pack) => pack.events);

describe("essential national milestones", () => {
  it("refers only to verified records that exist in the published packs", () => {
    const ids = new Set(allWorldEvents().map((event) => event.id));
    for (const milestone of milestones) {
      expect(milestone.eventIds.some((id) => ids.has(id)), milestone.id).toBe(true);
      for (const line of [milestone.voice.heard, milestone.voice.young, milestone.voice.lived, milestone.voice.deeper]) expect(line.length).toBeGreaterThan(20);
    }
    expect(new Set(milestones.map((milestone) => milestone.id)).size).toBe(milestones.length);
  });

  it.each([
    ["tver", 1900, ["first_world_war_russia_1914", "february_revolution_1917", "ru-nat-1917-october-revolution", "ru-nat-1917-civil-war", "war_begins_1941", "victory_1945", "ussr_dissolution_1991"]],
    ["fr-paris", 1910, ["fr-nat-1914-general-mobilisation", "fr-nat-1918-armistice", "fr-nat-1939-war-declared", "fr-nat-1940-armistice", "fr-nat-1944-liberation", "fr-nat-1945-ve-day", "fr-nat-1968-may-events"]],
    ["gb-london", 1910, ["gb-nat-1914-war-declared", "gb-nat-1939-war-and-conscription", "gb-nat-1945-ve-day"]],
    ["pl-warszawa", 1920, ["pl-nat-1939-german-invasion", "pl-nat-1945-war-ends", "pl-nat-1980-solidarity", "pl-nat-1989-round-table-elections"]],
    ["us-chicago", 1915, ["us-nat-1929-stock-market-crash", "us-nat-1941-pearl-harbor-war", "us-nat-1945-end-of-wwii", "us-nat-2001-september-11"]]
  ] as const)("puts major wars and revolutions into a %s life born %i", (region, year, expected) => {
    for (let index = 0; index < 5; index += 1) {
      const state = generated(region, year, `milestones-${region}-${index}`);
      const ids = new Set(lifeMilestones(state).map((milestone) => milestone.eventId));
      for (const id of expected) expect(ids.has(id), `${region} ${id}`).toBe(true);
      // Untold milestones stay visible in the final chronology as the background of the era.
      expect(historicalBackdrop(state).map((entry) => entry.id.slice("backdrop:".length))).toEqual(expect.arrayContaining([...expected]));
    }
  });

  it("respects lifetime and country: nothing before birth, after the conversation or from another state", () => {
    const state = generated("tver", 1935, "scope");
    const found = lifeMilestones(state);
    expect(found.every((milestone) => milestone.year >= 1935 && milestone.year <= state.selection.conversationYear)).toBe(true);
    expect(found.every((milestone) => milestone.definition.country === "RU")).toBe(true);
    expect(found.some((milestone) => milestone.eventId === "first_world_war_russia_1914")).toBe(false);
  });

  it("separates the four statements: lifetime, country, her place, and what she told", () => {
    const state = generated("fr-lille", 1925, "lille-occupied");
    const armistice = lifeMilestones(state).find((milestone) => milestone.eventId === "fr-nat-1940-armistice")!;
    expect(armistice.placeOccupied).toBe(true);
    expect(armistice.told).toBe(false);
    const paris = lifeMilestones(generated("fr-marseille", 1925, "marseille-1940")).find((milestone) => milestone.eventId === "fr-nat-1940-armistice")!;
    // Marseille lay in the unoccupied zone until November 1942.
    expect(paris.placeOccupied).toBe(false);
  });

  it("never lets a minor record take the place of a milestone in the same years", () => {
    for (const region of regions) {
      for (let index = 0; index < 6; index += 1) {
        const state = generated(region, 1905 + index * 5, `priority-${region}-${index}`);
        const backgrounds = timelineBackgrounds(state);
        const reachable = lifeMilestones(state);
        for (const point of lifeTimelinePoints(state.selection).filter((candidate) => !candidate.final)) {
          // A milestone that frames her turning point is spoken there, beside the decision.
          const anchor = state.biography.branches[0]?.historicalAnchor?.id;
          const due = reachable.filter((milestone) => milestone.year >= point.year && milestone.year <= point.endYear && milestone.eventId !== anchor);
          const spoken = backgrounds.get(point.year);
          const spokenMilestones = spokenItems(state).filter((item) => item.milestoneId).map((item) => item.id);
          // A milestone of these years is either the aside here or was already the aside of an earlier interval.
          const handled = due.every((milestone) => spokenMilestones.some((id) => id.endsWith(milestone.eventId)));
          if (due.length && spoken) expect(Boolean(spoken.milestoneId || spoken.companion?.milestoneId) || handled, `${region} ${point.year}`).toBe(true);
        }
      }
    }
  });

  it("follows an emigrant across a border: eligibility changes with her residence", () => {
    const state = generated("fr-lyon", 1920, "emigrant");
    const moved: GameSessionState = {
      ...state,
      biography: {
        ...state.biography,
        residenceHistory: [
          { placeId: "fr-lyon", fromYear: 1920, toYear: 1950 },
          { placeId: "us-chicago", fromYear: 1951, toYear: state.selection.conversationYear }
        ]
      }
    };
    const ids = new Set(lifeMilestones(moved).map((milestone) => milestone.eventId));
    expect(ids.has("fr-nat-1940-armistice")).toBe(true);
    expect(ids.has("us-nat-1941-pearl-harbor-war")).toBe(false);
    expect(ids.has("us-nat-1969-moon-landing")).toBe(true);
    expect(ids.has("fr-nat-1968-may-events")).toBe(false);
  });

  it("keeps separate states apart, e.g. West and East Germany (synthetic fixture, not game data)", () => {
    const location = (id: string, type: string, parents: WorldLocation["parents"], validFrom: string | null = null, validTo: string | null = null): WorldLocation => ({
      id, type, level: type === "world" ? "international" : type === "state" ? "national" : "municipal", country: "DE", settlementClass: type === "city" ? "large_city" : null,
      wikidata: null, coordinates: { lat: 51, lon: 10 }, names: [{ name: id, locative: null, from: null, to: null }], parents, occupations: [], validFrom, validTo, legacyIds: []
    });
    const event = (id: string, start: string, locationId: string): WorldEvent => ({
      id, title: id, start, end: null, precision: "day", approximate: false, scope: "national", locationIds: [locationId], countries: ["DE"], category: "political_change",
      summary: "Тестовая запись для проверки движка.", groups: [], eligibility: { minAge: null, maxAge: null, groupsAny: [] }, impacts: [], hooks: [], sensitive: false,
      sourceIds: [], confidence: "high", legacy: false
    });
    const locations = [
      location("world", "world", []),
      location("fx-frg", "state", [{ id: "world", from: null, to: null }], "1949-05-23", "1990-10-02"),
      location("fx-gdr", "state", [{ id: "world", from: null, to: null }], "1949-10-07", "1990-10-02"),
      location("fx-de", "state", [{ id: "world", from: null, to: null }], "1990-10-03", null),
      location("fx-bonn", "city", [{ id: "fx-frg", from: null, to: "1990-10-02" }, { id: "fx-de", from: "1990-10-03", to: null }]),
      location("fx-leipzig", "city", [{ id: "fx-gdr", from: null, to: "1990-10-02" }, { id: "fx-de", from: "1990-10-03", to: null }])
    ];
    const packs = new Map([
      ["fx-frg", { locationId: "fx-frg", version: "fixture", events: [event("fx-west-1955", "1955-05-05", "fx-frg")], contexts: [] }],
      ["fx-gdr", { locationId: "fx-gdr", version: "fixture", events: [event("fx-east-1953", "1953-06-17", "fx-gdr")], contexts: [] }],
      ["fx-de", { locationId: "fx-de", version: "fixture", events: [event("fx-unified-2000", "2000-01-01", "fx-de")], contexts: [] }]
    ]);
    const fixture: WorldData = { version: "fixture", locations: new Map(locations.map((item) => [item.id, item])), packs };
    const voice = { heard: "—", young: "—", lived: "—", deeper: "—" };
    const definitions: MilestoneDefinition[] = ["fx-west-1955", "fx-east-1953", "fx-unified-2000"].map((id) => ({ id, country: "RU", eventIds: [id], kind: "state_change", voice }));
    const life = (placeId: string) => ({
      selection: { birthYear: 1950, conversationYear: 2026 },
      biography: { residenceHistory: [{ placeId, fromYear: 1950, toYear: 2026 }], lifeEvents: [], relationship: { hasOwnChildren: false }, flags: [] }
    }) as unknown as GameSessionState;
    const west = lifeMilestones(life("fx-bonn"), definitions, fixture).map((milestone) => milestone.eventId);
    const east = lifeMilestones(life("fx-leipzig"), definitions, fixture).map((milestone) => milestone.eventId);
    // Born 1950: the West German record reaches only Bonn, the East German one only Leipzig.
    expect(west).toEqual(["fx-west-1955", "fx-unified-2000"]);
    expect(east).toEqual(["fx-east-1953", "fx-unified-2000"]);
    const youngerEast = lifeMilestones({ ...life("fx-leipzig"), selection: { birthYear: 1956, conversationYear: 2026 } } as GameSessionState, definitions, fixture).map((milestone) => milestone.eventId);
    expect(youngerEast).toEqual(["fx-unified-2000"]);
  });
});

describe("national and local share of spoken history", () => {
  it("approaches nine national items to one local across many lives", async () => {
    const counts = { national: 0, local: 0, personal: 0 };
    const byRegion: Record<string, { national: number; local: number; personal: number }> = {};
    for (const region of regions) {
      byRegion[region] = { national: 0, local: 0, personal: 0 };
      for (let index = 0; index < 40; index += 1) {
        const state = generated(region, 1900 + (index % 41), `ratio-${region}-${index}`);
        for (const item of spokenItems(state)) {
          counts[item.scope] += 1;
          byRegion[region]![item.scope] += 1;
        }
      }
    }
    const share = counts.local / (counts.local + counts.national);
    // Optional report for docs: HISTORY_STATS=path npx vitest run tests/history.test.ts
    const target = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env.HISTORY_STATS;
    if (target) {
      const fs = await import(/* @vite-ignore */ `node:${"fs"}`) as { writeFileSync: (path: string, data: string) => void };
      fs.writeFileSync(target, JSON.stringify({ counts, share, byRegion }, null, 2));
    }
    expect(counts.national + counts.local).toBeGreaterThan(2000);
    expect(share).toBeGreaterThan(LOCAL_SHARE - 0.04);
    expect(share).toBeLessThan(LOCAL_SHARE + 0.04);
  });

  it("never lets a local record of one place leak into another place's life", () => {
    const ownerOf = new Map<string, string>();
    for (const pack of world.packs.values()) for (const event of pack.events) if (event.scope !== "national" && event.scope !== "international" && event.scope !== "constituent") ownerOf.set(event.id, pack.locationId);
    for (const region of ["fr-lyon", "gb-manchester", "us-chicago", "pl-lodz"]) {
      for (let index = 0; index < 10; index += 1) {
        const state = generated(region, 1930, `leak-${region}-${index}`);
        const lived = new Set(state.biography.residenceHistory.map((residence) => residence.placeId));
        for (const item of spokenItems(state).filter((candidate) => candidate.scope === "local")) {
          const owner = ownerOf.get(item.id.replace(/^context:(world:)?/, ""));
          if (!owner) continue;
          expect([...lived].some((placeId) => owner === placeId || owner.startsWith(placeId.split("-")[0]!)), `${region}: ${item.id}`).toBe(true);
          expect(owner.startsWith(region.split("-")[0]!)).toBe(true);
        }
      }
    }
  });
});

const sentences = (text: string) => text.split(/(?<=[.!?…])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
const FIRST_PERSON = /(^|[^а-яё])(я|мы|мне|меня|нас|нам|мой|моя|моё|мои|у нас|сама)([^а-яё]|$)/i;

describe("historical narration", () => {
  it("turns verified records into first-person passages, never into a title", () => {
    let narrated = 0;
    // Records with legacy hand-written lines (historicalVoice) are checked by their editors; here: composed passages.
    for (const event of allWorldEvents().filter((candidate) => !candidate.sensitive && !historicalVoice[candidate.id])) {
      for (const age of [3, 10, 35, 80]) {
        const passage = narrateRecord({ eventId: event.id, summary: event.summary, category: event.category }, { age, wasPresent: true, runSeed: event.id, order: age });
        if (!passage) continue;
        narrated += 1;
        const parts = sentences(passage);
        expect(parts.length, passage).toBeGreaterThanOrEqual(2);
        expect(parts.every((sentence) => sentence.replace(/[.!?…]$/, "") !== event.title), passage).toBe(true);
        expect(FIRST_PERSON.test(passage), passage).toBe(true);
        expect(/\d{4}/.test(passage), passage).toBe(false);
      }
    }
    expect(narrated).toBeGreaterThan(400);
  });

  it("softens reference-book dates into speech", () => {
    expect(softenDates("В 1961 году прошла денежная реформа, цены уменьшились в десять раз.")).toBe("Тогда прошла денежная реформа, цены уменьшились в десять раз.");
    expect(softenDates("19 июня 1940 года германские войска заняли Лион.")).toBe("Германские войска заняли Лион.");
    expect(softenDates("После вторжения в ноябре 1942 года город был оккупирован.")).toBe("После вторжения тогда город был оккупирован.");
    // Ranges and other numbers cannot be rephrased safely: the sentence is not spoken rather than mangled.
    expect(softenDates("Закон от 9 декабря 1905 года гарантировал свободу совести.")).toBeNull();
    expect(softenDates("С 14 апреля 1957 по 27 ноября 1976 года мэром был Прадель.")).toBeNull();
    expect(spokenFactSentence("В 1923 г. Чикаго принял первое постановление о зонировании.")).toBe("Тогда Чикаго принял первое постановление о зонировании.");
    expect(spokenFactSentence("Население: 12 345 человек (по данным переписи).")).toBeNull();
  });

  it("gives every milestone an age-appropriate voice without personal claims the biography has not made", () => {
    const forbidden = /отец ушёл на фронт|папа ушёл на фронт|брата забрали|отца забрали|нас выселили|мы голодали|погиб(ла)? мой|моего мужа убили|меня арестовали/i;
    for (const milestone of milestones) {
      const child = narrateMilestone(milestone, { age: 3, wasPresent: true, runSeed: "m", order: 0 });
      const adult = narrateMilestone(milestone, { age: 40, wasPresent: true, runSeed: "m", order: 0, placeOccupied: true });
      expect(child).toContain(milestone.voice.heard);
      expect(adult).toContain(milestone.voice.lived);
      for (const text of [child, adult, milestone.voice.deeper]) {
        expect(forbidden.test(text), `${milestone.id}: ${text}`).toBe(false);
        expect(/\d{4}/.test(text), `${milestone.id}: ${text}`).toBe(false);
      }
    }
  });

  it.each(regions)("speaks history in a played %s conversation as connected speech that does not crowd out her life", (region) => {
    for (const outcome of ["pathA", "pathB"] as const) {
      const state = playToEnd(generated(region, 1925, `played-${region}-${outcome}`), outcome);
      expect(state.screen).toBe("atlas");
      expect(biographyIssues(state)).toEqual([]);
      const answers = state.dialogue.transcript.filter((turn) => turn.speaker === "grandmother").map((turn) => turn.text);
      const titles = new Set(knownAtlasEvents(state).filter((event) => event.provenance === "VERIFIED_HISTORICAL").map((event) => event.title));
      for (const answer of answers) {
        for (const sentence of sentences(answer)) expect(titles.has(sentence.replace(/[.!?…]$/, "")), `${region}: ${sentence}`).toBe(false);
        // A raw list would be three or more very short sentences in a row.
        const short = sentences(answer).map((sentence) => sentence.split(/\s+/).length <= 2);
        expect(short.some((value, index) => value && short[index + 1] && short[index + 2]), answer).toBe(false);
      }
      const historyTurns = state.biography.lifeEvents.filter((event) => event.known && event.provenance === "VERIFIED_HISTORICAL").length;
      expect(historyTurns, region).toBeLessThanOrEqual(answers.length * 0.6);
    }
  });
});
