// Shapes for the registry of essential national milestones (content/historical/milestones.ts).
// Facts live in the verified world records referenced by `eventIds`; this file only adds the editorial
// "essential" status and the grandmother's original wording (narrative voice, not testimony).

export type MilestoneKind =
  | "war"
  | "war_end"
  | "revolution"
  | "civil_war"
  | "occupation"
  | "state_change"
  | "repression"
  | "economic_crisis"
  | "social_transformation"
  | "pandemic"
  | "disaster";

export interface MilestoneVoice {
  /** Age < 6: known from adults, not remembered. */
  heard: string;
  /** Age 6–15: a child's perception. */
  young: string;
  /** Age 16+: lived as an adult. */
  lived: string;
  /** Optional: appended when the registry says her residence was under military occupation on that date. */
  occupied?: string;
  /** One sentence on what changed in ordinary days afterwards, without personal claims beyond the plausible. */
  change?: string;
  /** Answer when the player asks to hear more («А как это было у вас?»), 2–3 sentences. */
  deeper: string;
}

export interface MilestoneDefinition {
  id: string;
  country: "RU" | "PL" | "FR" | "GB" | "US";
  /** Verified record ids (world dataset or legacy v0.4); the first one present in loaded data is used. */
  eventIds: string[];
  kind: MilestoneKind;
  voice: MilestoneVoice;
}
