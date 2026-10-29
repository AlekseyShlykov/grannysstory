import locationsJson from "../../public/data/world/locations.json";
import manifestJson from "../../public/data/world/manifest.json";
import { ancestorsAt, isoDay } from "../engine/world/geography";
import type { WorldData, WorldLocation, WorldManifest, WorldPack } from "./worldTypes";

// The registry and manifest are small and needed synchronously (place names, menu gating), so they are bundled.
// Event/context packs are fetched on demand per location, cached in IndexedDB and kept in memory here.
export const worldManifest = manifestJson as WorldManifest;
const registry = new Map<string, WorldLocation>((locationsJson.locations as WorldLocation[]).map((location) => [location.id, location]));
const loadedPacks = new Map<string, WorldPack>();

const DATABASE = "babushka-world";
const STORE = "packs";

export function worldData(): WorldData {
  return { version: worldManifest.worldDatasetVersion, locations: registry, packs: loadedPacks };
}

export function hasWorldPacks(): boolean {
  return loadedPacks.size > 0;
}

export function registerWorldPack(pack: WorldPack): void {
  loadedPacks.set(pack.locationId, pack);
}

export function clearWorldPacks(): void {
  loadedPacks.clear();
}

export function validateWorldPack(value: unknown, locationId: string): WorldPack {
  const pack = value as Partial<WorldPack> | null;
  if (!pack || pack.locationId !== locationId || pack.version !== worldManifest.worldDatasetVersion || !Array.isArray(pack.events) || !Array.isArray(pack.contexts)) {
    throw new Error(`World pack ${locationId} is missing, corrupt or from another dataset version`);
  }
  return pack as WorldPack;
}

/** Pack ids a set of residences can inherit from across a span of years. */
export function packIdsFor(placeIds: string[], fromYear: number, toYear: number): string[] {
  const world = worldData();
  const ids = new Set<string>();
  for (const placeId of placeIds) {
    for (let year = fromYear; year <= toYear; year += 1) {
      for (const node of ancestorsAt(world, placeId, isoDay(year, 1, 1))) ids.add(node);
      for (const node of ancestorsAt(world, placeId, isoDay(year, 12, 31))) ids.add(node);
    }
  }
  return [...ids].filter((id) => worldManifest.packs[id]);
}

function openDatabase(): Promise<IDBDatabase | null> {
  if (!("indexedDB" in globalThis)) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: "locationId" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function cachedPack(locationId: string): Promise<WorldPack | null> {
  const database = await openDatabase();
  if (!database) return null;
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE, "readonly").objectStore(STORE).get(locationId);
    request.onsuccess = () => {
      const pack = request.result as WorldPack | undefined;
      resolve(pack?.version === worldManifest.worldDatasetVersion ? pack : null);
    };
    request.onerror = () => reject(request.error);
  });
}

async function storePack(pack: WorldPack): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE, "readwrite").objectStore(STORE).put(pack);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function loadPack(locationId: string): Promise<WorldPack> {
  const cached = await cachedPack(locationId).catch(() => null);
  if (cached) return validateWorldPack(cached, locationId);
  const entry = worldManifest.packs[locationId];
  if (!entry) throw new Error(`No world pack for ${locationId}`);
  const response = await fetch(`${import.meta.env.BASE_URL}data/world/${entry.file}`);
  if (!response.ok) throw new Error(`World pack ${locationId} is unavailable`);
  const pack = validateWorldPack(await response.json(), locationId);
  await storePack(pack).catch(() => undefined);
  return pack;
}

/**
 * Loads every pack the given places can inherit from. Missing or corrupt packs are skipped and reported:
 * the game then falls back to coarser context (or the bundled v0.4 national layer), never to invented data.
 */
export async function ensureWorldPacks(placeIds: string[], fromYear: number, toYear: number): Promise<string[]> {
  const failed: string[] = [];
  await Promise.all(packIdsFor(placeIds, fromYear, toYear)
    .filter((id) => !loadedPacks.has(id))
    .map(async (id) => {
      try {
        registerWorldPack(await loadPack(id));
      } catch {
        failed.push(id);
      }
    }));
  return failed;
}
