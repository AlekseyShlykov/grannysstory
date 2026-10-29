import type { GameSessionState } from "../data/types";
import { branchCatalog } from "../../content/scenes/branchCatalog";
import { interviewYearForBirthYear, validateSelection } from "./setup";
import { manifest } from "../data/world";

export const SAVE_KEY = "babushka.save.v2";
const LEGACY_SAVE_KEY = "babushka.save.v1";

export function serializeSave(state: GameSessionState): string {
  return JSON.stringify(state);
}

export function parseSave(raw: string | null): GameSessionState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Omit<Partial<GameSessionState>, "saveFormatVersion"> & { saveFormatVersion?: number };
    if (!parsed.selection || !parsed.biography || !parsed.dialogue || !parsed.discovery) return null;
    if (parsed.saveFormatVersion === 2 && parsed.biography.relationship && Array.isArray(parsed.biography.themes)) {
      const current = parsed as GameSessionState;
      const expectedConversationYear = interviewYearForBirthYear(current.selection.birthYear);
      const needsTimelineMigration = current.selection.datasetVersion !== manifest.datasetVersion
        || current.selection.conversationYear !== expectedConversationYear
        || current.dialogue.sceneId !== "timeline";
      if (needsTimelineMigration) {
        current.selection = {
          ...current.selection,
          datasetVersion: manifest.datasetVersion,
          conversationYear: expectedConversationYear
        };
        current.biography.residenceHistory = current.biography.residenceHistory.map((residence, index, all) => (
          index === all.length - 1 ? { ...residence, toYear: expectedConversationYear } : residence
        ));
        current.biography.lifeEvents = current.biography.lifeEvents.filter((event) => event.year <= expectedConversationYear);
        const retainedEventIds = new Set(current.biography.lifeEvents.map((event) => event.id));
        current.memories = current.memories.filter((memory) => retainedEventIds.has(memory.lifeEventId));
        current.discovery.facts = current.discovery.facts
          .map((fact) => ({ ...fact, lifeEventIds: fact.lifeEventIds.filter((id) => retainedEventIds.has(id)) }))
          .filter((fact) => fact.lifeEventIds.length > 0 || fact.id.startsWith("fact:branch-setup:"));
        current.dialogue = {
          sceneId: "timeline",
          step: 0,
          transcript: [{ speaker: "grandmother", text: "Давай попробуем порядком, по пять лет. Так я и сама вспомню, как всё связано." }]
        };
        current.screen = "conversation";
      }
      if (validateSelection(current.selection).length) return null;
      return current;
    }
    if (parsed.saveFormatVersion !== 1) return null;
    const legacy = parsed as unknown as Record<string, any>;
    const biography = legacy.biography;
    const activeType = biography.branches?.[0]?.type;
    const definition = branchCatalog.find((candidate) => candidate.type === activeType);
    const renameEventId = (id: string) => id === "life:parent-birth" ? "life:family-connection" : id;
    biography.lifeEvents = biography.lifeEvents.map((event: Record<string, any>) => ({ ...event, id: renameEventId(event.id) }));
    biography.relationship = {
      variant: "biological_grandmother",
      playerRelationLabel: "родная бабушка",
      introduction: "Она твоя родная бабушка; это родство восстановлено из старого сохранения.",
      childrenStatus: "biological_parent",
      childrenText: "У неё родился ребёнок, который позже стал твоим родителем.",
      hasOwnChildren: true,
      familyAnchorId: "parent",
      edges: [
        { fromId: "grandmother", toId: "parent", kind: "biological_parent" },
        { fromId: "parent", toId: "player", kind: "biological_parent" }
      ]
    };
    biography.themes = [...new Set([...(definition?.themes ?? []), "healthAgingAndIndependence", "smallJoysAndGratitude", "meaningAndLegacy"])];
    legacy.memories = legacy.memories.map((memory: Record<string, any>) => ({
      ...memory,
      lifeEventId: renameEventId(memory.lifeEventId),
      qualities: { pride: false, regret: false, gratitude: memory.interpretation === "маленькая память", acceptance: false }
    }));
    legacy.discovery.facts = legacy.discovery.facts.map((fact: Record<string, any>) => ({
      ...fact,
      lifeEventIds: fact.lifeEventIds.map(renameEventId)
    }));
    legacy.saveFormatVersion = 2;
    legacy.selection.datasetVersion = manifest.datasetVersion;
    const expectedConversationYear = interviewYearForBirthYear(legacy.selection.birthYear);
    legacy.selection.conversationYear = expectedConversationYear;
    legacy.biography.residenceHistory = legacy.biography.residenceHistory.map((residence: Record<string, any>, index: number, all: unknown[]) => (
      index === all.length - 1 ? { ...residence, toYear: expectedConversationYear } : residence
    ));
    legacy.biography.lifeEvents = legacy.biography.lifeEvents.filter((event: Record<string, any>) => event.year <= expectedConversationYear);
    const retainedEventIds = new Set(legacy.biography.lifeEvents.map((event: Record<string, any>) => event.id));
    legacy.memories = legacy.memories.filter((memory: Record<string, any>) => retainedEventIds.has(memory.lifeEventId));
    legacy.discovery.facts = legacy.discovery.facts
      .map((fact: Record<string, any>) => ({ ...fact, lifeEventIds: fact.lifeEventIds.filter((id: string) => retainedEventIds.has(id)) }))
      .filter((fact: Record<string, any>) => fact.lifeEventIds.length > 0);
    legacy.dialogue = {
      sceneId: "timeline",
      step: 0,
      transcript: [{ speaker: "grandmother", text: "Давай попробуем порядком, по пять лет." }]
    };
    legacy.screen = "conversation";
    return validateSelection(legacy.selection).length ? null : legacy as GameSessionState;
  } catch {
    return null;
  }
}

export function saveGame(state: GameSessionState): void {
  localStorage.setItem(SAVE_KEY, serializeSave(state));
}

export function loadGame(): GameSessionState | null {
  const current = parseSave(localStorage.getItem(SAVE_KEY));
  if (current) return current;
  const migrated = parseSave(localStorage.getItem(LEGACY_SAVE_KEY));
  if (migrated) saveGame(migrated);
  return migrated;
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
  localStorage.removeItem(LEGACY_SAVE_KEY);
}
