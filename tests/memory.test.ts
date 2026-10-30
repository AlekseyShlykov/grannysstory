import { beforeAll, describe, expect, it } from "vitest";
import atlasJson from "../babushka_memory_atlas_5year.json";
import { atlasPatterns } from "../content/memory/atlasPatterns";
import type { GameSessionState } from "../src/data/types";
import { knownAtlasEvents } from "../src/engine/atlas";
import { biographyIssues, generateSession } from "../src/engine/biography";
import { atlasIssues, atlasMemoriesForBand, atlasRecords, bandWindow, eligibleVariant, recordKey } from "../src/engine/memory/atlas";
import { aliveIn, partnershipSpan, personById, planCanon } from "../src/engine/memory/lifeFacts";
import { lifeTimelinePoints } from "../src/engine/lifeTimeline";
import { parseSave, serializeSave } from "../src/engine/persistence";
import { selection } from "./helpers";
import { loadWholeWorld, packFor, playToEnd } from "./worldHelpers";

beforeAll(() => {
  loadWholeWorld();
});

const generated = (region: string, year: number, seed: string) => generateSession(selection(region, year, seed), packFor(region));
const annotationByKey = new Map(atlasPatterns.map((annotation) => [annotation.key, annotation]));
const toldAtlas = (state: GameSessionState) => state.memories.filter((memory) => memory.atlas && memory.recalled);

const lives: GameSessionState[] = [];
beforeAll(() => {
  const regions = ["tver", "leningrad", "fr-lyon", "gb-london", "pl-warszawa", "us-chicago"];
  for (let index = 0; index < 60; index += 1) {
    const region = regions[index % regions.length]!;
    lives.push(playToEnd(generated(region, 1900 + ((index * 7) % 41), `atlas-life-${index}`), index % 2 ? "pathA" : "pathB", (turn, count) => (turn + index) % count));
  }
});

describe("memory atlas data", () => {
  it("loads every scenario pattern of the shipped atlas, with a narrative annotation for each", () => {
    // The brief speaks of 200 patterns; the shipped file holds 20 bands × 7 = 140, and that is what is integrated.
    expect(atlasRecords).toHaveLength((atlasJson as { records: number }).records);
    expect(atlasRecords).toHaveLength(140);
    expect(atlasIssues()).toEqual([]);
    expect(new Set(atlasRecords.map((record) => record.age_from)).size).toBe(20);
    expect(atlasRecords.every((record) => record.evidence_level === "scenario_synthesis_not_measured_frequency")).toBe(true);
  });

  it("interprets five-year age bands on her own calendar", () => {
    const state = generated("tver", 1932, "bands");
    expect(bandWindow(state, 0)).toEqual({ ageFrom: 0, fromYear: 1932, toYear: 1936 });
    expect(bandWindow(state, 20)).toEqual({ ageFrom: 20, fromYear: 1952, toYear: 1956 });
    // The last band is cut at the conversation year, never in her future.
    expect(bandWindow(state, 90).toYear).toBe(state.selection.conversationYear);
  });
});

