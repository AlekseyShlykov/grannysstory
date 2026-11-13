import { manifest } from "../data/world";
import { worldData, worldManifest } from "../data/worldStore";
import { getLocation, isSettlement, worldNameAt } from "./world/geography";
import { reviewedWorldRegionIds } from "../../content/scenes/regions";
import type { RegionId, StartSelection } from "../data/types";

export function allowedYears(): number[] {
  const years: number[] = [];
  for (let year = manifest.allowedBirthYears.from; year <= manifest.allowedBirthYears.to; year += 1) years.push(year);
  return years;
}

export function interviewYearForBirthYear(birthYear: number): number {
  return Math.min(birthYear + 100, manifest.conversationYear);
}

export interface RegionOption {
  id: RegionId;
  label: string;
  coverage: string;
  enabled: boolean;
  countryId?: string;
  locationId?: string;
  pack?: string;
  preview?: boolean;
  /** Part of a divided city she lives in during the division (Berlin: west or east), chosen on the opening screen. */
  partitionPart?: string;
}

const LEGACY_LOCATIONS = new Set(["ru-moscow", "ru-saint-petersburg", "ru-tver", "ru-veliky-novgorod", "ru-smolensk"]);
const COUNTRY_IDS: Record<string, string> = {
  CN: "china",
  DE: "germany",
  FI: "finland",
  FR: "france",
  GB: "united-kingdom",
  IT: "italy",
  PL: "poland",
  RU: "russia",
  TR: "turkey",
  US: "united-states"
};

/**
 * World-dataset settlements are public only after passing both gates: historical coverage and a reviewed
 * regional narrative. The archive country is explicit so the opening screen never guesses it from an id.
 */
// The menu depends only on the bundled manifest, registry and reviewed texts, so it is computed once.
let cachedWorldRegions: RegionOption[] | null = null;

export function worldRegionOptions(): RegionOption[] {
  if (cachedWorldRegions) return cachedWorldRegions.map((region) => ({ ...region }));
  const world = worldData();
  cachedWorldRegions = Object.entries(worldManifest.coverage)
    // world-1.3 places also need readiness «supported»: archival evidence, eras and everyday context, not just records.
    .filter(([id, coverage]) => coverage.meetsCoverageGate && (coverage.readiness === undefined || coverage.readiness === "supported")
      && reviewedWorldRegionIds.has(id) && !LEGACY_LOCATIONS.has(id))
    .map(([id]) => getLocation(world, id))
    .filter((location): location is NonNullable<typeof location> => Boolean(location && isSettlement(location) && location.coordinates))
    .map((location) => ({
      id: location.id,
      label: worldNameAt(world, location.id, "2020-12-31"),
      coverage: `${worldManifest.coverage[location.id]!.localEvents} проверенных местных записей; вступление и бытовые воспоминания вычитаны для этой локации.`,
      enabled: true,
      countryId: location.country ? COUNTRY_IDS[location.country] : undefined,
      locationId: location.id,
      preview: false
    }))
    .filter((region) => Boolean(region.countryId))
    .sort((a, b) => a.countryId!.localeCompare(b.countryId!) || a.label.localeCompare(b.label, "ru"));
  return cachedWorldRegions.map((region) => ({ ...region }));
}

/**
 * Saves from 12–13 November 2026 chose a side of Berlin on the opening screen («Берлин, западная часть»). The menu
 * now offers only the city and the side is settled in conversation, but those saves still resolve.
 */
function sideOfCityOptions(): RegionOption[] {
  const world = worldData();
  return worldRegionOptions().flatMap((region) => (getLocation(world, region.locationId ?? "")?.partitions ?? [])
    .flatMap((partition) => partition.into)
    .map((part) => ({ ...region, id: part, label: `${region.label}, ${PART_LABELS[part] ?? worldNameAt(world, part, "1975-07-01")}`, partitionPart: part })));
}

export function regionOption(id: RegionId): RegionOption | undefined {
  return (manifest.regions as RegionOption[]).find((entry) => entry.id === id)
    ?? worldRegionOptions().find((entry) => entry.id === id)
    ?? sideOfCityOptions().find((entry) => entry.id === id);
}

const PART_LABELS: Record<string, string> = { "de-berlin-west": "западная часть", "de-berlin-east": "восточная часть" };

/** Region whose hand-written texts a selection uses: a chosen side of a divided city uses the city's texts. */
export function narrativeRegionId(regionId: RegionId): RegionId {
  const region = regionOption(regionId);
  return region?.partitionPart && region.locationId ? region.locationId : regionId;
}

export function menuRegions(_preview = false): RegionOption[] {
  const ratified = (manifest.regions as RegionOption[]).filter((region) => region.enabled);
  return [...ratified, ...worldRegionOptions()];
}

export function validateSelection(selection: StartSelection): string[] {
  const errors: string[] = [];
  const region = regionOption(selection.birthRegionId);
  if (!region?.enabled) errors.push("Этот регион пока недоступен.");
  if (region?.locationId && !region.pack && !worldManifest.coverage[region.locationId]?.meetsCoverageGate) {
    errors.push("Для этого места пока недостаточно проверенных исторических данных.");
  }
  if (!allowedYears().includes(selection.birthYear)) errors.push("Этот год не входит в проверенное покрытие.");
  if (selection.conversationYear !== interviewYearForBirthYear(selection.birthYear)) {
    errors.push("Год разговора должен совпадать со столетием героини или 2020 годом, если к нему ей ещё нет ста лет.");
  }
  if (selection.datasetVersion !== manifest.datasetVersion) errors.push("Версия набора данных не поддерживается.");
  return errors;
}

export function isRegionId(value: string): value is RegionId {
  return Boolean(regionOption(value)?.enabled);
}
