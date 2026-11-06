import type { GameSessionState } from "../data/types";
import { lifeTimelinePoints } from "../engine/lifeTimeline";
import { useI18n } from "../i18n";

/**
 * A thin line from her birth year to the year of the conversation with one dot per five-year period
 * (docs/decisions.md, D-032). It moves when the player asks about the next period; extra questions inside
 * a period do not advance it. No percentage is shown.
 */
export function LifeProgress({ state }: { state: GameSessionState }) {
  const { locale } = useI18n();
  const points = lifeTimelinePoints(state.selection);
  const last = points.length - 1;
  // The current dot is the period she is talking about now, i.e. of the latest answer, not the next question.
  const answered = state.dialogue.answeredStep
    ?? (state.dialogue.transcript.some((line) => line.speaker === "player") ? state.dialogue.step - 1 : state.dialogue.step);
  const index = Math.min(Math.max(answered, 0), last);
  const current = points[index]!;
  const position = (at: number) => (last > 0 ? (at / last) * 100 : 100);
  const valueText = locale === "en"
    ? `Period ${index + 1} of ${points.length}: ${current.year}`
    : `Период ${index + 1} из ${points.length}: ${current.year} год`;

  return (
    <div
      className="life-progress"
      role="progressbar"
      aria-label={locale === "en" ? "Her life in the conversation" : "Её жизнь в разговоре"}
      aria-valuemin={1}
      aria-valuemax={points.length}
      aria-valuenow={index + 1}
      aria-valuetext={valueText}
    >
      <span className="life-progress-year" aria-hidden="true">{points[0]!.year}</span>
      <div className="life-progress-track" aria-hidden="true">
        <div className="life-progress-fill" style={{ width: `${position(index)}%` }} />
        <ol className="life-progress-dots">
          {points.map((point, at) => (
            <li
              key={point.year}
              className={at < index ? "done" : at === index ? "current" : undefined}
              style={{ left: `${position(at)}%` }}
              title={String(point.year)}
            />
          ))}
        </ol>
      </div>
      <span className="life-progress-year" aria-hidden="true">{points[last]!.year}</span>
    </div>
  );
}
