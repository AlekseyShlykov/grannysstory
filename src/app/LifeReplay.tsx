import { useEffect, useMemo, useRef, useState } from "react";
import type { GameSessionState } from "../data/types";
import { knownAtlasEvents } from "../engine/atlas";
import { branchDefinition } from "../engine/biography";

interface ReplayStep {
  id: string;
  year: number;
  phrase: string;
  alternative?: string;
}

export function LifeReplay({ state }: { state: GameSessionState }) {
  const concise = (text: string) => {
    const first = text.split(/(?<=[.!?])\s+/)[0] ?? text;
    const withoutStop = first.replace(/[.!?]+$/, "");
    return withoutStop.length > 170 ? `${withoutStop.slice(0, 167).trimEnd()}…` : withoutStop;
  };
  const decisions = useMemo(() => new Map<string, string>(state.biography.branches
    .filter((branch) => branch.resolved && branch.outcome)
    .map((branch) => {
      const definition = branchDefinition(branch.type);
      const selectedA = branch.outcome!.id === "pathA";
      return [`life:${branch.type}:decision`, selectedA ? definition.titleB : definition.titleA] as const;
    })), [state.biography.branches]);
  const steps = useMemo<ReplayStep[]>(() => [
    ...knownAtlasEvents(state)
      .filter((event) => event.provenance !== "VERIFIED_HISTORICAL" || event.peopleIds.includes("grandmother"))
      .sort((a, b) => Number(b.id === "life:birth") - Number(a.id === "life:birth") || a.year - b.year)
      .map((event) => ({
        id: event.id,
        year: event.year,
        phrase: `${event.year} — ${event.title}: ${concise(event.text)}.`,
        ...(decisions.has(event.id) ? { alternative: decisions.get(event.id)! } : {})
      })),
    {
      id: "conversation",
      year: state.selection.conversationYear,
      phrase: `${state.selection.conversationYear} — вы дослушали её историю до сегодняшнего разговора.`
    }
  ], [decisions, state]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(0);
    setPlaying(false);
  }, [state.selection.runSeed]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => {
      setCurrentIndex((current) => {
        if (current >= steps.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 1900 / speed);
    return () => window.clearTimeout(timer);
  }, [currentIndex, playing, speed, steps.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof track.scrollTo !== "function") return;
    track.scrollTo({ top: Math.max(0, 24 + currentIndex * 46 - track.clientHeight / 2), behavior: "smooth" });
  }, [currentIndex]);

  if (!steps.length) return null;
  const current = steps[currentIndex]!;
  const height = Math.max(260, steps.length * 46);
  const yAt = (index: number) => 24 + index * 46;
  const play = () => {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (currentIndex >= steps.length - 1) setCurrentIndex(0);
    setPlaying(true);
  };

  return (
    <section className="life-replay" aria-labelledby="life-replay-title">
      <div className="life-replay-heading">
        <h2 id="life-replay-title">Посмотреть жизнь снова</h2>
        <div className="life-replay-controls">
          <button className="primary life-replay-play" type="button" onClick={play} aria-pressed={playing}>
            <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
            {playing ? "Пауза" : "Play"}
          </button>
          <label className="life-replay-speed">
            <span>Скорость</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.5"
              value={speed}
              aria-label="Скорость воспроизведения"
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
            <span className="life-replay-speed-value" aria-hidden="true">{speed}×</span>
          </label>
        </div>
      </div>
      <div className="life-replay-body">
        <div className="life-replay-track" aria-hidden="true" ref={trackRef}>
          <svg viewBox={`0 0 120 ${height}`} style={{ height }}>
            {steps.slice(0, currentIndex + 1).map((step, index) => index === 0 ? null : (
              <line key={`line:${step.id}`} x1="45" y1={yAt(index - 1)} x2="45" y2={yAt(index)} />
            ))}
            {steps.slice(0, currentIndex + 1).map((step, index) => step.alternative && (
              <g className="life-replay-fork" key={`fork:${step.id}`}>
                <path d={`M 45 ${yAt(index)} C 62 ${yAt(index)}, 72 ${yAt(index) + 17}, 94 ${yAt(index) + 17}`} />
                <circle cx="94" cy={yAt(index) + 17} r="4.5"><title>Другой вариант: {step.alternative}</title></circle>
              </g>
            ))}
            {steps.slice(0, currentIndex + 1).map((step, index) => (
              <circle key={step.id} cx="45" cy={yAt(index)} r={index === currentIndex ? 7 : 4.5} className={index === currentIndex ? "current" : "passed"} />
            ))}
          </svg>
        </div>
        <div className="life-replay-copy" aria-live="polite" aria-atomic="true">
          <p className="life-replay-sentence">{current.phrase}</p>
          <p className="life-replay-progress">{currentIndex + 1} из {steps.length}</p>
        </div>
      </div>
    </section>
  );
}
