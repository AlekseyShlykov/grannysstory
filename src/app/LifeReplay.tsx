import { useEffect, useMemo, useRef, useState } from "react";
import type { GameSessionState } from "../data/types";
import { knownAtlasEvents } from "../engine/atlas";

interface ReplayStep {
  id: string;
  year: number;
  label: string;
  text: string;
}

export function LifeReplay({ state }: { state: GameSessionState }) {
  const concise = (text: string) => {
    const firstTwo = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
    return firstTwo.length > 240 ? `${firstTwo.slice(0, 237).trimEnd()}…` : firstTwo;
  };
  const steps = useMemo<ReplayStep[]>(() => [
    ...knownAtlasEvents(state)
      .filter((event) => event.provenance !== "VERIFIED_HISTORICAL" || event.peopleIds.includes("grandmother"))
      .sort((a, b) => Number(b.id === "life:birth") - Number(a.id === "life:birth") || a.year - b.year)
      .map((event) => ({
      id: event.id,
      year: event.year,
      label: event.title,
      text: concise(event.text)
      })),
    {
      id: "conversation",
      year: state.selection.conversationYear,
      label: "Этот разговор",
      text: "Вы дослушали её историю до сегодняшнего разговора. Жизнь не стала законченной книгой, но выбранная дорога стала видна целиком."
    }
  ], [state]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
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
    }, 1900);
    return () => window.clearTimeout(timer);
  }, [currentIndex, playing, steps.length]);

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
        <div>
          <p className="kicker">Выбранный путь</p>
          <h2 id="life-replay-title">Посмотреть жизнь снова</h2>
        </div>
        <button className="primary life-replay-play" type="button" onClick={play} aria-pressed={playing}>
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
          {playing ? "Пауза" : "Play"}
        </button>
      </div>
      <div className="life-replay-body">
        <div className="life-replay-track" aria-hidden="true" ref={trackRef}>
          <svg viewBox={`0 0 80 ${height}`} style={{ height }}>
            {steps.slice(0, currentIndex + 1).map((step, index) => index === 0 ? null : (
              <line key={`line:${step.id}`} x1="40" y1={yAt(index - 1)} x2="40" y2={yAt(index)} />
            ))}
            {steps.slice(0, currentIndex + 1).map((step, index) => (
              <circle key={step.id} cx="40" cy={yAt(index)} r={index === currentIndex ? 7 : 4.5} className={index === currentIndex ? "current" : "passed"} />
            ))}
          </svg>
        </div>
        <div className="life-replay-copy" aria-live="polite" aria-atomic="true">
          <p className="life-replay-year">{current.year}</p>
          <h3>{current.label}</h3>
          <p>{current.text}</p>
          <p className="life-replay-progress">{currentIndex + 1} из {steps.length}</p>
        </div>
      </div>
    </section>
  );
}