describe("memories inside generated lives", () => {
  it("tells atlas memories only at their age and only when this life's canon allows them", () => {
    let checked = 0;
    for (const state of lives) {
      expect(biographyIssues(state)).toEqual([]);
      for (const memory of toldAtlas(state)) {
        const atlas = memory.atlas!;
        const event = state.biography.lifeEvents.find((candidate) => candidate.id === memory.lifeEventId)!;
        expect(event.known).toBe(true);
        expect(event.year - state.selection.birthYear).toBeGreaterThanOrEqual(atlas.ageFrom);
        expect(event.year - state.selection.birthYear).toBeLessThanOrEqual(atlas.ageFrom + 4);
        // Canon decided later (the turning point, a partner) never contradicts a memory already told.
        const band = bandWindow(state, atlas.ageFrom);
        expect(eligibleVariant(state, annotationByKey.get(atlas.patternKey)!, band), `${state.selection.runSeed} ${atlas.patternKey}`).not.toBeNull();
        for (const personId of atlas.relatedPeople) {
          const person = personById(state, personId);
          if (person && ["grandmother_mother", "grandmother_father", "sibling"].includes(person.id)) expect(person.birthYear).toBeLessThanOrEqual(band.toYear);
        }
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(200);
  });

  it("never gives a childless life a memory about her own child, nor a single life one about a partner", () => {
    for (const state of lives) {
      const keys = new Set(toldAtlas(state).map((memory) => memory.atlas!.patternKey));
      const texts = state.biography.lifeEvents.filter((event) => event.id.startsWith("life:memory:")).map((event) => event.text).join(" ");
      if (!state.biography.relationship.hasOwnChildren) {
        expect(texts).not.toMatch(/мой ребёнок|моя дочь|мой сын/i);
        expect(keys.has("25:2") && /родил/.test(texts)).toBe(false);
      }
      if (partnershipSpan(state) === null) expect(texts).not.toMatch(/\bмуж\b|мужа\b/);
    }
  });

  it("only mourns parents who died in that band and only cares for parents who were alive", () => {
    for (const state of lives) {
      for (const memory of toldAtlas(state)) {
        const band = bandWindow(state, memory.atlas!.ageFrom);
        const event = state.biography.lifeEvents.find((candidate) => candidate.id === memory.lifeEventId)!;
        if (/не стало (мамы|папы)/.test(event.text)) {
          const lost = ["grandmother_mother", "grandmother_father"].map((id) => personById(state, id)!).find((person) => person.deathYear! >= band.fromYear && person.deathYear! <= band.toYear);
          expect(lost, event.text).toBeDefined();
        }
        if (/помогала маме|у мамы|маме/.test(event.text) && memory.atlas!.ageFrom >= 30) expect(aliveIn(personById(state, "grandmother_mother"), band.fromYear), event.text).toBe(true);
      }
    }
  });

  it("does not give every grandmother the same life or one memory per age band", () => {
    const signatures = new Set(lives.map((state) => toldAtlas(state).map((memory) => memory.atlas!.patternKey).sort().join("|")));
    expect(signatures.size).toBe(lives.length);
    const told = lives.map((state) => toldAtlas(state).length);
    expect(Math.max(...told) - Math.min(...told)).toBeGreaterThanOrEqual(3);
    for (const state of lives) {
      const bands = new Set(toldAtlas(state).map((memory) => memory.atlas!.ageFrom));
      const reached = lifeTimelinePoints(state.selection).filter((point) => !point.final && point.age % 5 === 0).length;
      expect(bands.size).toBeLessThan(reached);
    }
  });

  it("weights adolescence and early adulthood without forbidding memories at other ages", () => {
    const perBand = new Map<number, number>();
    for (let index = 0; index < 600; index += 1) {
      const state = generated("tver", 1920, `plan-${index}`);
      for (const slot of planCanon(state.selection, state.biography).memoryPlan) perBand.set(slot.ageFrom, (perBand.get(slot.ageFrom) ?? 0) + slot.slots);
    }
    const mean = (bands: number[]) => bands.reduce((sum, band) => sum + (perBand.get(band) ?? 0), 0) / bands.length;
    expect(mean([15, 20])).toBeGreaterThan(mean([60, 65, 70]) * 1.8);
    for (const band of [0, 40, 75, 95]) expect(perBand.get(band) ?? 0).toBeGreaterThan(0);
  });

  it("tells earliest memories as reconstructed, never as crisp infant recall", () => {
    let found = 0;
    for (let index = 0; index < 300 && found < 15; index += 1) {
      const state = generated("tver", 1930, `infant-${index}`);
      for (const memory of atlasMemoriesForBand(state, 0)) {
        found += 1;
        expect(memory.properties.memoryVividness).toBe("reconstructed");
      }
    }
    expect(found).toBeGreaterThan(5);
    for (const state of lives) {
      for (const memory of toldAtlas(state).filter((candidate) => candidate.atlas!.ageFrom === 0)) expect(memory.atlas!.memoryVividness).toBe("reconstructed");
    }
  });

  it("keeps life impact and personal significance as separate dimensions", () => {
    const all = lives.flatMap((state) => toldAtlas(state).map((memory) => memory.atlas!));
    // An ordinary episode can be central to her, and a life-changing one can feel secondary.
    expect(all.some((atlas) => (atlas.lifeImpact === "slight" || atlas.lifeImpact === "notable") && atlas.personalSignificance === "central")).toBe(true);
    expect(all.some((atlas) => (atlas.lifeImpact === "reshaping" || atlas.lifeImpact === "defining") && (atlas.personalSignificance === "passing" || atlas.personalSignificance === "kept"))).toBe(true);
    for (const atlas of all) {
      expect(atlas.emotionalTone.length).toBeGreaterThan(0);
      expect(atlas.currentInterpretation.length).toBeGreaterThan(10);
    }
    expect(all.some((atlas) => atlas.relatedChoices.length > 0)).toBe(true);
  });

  it("keeps untold memories as hers, not the player's", () => {
    // A band with three memories: she tells one, mentions a second, and keeps the third to herself.
    const base = generated("tver", 1930, "three-memories");
    const crowded: GameSessionState = { ...base, biography: { ...base.biography, canon: { ...base.biography.canon!, memoryPlan: [{ ageFrom: 15, slots: 3 }] } } };
    const state = playToEnd(crowded, "pathA");
    const fifteen = state.memories.filter((memory) => memory.atlas?.ageFrom === 15);
    expect(fifteen).toHaveLength(3);
    expect(fifteen.filter((memory) => memory.recalled)).toHaveLength(2);
    const untold = fifteen.find((memory) => !memory.recalled)!;
    expect(state.biography.lifeEvents.find((event) => event.id === untold.lifeEventId)?.known).toBe(false);
    expect(knownAtlasEvents(state).some((event) => event.id === untold.lifeEventId)).toBe(false);
  });

  it("round-trips atlas memories and the life canon through a save", () => {
    const state = lives[3]!;
    const restored = parseSave(serializeSave(state))!;
    expect(restored.memories).toEqual(state.memories);
    expect(restored.biography.canon).toEqual(state.biography.canon);
    expect(recordKey(atlasRecords[0]!)).toBe("0:1");
  });
});
