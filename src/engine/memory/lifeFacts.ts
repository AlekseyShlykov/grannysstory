import type { BiographyState, GameSessionState, LifeCanon, Person, RelationshipState, StartSelection } from "../../data/types";
import { getLocation } from "../world/geography";
import { worldData } from "../../data/worldStore";
import { seededRandom } from "../random";
import { currentOccupation, workEndYear } from "../work";

// Canon about the people around her and the shape of her remembered life. Every draw uses its own seeded
// stream, so adding this layer does not shift any older part of a generated life.

/** Age bands of the memory atlas: 0–4, 5–9 … 95–99. */
export const ATLAS_BANDS = Array.from({ length: 20 }, (_, index) => index * 5);

/**
 * Editorial weights for how many memories a band tends to hold, following the reminiscence bump (more
 * self-defining memories from adolescence and early adulthood). A tendency, not a quota: lives differ.
 */
const bandWeight = (ageFrom: number): number => {
  if (ageFrom < 5) return 0.4;
  if (ageFrom < 10) return 0.8;
  if (ageFrom < 30) return ageFrom < 15 || ageFrom >= 25 ? 1.4 : 1.9;
  if (ageFrom < 80) return 0.75;
  return 0.9;
};

export function childhoodFamily(selection: StartSelection, relationship: RelationshipState, existing: Person[]): Person[] {
  const random = seededRandom(`${selection.runSeed}:childhood-family`);
  const birth = selection.birthYear;
  const lastYear = selection.conversationYear - 1;
  // A sibling bridge of the kinship graph is her real sibling; otherwise she may have a younger one.
  const bridgeSibling = relationship.variant === "great_aunt" ? existing.find((person) => person.id === relationship.familyAnchorId) : undefined;
  const hasYounger = !bridgeSibling && random.next() < 0.55;
  const siblingBirth = bridgeSibling?.birthYear ?? (hasYounger ? birth + random.int(1, 7) : null);
  const latestChildBirth = Math.max(birth, siblingBirth ?? birth);
  const motherBirth = Math.max(birth - random.int(19, 36), latestChildBirth - 44);
  const fatherBirth = birth - random.int(21, 40);
  // Parents live at least until the youngest child is born; nobody outlives the conversation by more than a century.
  const death = (bornIn: number, earliest: number) => Math.max(earliest, Math.min(bornIn + random.int(46, 94), lastYear));
  const people: Person[] = [
    // Every turning point (age 19–27) speaks of her mother as living, so the mother is alive until at least 28.
    { id: "grandmother_mother", name: "её мама", birthYear: motherBirth, parentIds: [], sex: "female", deathYear: death(motherBirth, Math.max(latestChildBirth + 1, birth + 28)) },
    { id: "grandmother_father", name: "её отец", birthYear: fatherBirth, parentIds: [], sex: "male", deathYear: death(fatherBirth, latestChildBirth) }
  ];
  const siblingSex = random.next() < 0.5 ? "female" : "male";
  if (siblingBirth !== null && !bridgeSibling) {
    const siblingDeath = siblingBirth + random.int(55, 98);
    people.push({
      id: "sibling",
      name: siblingSex === "female" ? "её младшая сестра" : "её младший брат",
      birthYear: siblingBirth,
      parentIds: ["grandmother_mother", "grandmother_father"],
      sex: siblingSex,
      deathYear: siblingDeath <= lastYear ? siblingDeath : null
    });
  }
  return people;
}

