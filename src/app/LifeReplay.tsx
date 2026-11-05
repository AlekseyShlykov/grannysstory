import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { placeLocative } from "../../content/scenes/regions";
import type { GameSessionState } from "../data/types";
import { placeLocativeAt, placeNameAt } from "../data/world";
import { knownAtlasEvents } from "../engine/atlas";
import { branchDefinition } from "../engine/biography";
import { concreteEventTitle } from "../engine/eventTitles";

interface ReplayStep {
  id: string;
  year: number;
  age: number;
  title: string;
  alternative?: string;
  selectedSide?: "left" | "right";
}

interface ReplayDecision {
  alternative: string;
  moved: boolean;
  selectedSide: "left" | "right";
  type: GameSessionState["biography"]["branches"][number]["type"];
}

interface ReplayPosition {
  x: number;
  alternativeX?: number;
}

const REPLAY_POINT_MS = 420;
const REPLAY_LINE_MS = 2100;
const TRACK_CENTER = 60;
const TRACK_BRANCH_OFFSET = 30;

function layoutSteps(steps: ReplayStep[]): ReplayPosition[] {
  let lane = TRACK_CENTER;
  return steps.map((step) => {
    if (!step.selectedSide) return { x: lane };
    const origin = lane;
    lane += step.selectedSide === "left" ? -TRACK_BRANCH_OFFSET : TRACK_BRANCH_OFFSET;
    return {
      x: lane,
      alternativeX: origin + (step.selectedSide === "left" ? TRACK_BRANCH_OFFSET : -TRACK_BRANCH_OFFSET)
    };
  });
}

function edgePath(fromX: number, fromY: number, toX: number, toY: number): string {
  const middle = (fromY + toY) / 2;
  return `M ${fromX} ${fromY} C ${fromX} ${middle}, ${toX} ${middle}, ${toX} ${toY}`;
}

function movementTitle(type: ReplayDecision["type"], placeId: string, year: number): string {
  const place = placeLocativeAt(placeId, year) ?? placeLocative(placeNameAt(placeId, year));
  if (type === "education") return `Уехала учиться ${place}`;
  if (type === "love") return `Уехала с любимым человеком ${place}`;
  return `Начала жить ${place}`;
}

function ageLabel(age: number): string {
  const mod100 = Math.abs(age) % 100;
  const mod10 = mod100 % 10;
  if (mod100 >= 11 && mod100 <= 14) return `${age} лет`;
  if (mod10 === 1) return `${age} год`;
  if (mod10 >= 2 && mod10 <= 4) return `${age} года`;
  return `${age} лет`;
}

