// Region ids come from content/historical/manifest.json; the v0.4 packs are "moscow", "leningrad", "tver",
// "novgorod" and "smolensk". World-dataset regions use registry location ids.
export type RegionId = string;
export type ProvenanceCategory = "VERIFIED_HISTORICAL" | "DATA_DERIVED" | "FICTIONAL_PERSONAL";
export type BranchType =
  | "education"
  | "profession"
  | "migration"
  | "love"
  | "marriage"
  | "familyResponsibility"
  | "friendship"
  | "dream";

export type KinshipVariant = "biological_grandmother" | "adoptive_grandmother" | "great_aunt" | "cousin_grandmother";
export type ChildrenStatus =
  | "biological_parent"
  | "adoptive_parent"
  | "chose_no_children"
  | "wanted_no_children"
  | "circumstances_changed"
  | "no_strong_preference"
  | "mentor_without_children";
export type RelationshipKind = "biological_parent" | "adoptive_parent" | "sibling" | "cousin";
export type ThemeId =
  | "loveAndIntimacy"
  | "familyAndResponsibility"
  | "friendshipAndLoneliness"
  | "freedomAndIndependence"
  | "workAndVocation"
  | "moneyAndSecurity"
  | "timeAndMissedOpportunities"
  | "healthAgingAndIndependence"
  | "regretAndForgiveness"
  | "hardshipAndVulnerability"
  | "smallJoysAndGratitude"
  | "meaningAndLegacy";

export interface StartSelection {
  birthRegionId: RegionId;
  birthYear: number;
  runSeed: string;
  datasetVersion: string;
  conversationYear: number;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  locationId: string;
  startDate: string;
  endDate: string;
  classification: "VERIFIED_HISTORICAL";
  sourceId: string;
  verificationStatus: "verified";
  historicalContext: string;
  applicability: {
    residentPlaceIds: string[];
    minAge: number;
    maxAge: number;
    requiresFlag?: string;
  };
  confidence: "high" | "medium";
}

export interface NationalHistoricalEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  sourceId: string;
  historicalContext: string;
  scale?: "major" | "cultural" | "everyday";
}

export interface RegionPack {
  regionId: RegionId;
  version: string;
  label: string;
  coverage: string;
  birthPlaces: string[];
  events: HistoricalEvent[];
}

export interface Place {
  id: string;
  regionId: RegionId;
  coordinates: { lat: number; lon: number };
  sourceId: string;
  names: { from: number; to: number; name: string }[];
}

export interface Person {
  id: "grandmother" | "parent" | "player" | string;
  name: string;
  birthYear: number;
  parentIds: string[];
  /** Absent in older saves, where the family was described as «бабушка или дедушка». */
  sex?: "female" | "male";
  /** Hidden canon for the people of her own childhood; null when alive at the conversation. */
  deathYear?: number | null;
}

/**
 * A life with or without a partner. Lives whose turning point is about love or marriage take the branch outcome
 * instead of `plannedStart`; the plan only fills lives where the conversation never decides it.
 */
export interface PartnershipPlan {
  /** Year a lasting partnership begins when no turning point decides it; null: she lives without one. */
  plannedStart: number | null;
  /**
   * How it may end: a partner's death at her age `offset`, or a separation `offset` years after it began.
   * Applied to whichever start the life actually has; an end after the conversation means it did not end.
   */
  end: { kind: "death" | "separation"; offset: number } | null;
}

export interface LifeCanon {
  partnership: PartnershipPlan;
  /** Five-year age bands (age_from) and how many atlas memories she carries from each; most bands carry none. */
  memoryPlan: { ageFrom: number; slots: number }[];
}

export type LifeImpact = "slight" | "notable" | "reshaping" | "defining";
export type PersonalSignificance = "passing" | "kept" | "treasured" | "central";
export type MemoryVividness = "reconstructed" | "faint" | "clear" | "vivid";

/** The separate dimensions of one remembered episode; none is shown to the player as a value. */
export interface AtlasMemoryProperties {
  patternKey: string;
  ageFrom: number;
  lifeImpact: LifeImpact;
  personalSignificance: PersonalSignificance;
  memoryVividness: MemoryVividness;
  emotionalTone: string[];
  currentInterpretation: string;
  relatedPeople: string[];
  relatedChoices: string[];
}

export type RegretStance = "regret" | "mixed" | "grief_without_regret" | "no_major_regret" | "rejects_the_word";

