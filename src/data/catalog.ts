import moscowJson from "../../content/historical/moscow.json";
import leningradJson from "../../content/historical/leningrad.json";
import tverJson from "../../content/historical/tver.json";
import novgorodJson from "../../content/historical/novgorod.json";
import smolenskJson from "../../content/historical/smolensk.json";
import type { RegionId, RegionPack } from "./types";
export { getPlace, manifest, placeNameAt, places } from "./world";
export const regionPacks: Record<RegionId, RegionPack> = {
  moscow: moscowJson as RegionPack,
  leningrad: leningradJson as RegionPack,
  tver: tverJson as RegionPack,
  novgorod: novgorodJson as RegionPack,
  smolensk: smolenskJson as RegionPack
};
