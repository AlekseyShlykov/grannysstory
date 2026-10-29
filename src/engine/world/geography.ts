import type { GeoLevel, PartialDate, WorldData, WorldLocation } from "../../data/worldTypes";

// Partial dates compare as strings once expanded: a period starts on its first day and ends on its last.
// "1974-04" ends on "1974-04-31", which sorts correctly even though the day does not exist.
export function periodStart(value: PartialDate): string {
  if (value === null) return "0000-00-00";
  if (value.length === 4) return `${value}-01-01`;
  if (value.length === 7) return `${value}-01`;
  return value;
}

export function periodEnd(value: PartialDate): string {
  if (value === null) return "9999-99-99";
  if (value.length === 4) return `${value}-12-31`;
  if (value.length === 7) return `${value}-31`;
  return value;
}

export function inPeriod(day: string, from: PartialDate, to: PartialDate): boolean {
  return periodStart(from) <= day && day <= periodEnd(to);
}

export function isoDay(year: number, month = 7, day = 1): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function resolveLocationId(world: WorldData, id: string): string | null {
  if (world.locations.has(id)) return id;
  for (const location of world.locations.values()) if (location.legacyIds.includes(id)) return location.id;
  return null;
}

export function getLocation(world: WorldData, id: string): WorldLocation | null {
  const resolved = resolveLocationId(world, id);
  return resolved ? world.locations.get(resolved) ?? null : null;
}

export function parentAt(world: WorldData, id: string, day: string): string | null {
  return world.locations.get(id)?.parents.find((parent) => inPeriod(day, parent.from, parent.to))?.id ?? null;
}

/** The location itself first, then each administrative parent valid on that day, ending at "world". */
export function ancestorsAt(world: WorldData, id: string, day: string): string[] {
  const start = resolveLocationId(world, id);
  const chain: string[] = [];
  let current = start;
  while (current && !chain.includes(current)) {
    chain.push(current);
    current = parentAt(world, current, day);
  }
  return chain;
}

/** Topmost state in the chain: a Tver resident in 1950 lives in the USSR, in 2000 in the Russian Federation. */
export function sovereignAt(world: WorldData, id: string, day: string): string | null {
  const states = ancestorsAt(world, id, day).filter((node) => world.locations.get(node)?.type === "state");
  return states.at(-1) ?? null;
}

export function levelOf(world: WorldData, id: string): GeoLevel | null {
  return world.locations.get(id)?.level ?? null;
}

export function existsAt(location: WorldLocation, day: string): boolean {
  return inPeriod(day, location.validFrom, location.validTo);
}

export function occupationAt(world: WorldData, id: string, day: string): string | null {
  for (const node of ancestorsAt(world, id, day)) {
    const occupation = world.locations.get(node)?.occupations.find((item) => inPeriod(day, item.from, item.to));
    if (occupation) return occupation.by ?? "occupied";
  }
  return null;
}

/** Display name valid on a day; falls back to the latest known name. */
export function worldNameAt(world: WorldData, id: string, day: string): string {
  const location = getLocation(world, id);
  if (!location) return id;
  return location.names.find((name) => inPeriod(day, name.from, name.to))?.name ?? location.names.at(-1)?.name ?? location.id;
}

export function worldLocativeAt(world: WorldData, id: string, day: string): string | null {
  const location = getLocation(world, id);
  return location?.names.find((name) => inPeriod(day, name.from, name.to))?.locative ?? null;
}

export function isSettlement(location: WorldLocation): boolean {
  return location.settlementClass !== null && ["city", "town", "village", "rural_area", "gmina"].includes(location.type);
}
