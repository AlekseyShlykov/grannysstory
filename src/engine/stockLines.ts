import { changeByCategory, perspective, ties } from "../../content/scenes/historicalNarration";

// Short general sentences that frame history and memories. They carry no facts, so in one conversation each is said
// at most once: a repeat is replaced by an unused sentence of the same group, or left out when the group is used up.
export const secondMemoryLeads = ["А ещё из тех лет вот что осталось.", "И ещё одно вспомнилось.", "Знаешь, что ещё было?"];
export const FAINT_MEMORY_NOTE = "Хотя помню это смутно, может, что-то и досочинила.";

const groups: string[][] = [
  ...Object.values(changeByCategory).map((pool) => [...pool]),
  [...ties],
  // Her reaction after a stated fact («У нас тогда только об этом и говорили»), one group per perspective.
  ...Object.values(perspective).map((pool) => [...pool.after]),
  [...secondMemoryLeads],
  [FAINT_MEMORY_NOTE]
];
const groupOf = new Map(groups.flatMap((group) => group.map((line) => [line, group] as const)));

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?…])\s+/u);
}

/** Her answer with every stock sentence already said in this conversation replaced or left out. */
export function withoutRepeatedStockLines(answer: string, earlier: readonly string[]): string {
  const said = new Set(earlier.flatMap((text) => text.split(/\n+/u).flatMap(sentences)));
  return answer.split(/(\n+)/u).map((block) => {
    if (/^\n+$/u.test(block)) return block;
    return sentences(block).map((sentence) => {
      const group = groupOf.get(sentence);
      if (!group || !said.has(sentence)) {
        said.add(sentence);
        return sentence;
      }
      const fresh = group.find((line) => !said.has(line));
      if (fresh) said.add(fresh);
      return fresh ?? "";
    }).filter(Boolean).join(" ");
  }).join("");
}
