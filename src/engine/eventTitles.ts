import type { LifeEvent } from "../data/types";

/** Turns a spoken recollection into a compact, concrete heading without exposing the whole answer. */
export function narrativeHeadline(text: string, maxLength = 132): string {
  const firstSentence = text.trim().split(/(?<=[.!?…])\s+/u)[0] ?? text.trim();
  const headline = firstSentence.replace(/[.!?…]+$/u, "").trim();
  if (headline.length <= maxLength) return headline;
  return `${headline.slice(0, maxLength - 1).trimEnd()}…`;
}

/** Older saves may still contain editorial pattern names or the former consequence prefix. */
export function concreteEventTitle(event: Pick<LifeEvent, "id" | "title" | "text">): string {
  const editorialChoice = event.id.startsWith("life:") && /\bили\b|\bвыбор между\b/iu.test(event.title);
  const needsConcreteTitle = event.id.startsWith("life:memory:")
    || event.id.endsWith(":consequence")
    || /^Позднее последствие:/iu.test(event.title)
    || editorialChoice;
  return needsConcreteTitle ? narrativeHeadline(event.text) : event.title;
}
