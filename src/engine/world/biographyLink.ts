import { isNarrativeHistoricalEvent, isSpokenSignificant } from "../../../content/historical/significance";
import type { BiographyState, BranchType, HistoricalAnchor } from "../../data/types";
import type { WorldData } from "../../data/worldTypes";
import type { RandomSource } from "../random";
import { relevantEvents, type LifeProfile, type RelevantEvent, type ResidencePeriod } from "./events";
import { getLocation, resolveLocationId } from "./geography";

// Which kinds of verified circumstances can frame each personal turning point. The framing is presented as
// "this was happening then", never as the cause of her decision.
const anchorCategories: Record<BranchType, string[]> = {
  education: ["education"],
  profession: ["local_economy", "labor", "technology", "economic_crisis"],
  migration: ["infrastructure_transport", "local_economy", "housing_urban", "migration", "economic_crisis"],
  love: ["culture_leisure", "everyday_life", "infrastructure_transport"],
  marriage: ["housing_urban", "everyday_life", "economic_crisis", "migration"],
  familyResponsibility: ["healthcare", "social_policy", "public_health", "housing_urban"],
  friendship: ["culture_leisure", "sport", "media_communication", "everyday_life"],
  dream: ["culture_leisure", "technology", "media_communication", "education"]
};

export function lifeResidences(biography: Pick<BiographyState, "residenceHistory">): ResidencePeriod[] {
  return biography.residenceHistory.map((residence) => ({ ...residence }));
}

export function lifeProfile(birthYear: number, world: WorldData, biography: Pick<BiographyState, "residenceHistory" | "relationship" | "flags">): LifeProfile {
  const groups = ["women", "all_residents"];
  const home = getLocation(world, biography.residenceHistory[0]?.placeId ?? "");
  groups.push(home?.settlementClass === "rural" ? "rural_residents" : "urban_residents");
  if (biography.relationship.hasOwnChildren) groups.push("parents", "mothers");
  if (biography.flags.includes("married")) groups.push("married");
  return { birthYear, groups };
}

// Reproductive law is real background for her years, but placing it beside a personal turning point would
// imply a link the game cannot know. Such records may be voiced as background, never as a branch framing.
const NOT_A_FRAMING = /аборт|контрацеп|беремен/i;

function anchorFromEvent(item: RelevantEvent): HistoricalAnchor {
  return {
    kind: "event",
    id: item.event.id,
    title: item.event.title,
    summary: item.event.summary,
    year: item.year,
    level: item.level,
    sourceIds: item.event.sourceIds
  };
}

/** Verified dated events near a turning point at the place she lived then. */
export function branchAnchorCandidates(world: WorldData, residences: ResidencePeriod[], profile: LifeProfile, type: BranchType, year: number): HistoricalAnchor[] {
  return relevantEvents(world, residences, profile, year - 4, year)
    .filter((item) => !item.event.sensitive
      && anchorCategories[type].includes(item.event.category)
      && isNarrativeHistoricalEvent(item.event.title)
      && isSpokenSignificant(item.event.id, item.event.title, item.event.category)
      && !NOT_A_FRAMING.test(`${item.event.title} ${item.event.summary}`))
    .map(anchorFromEvent);
}

/**
 * History narrows which turning points are plausible: a branch type is offered only when the verified data has
 * circumstances to frame it at that place and time. If nothing qualifies, every type stays possible.
 */
export function chooseBranchWithHistory<T extends { type: BranchType }>(
  world: WorldData,
  residences: ResidencePeriod[],
  profile: LifeProfile,
  catalog: readonly T[],
  initial: T,
  year: number,
  random: RandomSource
): { definition: T; anchor: HistoricalAnchor | null } {
  const anchored = catalog
    .map((definition) => ({ definition, anchors: branchAnchorCandidates(world, residences, profile, definition.type, year) }))
    .filter((candidate) => candidate.anchors.length);
  if (!anchored.length) return { definition: initial, anchor: null };
  const chosen = anchored.find((candidate) => candidate.definition.type === initial.type) ?? random.pick(anchored);
  return { definition: chosen.definition, anchor: random.pick(chosen.anchors) };
}
