import type { GameSessionState } from "../data/types";
import { lifeTimelinePoints } from "../engine/lifeTimeline";
import type { Locale } from "../i18n";

/**
 * Anonymous playthrough progress for the owner's Google Sheet (docs/decisions.md, D-031): one row when a run
 * reaches each five-year stage and one when the final screen opens, so the sheet shows where players stop.
 * Only the stage, language and start selection are sent; never the conversation or the generated life.
 */
export interface ProgressRecord {
  event: "stage" | "finished";
  /** The run seed: random, identifies one playthrough. */
  sessionId: string;
  /** Random id kept in this browser, so repeated playthroughs of one visitor can be grouped. */
  playerId: string;
  /** 1-based stage reached; equals stagesTotal on the final screen. */
  stage: number;
  stagesTotal: number;
  inGameYear: number;
  age: number;
  finished: boolean;
  /** UI language at the moment of the event; new locales are reported as they are added. */
  language: Locale;
  birthRegionId: string;
  birthYear: number;
  datasetVersion: string;
  clientTime: string;
}

// Google Apps Script web app URL from scripts/analytics/progress-sheet.gs; empty disables reporting.
const PROGRESS_SHEET_URL = "";
const configuredEndpoint = (import.meta.env.VITE_PROGRESS_SHEET_URL ?? PROGRESS_SHEET_URL).trim();
const SENT_KEY = "babushka-progress-sent-v1";
const PLAYER_KEY = "babushka-progress-player-v1";
const MAX_REMEMBERED_RUNS = 50;

export function progressRecord(state: GameSessionState, language: Locale, playerId: string, now = new Date()): ProgressRecord {
  const points = lifeTimelinePoints(state.selection);
  const finished = state.screen === "atlas";
  const index = finished ? points.length - 1 : Math.min(Math.max(state.dialogue.step, 0), points.length - 1);
  const point = points[index]!;
  return {
    event: finished ? "finished" : "stage",
    sessionId: state.selection.runSeed,
    playerId,
    stage: index + 1,
    stagesTotal: points.length,
    inGameYear: point.year,
    age: point.age,
    finished,
    language,
    birthRegionId: state.selection.birthRegionId,
    birthYear: state.selection.birthYear,
    datasetVersion: state.selection.datasetVersion,
    clientTime: now.toISOString()
  };
}

/** Rank of a record within its run: later stages rank higher, the final screen highest. */
function progressRank(record: ProgressRecord): number {
  return record.finished ? record.stagesTotal + 1 : record.stage;
}

function readSent(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(SENT_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, number> : {};
  } catch {
    return {};
  }
}

function writeSent(sent: Record<string, number>): void {
  try {
    const recent = Object.entries(sent).slice(-MAX_REMEMBERED_RUNS);
    localStorage.setItem(SENT_KEY, JSON.stringify(Object.fromEntries(recent)));
  } catch {
    // Without storage a resumed run may report a stage twice; the sheet tolerates duplicates.
  }
}

function playerId(): string {
  try {
    const stored = localStorage.getItem(PLAYER_KEY);
    if (stored) return stored;
    const id = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(PLAYER_KEY, id);
    return id;
  } catch {
    return "ephemeral";
  }
}

/**
 * Sends the current stage once per run (a resumed save does not resend stages already reported). Best effort:
 * the Apps Script endpoint is posted with `no-cors`, so delivery cannot be confirmed and failures stay silent.
 */
export function reportProgress(state: GameSessionState, language: Locale, endpoint = configuredEndpoint): ProgressRecord | null {
  if (!endpoint || (typeof navigator !== "undefined" && navigator.onLine === false)) return null;
  const record = progressRecord(state, language, playerId());
  const sent = readSent();
  const previous = sent[record.sessionId] ?? 0;
  const rank = progressRank(record);
  if (rank <= previous) return null;
  delete sent[record.sessionId];
  sent[record.sessionId] = rank;
  writeSent(sent);
  try {
    void fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(record)
    }).catch(() => {
      // Offline: allow the same stage to be reported again on the next change of this run.
      const current = readSent();
      if (current[record.sessionId] === rank) {
        current[record.sessionId] = previous;
        writeSent(current);
      }
    });
  } catch {
    return null;
  }
  return record;
}
