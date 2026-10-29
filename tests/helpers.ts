import { manifest } from "../src/data/catalog";
import { interviewYearForBirthYear } from "../src/engine/setup";
import type { RegionId, StartSelection } from "../src/data/types";

export function selection(region: RegionId = "tver", year = 1932, seed = "test-seed-001"): StartSelection {
  return {
    birthRegionId: region,
    birthYear: year,
    runSeed: seed,
    datasetVersion: manifest.datasetVersion,
    conversationYear: interviewYearForBirthYear(year)
  };
}
