import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { clearWorldPacks, ensureWorldPacks, packIdsFor, worldData, worldManifest } from "../src/data/worldStore";
import type { WorldPack } from "../src/data/worldTypes";

const packs = import.meta.glob<WorldPack>("../public/data/world/packs/*.json", { eager: true, import: "default" });
const rawPacks = import.meta.glob<string>("../public/data/world/packs/*.json", { eager: true, query: "?raw", import: "default" });
type CacheRow = WorldPack | { locationId: string; sha256: string; pack: WorldPack };
let webcrypto: Crypto;
beforeAll(async () => {
  // Actual Web Crypto, while the browser environment supplies IndexedDB and media-test setup.
  webcrypto = (await vi.importActual<{ webcrypto: Crypto }>("node:crypto")).webcrypto;
});

/** Minimal asynchronous IndexedDB transport; tests exercise the actual loader and cache decisions. */
function memoryDatabase(rows: Map<string, CacheRow>): IDBFactory {
  const request = (result: unknown) => {
    const value = { result, onsuccess: undefined as undefined | (() => void) };
    queueMicrotask(() => value.onsuccess?.());
    return value;
  };
  const database = {
    objectStoreNames: { contains: () => true },
    transaction: () => ({ objectStore: () => ({
      get: (id: string) => request(rows.get(id)),
      put: (row: CacheRow) => { rows.set(row.locationId, row); return request(row.locationId); }
    }) })
  };
  return { open: () => request(database) } as unknown as IDBFactory;
}

afterEach(() => { clearWorldPacks(); vi.unstubAllGlobals(); });

describe("country pack cache updates", () => {
  it.each(["obsolete checksum", "legacy entry", "corrupt events", "corrupt translations"])("refreshes %s and then works offline", async (kind) => {
    clearWorldPacks();
    const ids = packIdsFor(["es-madrid"], 1900, 2020);
    const rows = new Map<string, CacheRow>(ids.map((id) => [id, {
      locationId: id, sha256: worldManifest.packs[id]!.sha256,
      pack: packs[`../public/data/world/packs/${id}.json`]!
    }]));
    const madrid = packs["../public/data/world/packs/es-madrid.json"]!;
    if (kind === "legacy entry") rows.set("es-madrid", madrid);
    else rows.set("es-madrid", {
      locationId: "es-madrid", sha256: kind === "obsolete checksum" ? "old" : worldManifest.packs["es-madrid"]!.sha256,
      pack: (kind === "corrupt events" ? { ...madrid, events: null }
        : kind === "corrupt translations" ? { ...madrid, translations: { "текст": null } }
        : { ...madrid, events: [] }) as unknown as WorldPack
    });
    vi.stubGlobal("indexedDB", memoryDatabase(rows));
    vi.stubGlobal("crypto", webcrypto);
    const online = vi.fn().mockResolvedValue({ ok: true, text: async () => rawPacks["../public/data/world/packs/es-madrid.json"] });
    vi.stubGlobal("fetch", online);
    expect(await ensureWorldPacks(["es-madrid"], 1900, 2020)).toEqual([]);
    expect(online).toHaveBeenCalledTimes(1);
    expect(online.mock.calls[0]![0]).toContain(`?sha256=${worldManifest.packs["es-madrid"]!.sha256}`);
    expect(worldData().packs.get("es-madrid")!.events).toEqual(madrid.events);
    clearWorldPacks();
    const offline = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", offline);
    expect(await ensureWorldPacks(["es-madrid"], 1900, 2020)).toEqual([]);
    expect(offline).not.toHaveBeenCalled();
    expect([...worldData().packs.keys()].sort()).toEqual([...ids].sort());
  });

  it("rejects an outdated static response with a current version and never writes it into IndexedDB", async () => {
    clearWorldPacks();
    const rows = new Map<string, CacheRow>();
    for (const id of packIdsFor(["es-madrid"], 1900, 2020).filter((id) => id !== "es-madrid")) rows.set(id, {
      locationId: id, sha256: worldManifest.packs[id]!.sha256,
      pack: packs[`../public/data/world/packs/${id}.json`]!
    });
    vi.stubGlobal("indexedDB", memoryDatabase(rows));
    vi.stubGlobal("crypto", webcrypto);
    const wrong = { ...packs["../public/data/world/packs/es-madrid.json"]!, events: [] };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => JSON.stringify(wrong) }));
    expect(await ensureWorldPacks(["es-madrid"], 1900, 2020)).toEqual(["es-madrid"]);
    expect(rows.has("es-madrid")).toBe(false);
    expect(worldData().packs.has("es-madrid")).toBe(false);
  });
});
