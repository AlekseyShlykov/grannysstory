import type { MilestoneDefinition } from "../../historical/milestoneSchema";
import type { HistoricalVoice } from "../historicalVoice";
import type { Occupation } from "../occupations";
import type { RegionNarrative } from "../regions";

/**
 * Hand-written narrative content for one country added in world-1.2. Facts come only from verified world records
 * (event ids, place ids); every line here is original fiction in the grandmother's voice, reviewed against
 * dialogue_bible.md. English for every Russian string lives in src/i18n/en/<country>.json.
 */
export interface CountryContent {
  /** ISO country code (IT, ES, JP …). */
  country: string;
  /** Keyed by world location id of a menu settlement; a place appears in the menu only with an entry here (D-010). */
  regionNarratives: Record<string, RegionNarrative>;
  /** Jobs of this country: named workplaces only where verified records place them. */
  occupations: Occupation[];
  /** Ids of the neutral generic jobs in occupations.ts (west-*) whose wording fits this country. */
  sharedGenericJobIds: string[];
  /** Women's usual retirement age used by the late work line, with what the source says. */
  retirementAge: { age: number; note: string };
  /** Essential national milestones of this country, referencing verified record ids. */
  milestones: MilestoneDefinition[];
  /** Optional hand-written lines for characteristic local records (D-012). */
  historicalVoice: Record<string, HistoricalVoice>;
}

export function emptyCountryContent(country: string, age = 60): CountryContent {
  return {
    country,
    regionNarratives: {},
    occupations: [],
    sharedGenericJobIds: [],
    retirementAge: { age, note: "заглушка до вычитанного текста" },
    milestones: [],
    historicalVoice: {}
  };
}