/** The locked answer of the late-life conversation (saved as `lateLifeReflection`). */
export interface LateLifeReflection {
  archetypeId: string;
  /** Provisional cluster id; see data/research/sprouht_regrets_top7.json. Null for no-regret answers. */
  clusterId: string | null;
  stance: RegretStance;
  year: number;
  age: number;
  relatedEventIds: string[];
  qualities: EmotionalQualities;
  /** What she said, for the atlas; the spoken answer can be longer. */
  summary: string;
  /** Set when no 80–90 point exists in the conversation and an earlier reflection was used. */
  omittedReason?: string;
}

export interface RelationshipEdge {
  fromId: string;
  toId: string;
  kind: RelationshipKind;
}

export interface RelationshipState {
  variant: KinshipVariant;
  playerRelationLabel: string;
  introduction: string;
  childrenStatus: ChildrenStatus;
  childrenText: string;
  hasOwnChildren: boolean;
  familyAnchorId: string;
  edges: RelationshipEdge[];
}

export interface EmotionalQualities {
  pride: boolean;
  regret: boolean;
  gratitude: boolean;
  acceptance: boolean;
}

export interface LifeEvent {
  id: string;
  year: number;
  title: string;
  text: string;
  placeId: string;
  peopleIds: string[];
  provenance: ProvenanceCategory;
  sourceIds: string[];
  salience: "quiet" | "personal" | "historical";
  known: boolean;
  /** Verified records that framed a personal event; shown beside it in the atlas, not as its cause. */
  historicalContextIds?: string[];
}

/** Verified circumstance near a turning point. It frames the decision but is never presented as its cause. */
export interface HistoricalAnchor {
  kind: "event" | "context";
  id: string;
  title: string;
  summary: string;
  year: number;
  level: string;
  sourceIds: string[];
}

export interface BranchOutcome {
  id: "pathA" | "pathB";
  committedAtStep: number;
}

export interface BranchState {
  id: string;
  type: BranchType;
  year: number;
  resolved: boolean;
  outcome: BranchOutcome | null;
  /** Added in world dataset v1; older saves simply have no anchor. */
  historicalAnchor?: HistoricalAnchor | null;
  /** Planned destination when the branch can move her; older saves fall back to the region narrative. */
  destinationPlaceId?: string | null;
}

export interface MemoryState {
  id: string;
  lifeEventId: string;
  recalled: boolean;
  interpretation: string;
  qualities: EmotionalQualities;
  /** Present for memories drawn from the memory atlas. */
  atlas?: AtlasMemoryProperties;
}

export interface ConversationFact {
  id: string;
  learnedAtStep: number;
  lifeEventIds: string[];
}

export interface BiographyState {
  people: Person[];
  relationship: RelationshipState;
  /** Present in lives generated with the coherent early-memory system; absent in older saves. */
  narrativeThreadId?: string;
  traits: string[];
  themes: ThemeId[];
  residenceHistory: { placeId: string; fromYear: number; toYear: number }[];
  lifeEvents: LifeEvent[];
  branches: BranchState[];
  flags: string[];
  /** Canonical work; absent in older saves. With a work-shaping branch the job depends on its outcome. */
  work?: WorkState;
  /** Partnership and memory plan; absent in older saves, which keep the earlier life-course fragments. */
  canon?: LifeCanon;
  /** Locked once spoken; later answers and the atlas must agree with it. */
  lateLifeReflection?: LateLifeReflection;
}

export interface WorkState {
  startYear: number;
  occupationId?: string;
  byOutcome?: { pathA: string; pathB: string };
}

export interface DialogueState {
  sceneId:
    | "timeline"
    | "opening"
    | "family"
    | "history"
    | "childhood"
    | "turning"
    | "consequence"
    | "work"
    | "relationships"
    | "ordinary"
    | "aging"
    | "legacy"
    | "ending";
  step: number;
  transcript: { speaker: "grandmother" | "player"; text: string }[];
}

export interface DiscoveryState {
  facts: ConversationFact[];
}

export interface GameSessionState {
  saveFormatVersion: 2;
  selection: StartSelection;
  biography: BiographyState;
  memories: MemoryState[];
  dialogue: DialogueState;
  discovery: DiscoveryState;
  screen: "conversation" | "atlas";
  updatedAt: string;
}

export interface BranchDefinition {
  type: BranchType;
  label: string;
  setup: string;
  questionA: string;
  questionB: string;
  answerA: string;
  answerB: string;
  consequenceA: string;
  consequenceB: string;
  /** Said one interval before the turning point; hints at it without deciding anything. */
  foreshadow: string;
  /** Said at the end of the conversation, looking back at the outcome that became canon. */
  lateA: string;
  lateB: string;
  titleA: string;
  titleB: string;
  themes: [ThemeId, ThemeId];
  movesOnA?: boolean;
  movesOnB?: boolean;
}
