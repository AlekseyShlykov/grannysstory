import type { BranchType, ThemeId } from "../../src/data/types";

// Shapes for the narrative layer of the memory atlas (babushka_memory_atlas_5year.json). The JSON records are
// scenario patterns, not measured frequencies; these annotations say when a pattern can belong to a generated
// life and how she tells it. Everything here is original fiction (FICTIONAL_PERSONAL).

/**
 * Canon a pattern needs. A "band" is the five-year age interval of the pattern (e.g. 20–24) placed on her life.
 * Every requirement of a variant must hold; a pattern is eligible when at least one variant is.
 */
export type MemoryRequirement =
  | "attended_school"
  | "has_sibling"
  | "younger_sibling_born_in_band"
  | "mother_alive"
  | "father_alive"
  | "parent_alive"
  | "parent_dies_in_band"
  | "parent_elderly_alive"
  | "both_parents_dead_by_band"
  | "moved_in_band"
  | "moved_before_band_end"
  | "never_moved"
  | "working_in_band"
  | "work_starts_in_band"
  | "retires_in_band"
  | "retired_before_band"
  | "own_children"
  | "adopted_child"
  | "child_born_in_band"
  | "no_own_children"
  | "younger_relatives_in_band"
  | "player_born_by_band"
  | "partner_in_band"
  | "partner_died_in_band"
  | "partner_separated_in_band"
  | "partner_died_before_band"
  | "no_partner_in_band"
  | "ever_partnered_by_band"
  | "urban"
  | "rural"
  | `branch:${BranchType}`
  | `outcome:${BranchType}:${"pathA" | "pathB"}`;

/** People a pattern touches; resolved to person ids of the generated family. */
export type MemoryPersonRole = "mother" | "father" | "parent_any" | "sibling" | "partner" | "child" | "younger_relatives" | "friend";

/**
 * Text placeholders, filled from canon:
 * {place} locative of her residence that year («в Калинине»), {sibling} брат/сестра, {siblingAcc} брата/сестру,
 * {lostParent} мама/папа (the parent who dies in the band, else the living one), {lostParentGen} мамы/папы,
 * {child} дочь/сын, {childAcc} дочь/сына.
 */
export interface MemoryVariant {
  when: MemoryRequirement[];
  /** The concrete recollection, 1–2 sentences, first person. */
  scene: string;
  /** How it felt then, 1 sentence. */
  feeling: string;
  /** How she sees it today, 1 sentence; becomes `currentInterpretation`. */
  now: string;
}

export interface AtlasPatternAnnotation {
  /** `${age_from}:${item}` of the JSON record. */
  key: string;
  themes: ThemeId[];
  /** Editorial guess of how much such an episode usually reshapes a life: 0 barely, 3 profoundly. Not measured. */
  impact: 0 | 1 | 2 | 3;
  people: MemoryPersonRole[];
  /** World event categories that may illuminate this memory when history is mentioned beside it. */
  historyCategories?: string[];
  variants: MemoryVariant[];
}
