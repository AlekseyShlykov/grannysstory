import { getPlace, placeNameAt } from "../data/world";
import type { GameSessionState, LifeEvent } from "../data/types";

export interface AtlasEvent extends LifeEvent {
  age: number;
  placeName: string;
}

export function knownAtlasEvents(state: GameSessionState): AtlasEvent[] {
  return state.biography.lifeEvents
    .filter((event) => event.known)
    .map((event) => ({ ...event, age: event.year - state.selection.birthYear, placeName: placeNameAt(event.placeId, event.year) }))
    .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
}

export interface AtlasBounds {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

/**
 * Projects recorded residences onto a 600×310 schematic. Bounds fit the places of this life with padding, so a
 * Tver life and a Lyon → Paris life both stay legible; the frame never implies a precise route.
 */
export function atlasRoute(state: GameSessionState): {
  points: { placeId: string; name: string; x: number; y: number; fromYear: number; toYear: number }[];
  bounds: AtlasBounds;
} {
  const located = state.biography.residenceHistory.map((residence) => ({ residence, place: getPlace(residence.placeId) }));
  const lons = located.map((item) => item.place.coordinates.lon);
  const lats = located.map((item) => item.place.coordinates.lat);
  const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2;
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const halfLon = Math.max((Math.max(...lons) - Math.min(...lons)) / 2 + 1.5, 4);
  const halfLat = Math.max((Math.max(...lats) - Math.min(...lats)) / 2 + 1, 2.5);
  const bounds = { minLon: centerLon - halfLon, maxLon: centerLon + halfLon, minLat: centerLat - halfLat, maxLat: centerLat + halfLat };
  return {
    bounds,
    points: located.map(({ residence, place }) => ({
      placeId: residence.placeId,
      name: placeNameAt(residence.placeId, residence.fromYear),
      x: 30 + ((place.coordinates.lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 540,
      y: 270 - ((place.coordinates.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 230,
      fromYear: residence.fromYear,
      toYear: residence.toYear
    }))
  };
}

export function unknownPeriods(state: GameSessionState): string[] {
  const known = knownAtlasEvents(state);
  const periods: string[] = [];
  for (let index = 1; index < known.length; index += 1) {
    const previous = known[index - 1];
    const current = known[index];
    if (previous && current && current.year - previous.year >= 16) periods.push(`${previous.year + 1}–${current.year - 1}`);
  }
  return periods.slice(0, 3);
}