export function LifeReplay({ state }: { state: GameSessionState }) {
  const decisions = useMemo(() => new Map<string, ReplayDecision>(state.biography.branches
    .filter((branch) => branch.resolved && branch.outcome)
    .map((branch) => {
      const definition = branchDefinition(branch.type);
      const selectedA = branch.outcome!.id === "pathA";
      const selectedMoves = selectedA ? definition.movesOnA : definition.movesOnB;
      const moved = Boolean(selectedMoves && state.biography.residenceHistory.some((residence) => residence.fromYear === branch.year));
      return [`life:${branch.type}:decision`, {
        alternative: selectedA ? definition.titleB : definition.titleA,
        moved,
        selectedSide: selectedA ? "left" : "right",
        type: branch.type
      }] as const;
    })), [state.biography.branches, state.biography.residenceHistory]);
  const steps = useMemo<ReplayStep[]>(() => [
    ...knownAtlasEvents(state)
      .filter((event) => event.provenance !== "VERIFIED_HISTORICAL" || event.peopleIds.includes("grandmother"))
      .sort((a, b) => Number(b.id === "life:birth") - Number(a.id === "life:birth") || a.year - b.year)
      .map((event) => {
        const decision = decisions.get(event.id);
        const title = decision?.moved
          ? movementTitle(decision.type, event.placeId, event.year)
          : concreteEventTitle(event);
        return {
          id: event.id,
          year: event.year,
          age: event.age,
          title: title.trim().replace(/[.!?…]+$/u, ""),
          ...(decision ? { alternative: decision.alternative, selectedSide: decision.selectedSide } : {})
        };
      }),
    {
      id: "conversation",
      year: state.selection.conversationYear,
      age: state.selection.conversationYear - state.selection.birthYear,
      title: "Разговор завершился"
    }
  ], [decisions, state]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const positions = useMemo(() => layoutSteps(steps), [steps]);

  useEffect(() => {
    setCurrentIndex(0);
    setPlaying(false);
  }, [state.selection.runSeed]);

  useEffect(() => {
    if (!playing) return;
    if (currentIndex >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setCurrentIndex((current) => Math.min(current + 1, steps.length - 1));
    }, (REPLAY_POINT_MS + REPLAY_LINE_MS) / speed);
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
  const nextIndex = currentIndex + 1;
  const next = steps[nextIndex];
  const currentPosition = positions[currentIndex]!;
  const nextPosition = positions[nextIndex];
  const pointDuration = REPLAY_POINT_MS / speed;
  const lineDuration = REPLAY_LINE_MS / speed;
  const cameraOffset = TRACK_CENTER - currentPosition.x;
  const animationStyle = {
    height,
    "--replay-draw-duration": `${lineDuration}ms`,
    "--replay-draw-delay": `${pointDuration}ms`,
    "--replay-arrive-duration": `${pointDuration}ms`,
    "--replay-camera-duration": `${pointDuration}ms`
  } as CSSProperties;
  const cameraStyle = {
    transform: `translateX(${cameraOffset}px)`
  } as CSSProperties;
  const speedLabel = speed.toFixed(1).replace(/\.0$/u, "");
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
              step="0.1"
              value={speed}
              aria-label="Скорость воспроизведения"
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
            <span className="life-replay-speed-value" aria-hidden="true">{speedLabel}×</span>
          </label>
        </div>
      </div>
      <div className="life-replay-body">
        <div className="life-replay-track" aria-hidden="true" ref={trackRef}>
          <svg viewBox={`0 0 120 ${height}`} style={animationStyle}>
            <g className="life-replay-camera" style={cameraStyle}>
              <g className="life-replay-edges">
                {steps.slice(1, currentIndex + 1).map((step, offset) => {
                  const index = offset + 1;
                  const from = positions[index - 1]!;
                  const to = positions[index]!;
                  return (
                    <g key={`edge:${step.id}`}>
                      <path className="life-replay-edge passed" d={edgePath(from.x, yAt(index - 1), to.x, yAt(index))} />
                      {step.alternative && to.alternativeX !== undefined && (
                        <g className="life-replay-fork">
                          <path className="life-replay-edge alternative" d={edgePath(from.x, yAt(index - 1), to.alternativeX, yAt(index))} />
                          <circle className="life-replay-alternative-dot" cx={to.alternativeX} cy={yAt(index)} r="5">
                            <title>Другой вариант: {step.alternative}</title>
                          </circle>
                        </g>
                      )}
                    </g>
                  );
                })}

                {next?.alternative && nextPosition?.alternativeX !== undefined && (
                  <g className="life-replay-fork preview">
                    <path className="life-replay-edge alternative" d={edgePath(currentPosition.x, yAt(currentIndex), nextPosition.alternativeX, yAt(nextIndex))} />
                    <circle className="life-replay-alternative-dot" cx={nextPosition.alternativeX} cy={yAt(nextIndex)} r="5">
                      <title>Другой вариант: {next.alternative}</title>
                    </circle>
                  </g>
                )}

                {next?.alternative && nextPosition && !playing && (
                  <path className="life-replay-edge alternative" d={edgePath(currentPosition.x, yAt(currentIndex), nextPosition.x, yAt(nextIndex))} />
                )}

                {next && nextPosition && playing && (
                  <path
                    key={`advancing:${current.id}:${next.id}:${speed}`}
                    pathLength="1"
                    className="life-replay-edge advancing"
                    d={edgePath(currentPosition.x, yAt(currentIndex), nextPosition.x, yAt(nextIndex))}
                  />
                )}
              </g>

              <g className="life-replay-nodes">
                {steps.slice(0, currentIndex).map((step, index) => (
                  <circle key={step.id} cx={positions[index]!.x} cy={yAt(index)} r="4.5" className="passed" />
                ))}
                <circle
                  key={`current:${current.id}`}
                  cx={currentPosition.x}
                  cy={yAt(currentIndex)}
                  r="7"
                  className="current arrived"
                />
                {next && nextPosition && (
                  <circle cx={nextPosition.x} cy={yAt(nextIndex)} r="6" className="life-replay-target" />
                )}
              </g>
            </g>
          </svg>
        </div>
        <div className="life-replay-copy" aria-live="polite" aria-atomic="true">
          <p className="life-replay-date">{current.year}, {ageLabel(current.age)}</p>
          <p className="life-replay-sentence">{current.title}</p>
          <p className="life-replay-progress">{currentIndex + 1} из {steps.length}</p>
        </div>
      </div>
    </section>
  );
}
