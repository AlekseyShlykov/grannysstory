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
  titleA: string;
  titleB: string;
  themes: [ThemeId, ThemeId];
  movesOnA?: boolean;
  movesOnB?: boolean;
}
