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
}

const LEGACY_LOCATIONS = new Set(["ru-moscow", "ru-saint-petersburg", "ru-tver", "ru-veliky-novgorod", "ru-smolensk"]);
const COUNTRY_IDS: Record<string, string> = {
  FR: "france",
  GB: "united-kingdom",
  PL: "poland",
  RU: "russia",
  US: "united-states"
};

/**
 * World-dataset settlements are public only after passing both gates: historical coverage and a reviewed
 * regional narrative. The archive country is explicit so the opening screen never guesses it from an id.
 */
export function worldRegionOptions(): RegionOption[] {
  const world = worldData();
  return Object.entries(worldManifest.coverage)
    .filter(([id, coverage]) => coverage.meetsCoverageGate && reviewedWorldRegionIds.has(id) && !LEGACY_LOCATIONS.has(id))
    .map(([id]) => getLocation(world, id))
    .filter((location): location is NonNullable<typeof location> => Boolean(location && isSettlement(location) && location.coordinates))
    .map((location) => ({
      id: location.id,
      label: worldNameAt(world, location.id, "2025-07-01"),
      coverage: `${worldManifest.coverage[location.id]!.localEvents} проверенных местных записей; вступление и бытовые воспоминания вычитаны для этой локации.`,
      enabled: true,
      countryId: location.country ? COUNTRY_IDS[location.country] : undefined,
      locationId: location.id,
      preview: false
    }))
    .filter((region) => Boolean(region.countryId))
    .sort((a, b) => a.countryId!.localeCompare(b.countryId!) || a.label.localeCompare(b.label, "ru"));
}

function regionOption(id: RegionId): RegionOption | undefined {
  return (manifest.regions as RegionOption[]).find((entry) => entry.id === id) ?? worldRegionOptions().find((entry) => entry.id === id);
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
    errors.push("Год разговора должен совпадать со столетием героини или текущим годом, если столетие ещё не наступило.");
  }
  if (selection.datasetVersion !== manifest.datasetVersion) errors.push("Версия набора данных не поддерживается.");
  return errors;
}

export function isRegionId(value: string): value is RegionId {
  return Boolean(regionOption(value)?.enabled);
}