export function planCanon(selection: StartSelection, biography: Pick<BiographyState, "people" | "relationship">): LifeCanon {
  const partner = seededRandom(`${selection.runSeed}:partnership`);
  const birth = selection.birthYear;
  const childBirth = biography.relationship.hasOwnChildren ? biography.people.find((person) => person.id === "parent")?.birthYear ?? null : null;
  const biological = biography.relationship.childrenStatus === "biological_parent";
  const chance = biological ? 0.85 : biography.relationship.hasOwnChildren ? 0.6 : 0.45;
  const plannedStart = partner.next() < chance
    ? (biological && childBirth ? childBirth - partner.int(1, 3) : birth + partner.int(20, 38))
    : null;
  const endDraw = partner.next();
  const deathAge = partner.int(55, 88);
  const separationAfter = partner.int(5, 25);
  const end = endDraw < 0.55 ? { kind: "death" as const, offset: deathAge }
    : endDraw < 0.7 ? { kind: "separation" as const, offset: separationAfter }
    : null;

  const plan = seededRandom(`${selection.runSeed}:memory-plan`);
  const reachedAge = selection.conversationYear - birth;
  const bands = ATLAS_BANDS.filter((ageFrom) => ageFrom <= reachedAge);
  const slots = new Map<number, number>(bands.map((ageFrom) => [ageFrom, 0]));
  const total = plan.int(9, 14);
  for (let draw = 0; draw < total * 3 && [...slots.values()].reduce((sum, value) => sum + value, 0) < total; draw += 1) {
    const open = bands.filter((ageFrom) => (slots.get(ageFrom) ?? 0) < 3);
    const weightSum = open.reduce((sum, ageFrom) => sum + bandWeight(ageFrom), 0);
    let ticket = plan.next() * weightSum;
    const chosen = open.find((ageFrom) => (ticket -= bandWeight(ageFrom)) <= 0) ?? open.at(-1);
    if (chosen !== undefined) slots.set(chosen, (slots.get(chosen) ?? 0) + 1);
  }
  return {
    partnership: {
      plannedStart,
      end
    },
    memoryPlan: bands.map((ageFrom) => ({ ageFrom, slots: slots.get(ageFrom) ?? 0 })).filter((slot) => slot.slots > 0)
  };
}

export interface PartnershipSpan {
  start: number;
  /** Year it ended (inclusive end of shared life) and how; null when still together at the conversation. */
  end: { kind: "death" | "separation"; year: number } | null;
}

/**
 * The partnership of this life, or null without one. "undetermined" while a love or marriage turning point is
 * still open: then nothing may be said that presumes either outcome.
 */
export function partnershipSpan(state: GameSessionState): PartnershipSpan | null | "undetermined" {
  const canon = state.biography.canon;
  if (!canon) return "undetermined";
  const branch = state.biography.branches[0];
  let start = canon.partnership.plannedStart;
  if (branch && (branch.type === "love" || branch.type === "marriage")) {
    if (!branch.resolved || !branch.outcome) return "undetermined";
    start = branch.outcome.id === "pathA" ? branch.year : null;
  }
  if (start === null) return null;
  const rule = canon.partnership.end;
  const last = state.selection.conversationYear - 1;
  if (!rule) return { start, end: null };
  const year = rule.kind === "death" ? state.selection.birthYear + rule.offset : start + rule.offset;
  // The marriage turning point says they laughed together for decades; it never ends in a quick separation.
  if (rule.kind === "separation" && branch?.type === "marriage") return { start, end: null };
  if (year <= start + 2 || year > last) return { start, end: null };
  return { start, end: { kind: rule.kind, year } };
}

export function personById(state: GameSessionState, id: string): Person | undefined {
  return state.biography.people.find((person) => person.id === id);
}

export function aliveIn(person: Person | undefined, year: number): boolean {
  return Boolean(person && person.birthYear <= year && (person.deathYear === undefined || person.deathYear === null || person.deathYear >= year));
}

export function siblingOf(state: GameSessionState): Person | undefined {
  const relationship = state.biography.relationship;
  if (relationship.variant === "great_aunt") return personById(state, relationship.familyAnchorId);
  return personById(state, "sibling");
}

export function isRural(state: GameSessionState): boolean {
  const birthPlace = state.biography.residenceHistory[0]?.placeId ?? "";
  return getLocation(worldData(), birthPlace)?.settlementClass === "rural";
}

/** Years of her working life, or null without a canonical job. */
export function workSpan(state: GameSessionState): { start: number; end: number } | null {
  const work = state.biography.work;
  const occupation = currentOccupation(state);
  if (!work || !occupation) return null;
  return { start: work.startYear, end: workEndYear(state, occupation) };
}
