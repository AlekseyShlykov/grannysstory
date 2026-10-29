import { manifest } from "./world";
import { menuRegions } from "../engine/setup";
import type { RegionId, RegionPack } from "./types";

const DATABASE = "babushka-data";
const STORE = "region-packs";

function openDatabase(): Promise<IDBDatabase | null> {
  if (!("indexedDB" in globalThis)) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, { keyPath: "regionId" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function cachedPack(regionId: RegionId): Promise<RegionPack | null> {
  const database = await openDatabase();
  if (!database) return null;
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE, "readonly").objectStore(STORE).get(regionId);
    request.onsuccess = () => {
      const pack = request.result as RegionPack | undefined;
      resolve(pack?.version === manifest.datasetVersion ? pack : null);
    };
    request.onerror = () => reject(request.error);
  });
}

async function storePack(pack: RegionPack): Promise<void> {
  const database = await openDatabase();
  if (!database) return;
  await new Promise<void>((resolve, reject) => {
    const request = database.transaction(STORE, "readwrite").objectStore(STORE).put(pack);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function validateLoadedPack(value: unknown, regionId: RegionId): RegionPack {
  if (!value || typeof value !== "object") throw new Error("Пакет региона повреждён.");
  const pack = value as Partial<RegionPack>;
  if (pack.regionId !== regionId || pack.version !== manifest.datasetVersion || !Array.isArray(pack.events) || !Array.isArray(pack.birthPlaces)) {
    throw new Error("Версия или структура регионального пакета не поддерживается.");
  }
  return pack as RegionPack;
}

/**
 * Regions backed only by the world dataset have no v0.4 pack: their birthplace is a registry location and their
 * local history arrives through world packs, so the legacy pack is an empty shell.
 */
function worldRegionPack(regionId: RegionId): RegionPack | null {
  const region = menuRegions(true).find((candidate) => candidate.id === regionId && candidate.enabled);
  if (!region?.locationId || region.pack) return null;
  return { regionId, version: manifest.datasetVersion, label: region.label, coverage: region.coverage, birthPlaces: [region.locationId], events: [] };
}

export async function loadRegionPack(regionId: RegionId): Promise<RegionPack> {
  const worldOnly = worldRegionPack(regionId);
  if (worldOnly) return worldOnly;
  const cached = await cachedPack(regionId).catch(() => null);
  if (cached) return validateLoadedPack(cached, regionId);
  const region = manifest.regions.find((candidate) => candidate.id === regionId && candidate.enabled);
  if (!region) throw new Error("Регион недоступен.");
  const response = await fetch(`${import.meta.env.BASE_URL}data/regions/${region.pack}`);
  if (!response.ok) throw new Error("Не удалось загрузить локальный пакет региона.");
  const pack = validateLoadedPack(await response.json(), regionId);
  await storePack(pack).catch(() => undefined);
  return pack;
}
