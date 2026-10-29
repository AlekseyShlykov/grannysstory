import manifestJson from "../../content/historical/manifest.json";
import placesJson from "../../content/historical/places.json";
import { getLocation, isoDay, periodEnd, periodStart, worldLocativeAt, worldNameAt } from "../engine/world/geography";
import type { Place } from "./types";
import { worldData } from "./worldStore";

export const manifest = manifestJson;
export const places = placesJson as Place[];

// v0.4 place ids ("tver", "moscow", …) keep their reviewed year-based names; every other id resolves through
// the world registry (public/data/world/locations.json), which also knows the legacy ids as aliases.
function worldPlace(id: string): Place | null {
  const location = getLocation(worldData(), id);
  if (!location?.coordinates) return null;
  return {
    id,
    regionId: location.id,
    coordinates: location.coordinates,
    sourceId: "wikidata",
    names: location.names.map((name) => ({
      from: Number(periodStart(name.from).slice(0, 4)),
      to: Number(periodEnd(name.to).slice(0, 4)),
      name: name.name
    }))
  };
}

export function getPlace(id: string): Place {
  const place = places.find((candidate) => candidate.id === id) ?? worldPlace(id);
  if (!place) throw new Error(`Unknown place: ${id}`);
  return place;
}

export function placeNameAt(id: string, year: number): string {
  const legacy = places.find((candidate) => candidate.id === id);
  if (!legacy) return worldNameAt(worldData(), id, isoDay(year));
  return legacy.names.find((name) => year >= name.from && year <= name.to)?.name ?? legacy.names.at(-1)?.name ?? id;
}

/** Prepositional form for speech ("в Калинине", "в Лионе"); null when the registry has none. */
export function placeLocativeAt(id: string, year: number): string | null {
  return worldLocativeAt(worldData(), id, isoDay(year));
}
