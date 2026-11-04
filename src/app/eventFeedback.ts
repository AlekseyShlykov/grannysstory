export type EventVote = 1 | -1;

export interface EventFeedbackRecord {
  eventId: string;
  vote: EventVote;
  voterId: string;
  datasetVersion: string;
}

const VOTES_KEY = "babushka-event-votes-v1";
const QUEUE_KEY = "babushka-event-feedback-queue-v1";
const VOTER_KEY = "babushka-feedback-voter-v1";
const endpoint = (import.meta.env.VITE_EVENT_FEEDBACK_URL ?? "https://feedback-api-production-5596.up.railway.app/event-feedback").trim();
let syncing = false;

/** Stable across runs for identical content, but distinct when a generated personal memory uses the same slot id. */
export function eventFeedbackId(id: string, title: string, text: string): string {
  let hash = 0x811c9dc5;
  for (const character of `${title}\u0000${text}`) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return `${id}:${(hash >>> 0).toString(36)}`;
}

function readObject<T>(key: string): Record<string, T> {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, T> : {};
  } catch {
    return {};
  }
}

function writeObject<T>(key: string, value: Record<string, T>): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The current view still reflects the vote when private storage is unavailable.
  }
}

function voterId(): string {
  try {
    const stored = localStorage.getItem(VOTER_KEY);
    if (stored) return stored;
    const id = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(VOTER_KEY, id);
    return id;
  } catch {
    return "ephemeral";
  }
}

export function loadEventVotes(): Record<string, EventVote> {
  const stored = readObject<number>(VOTES_KEY);
  return Object.fromEntries(Object.entries(stored).filter((entry): entry is [string, EventVote] => entry[1] === 1 || entry[1] === -1));
}

/** Saves immediately in the browser; the latest choice for the same event replaces an older queued choice. */
export function recordEventVote(eventId: string, vote: EventVote, datasetVersion: string): EventFeedbackRecord {
  const votes = loadEventVotes();
  votes[eventId] = vote;
  writeObject(VOTES_KEY, votes);
  const record = { eventId, vote, voterId: voterId(), datasetVersion } satisfies EventFeedbackRecord;
  const queue = readObject<EventFeedbackRecord>(QUEUE_KEY);
  queue[eventId] = record;
  writeObject(QUEUE_KEY, queue);
  return record;
}

/** Best-effort anonymous sync. Failed requests remain queued for a later visit or an `online` event. */
export async function syncEventFeedback(): Promise<void> {
  if (!endpoint || syncing || (typeof navigator !== "undefined" && navigator.onLine === false)) return;
  syncing = true;
  try {
    const queue = readObject<EventFeedbackRecord>(QUEUE_KEY);
    for (const [eventId, record] of Object.entries(queue)) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
          keepalive: true
        });
        if (!response.ok) continue;
        const current = readObject<EventFeedbackRecord>(QUEUE_KEY);
        if (current[eventId]?.vote === record.vote) {
          delete current[eventId];
          writeObject(QUEUE_KEY, current);
        }
      } catch {
        // Offline and transient server errors are intentionally silent; the local vote is already safe.
      }
    }
  } finally {
    syncing = false;
  }
}
