import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { placeLocative } from "../../content/scenes/regions";
import type { GameSessionState } from "../data/types";
import { placeLocativeAt, placeNameAt } from "../data/world";
import { knownAtlasEvents } from "../engine/atlas";
import { branchDefinition } from "../engine/biography";

interface ReplayStep {
  id: string;
  phrase: string;
  alternative?: string;
  selectedSide?: "left" | "right";
}

interface ReplayDecision {
  alternative: string;
  moved: boolean;
  selectedSide: "left" | "right";
  type: GameSessionState["biography"]["branches"][number]["type"];
}

const REPLAY_STEP_MS = 1900;
const TRACK_CENTER = 60;
const TRACK_LEFT = 30;
const TRACK_RIGHT = 90;

function selectedX(step: ReplayStep): number {
  if (step.selectedSide === "left") return TRACK_LEFT;
  if (step.selectedSide === "right") return TRACK_RIGHT;
  return TRACK_CENTER;
}

function alternativeX(step: ReplayStep): number {
  return step.selectedSide === "right" ? TRACK_LEFT : TRACK_RIGHT;
}

function edgePath(fromX: number, fromY: number, toX: number, toY: number): string {
  const middle = (fromY + toY) / 2;
  return `M ${fromX} ${fromY} C ${fromX} ${middle}, ${toX} ${middle}, ${toX} ${toY}`;
}

function sentence(year: number, title: string): string {
  return `${year}. ${title.trim().replace(/[.!?]+$/u, "")}.`;
}

function movementTitle(type: ReplayDecision["type"], placeId: string, year: number): string {
  const place = placeLocativeAt(placeId, year) ?? placeLocative(placeNameAt(placeId, year));
  if (type === "education") return `Уехала учиться ${place}`;
  if (type === "love") return `Уехала с любимым человеком ${place}`;
  return `Начала жить ${place}`;
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
    })), [state.biography.branches]);
  const steps = useMemo<ReplayStep[]>(() => [
    ...knownAtlasEvents(state)
      .filter((event) => event.provenance !== "VERIFIED_HISTORICAL" || event.peopleIds.includes("grandmother"))
      .sort((a, b) => Number(b.id === "life:birth") - Number(a.id === "life:birth") || a.year - b.year)
      .map((event) => {
        const decision = decisions.get(event.id);
        const title = decision?.moved
          ? movementTitle(decision.type, event.placeId, event.year)
          : event.title;
        return {
          id: event.id,
          phrase: sentence(event.year, title),
          ...(decision ? { alternative: decision.alternative, selectedSide: decision.selectedSide } : {})
        };
      }),
    {
      id: "conversation",
      phrase: sentence(state.selection.conversationYear, "Разговор завершился")
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
    }, REPLAY_STEP_MS / speed);
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
  const duration = REPLAY_STEP_MS / speed;
  const recenterDelay = current.selectedSide ? duration * .2 : duration * .08;
  const animationStyle = {
    height,
    "--replay-draw-duration": `${duration * .62}ms`,
    "--replay-draw-delay": `${recenterDelay}ms`,
    "--replay-arrive-delay": `${duration * .72}ms`,
    "--replay-arrive-duration": `${duration * .24}ms`,
    "--replay-recenter-duration": `${duration * .18}ms`
  } as CSSProperties;
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
          <svg viewBox={`0 0 120 ${height}`} style={animationStyle}>
            <g className="life-replay-edges">
              {steps.slice(1, currentIndex + 1).map((step, offset) => {
                const index = offset + 1;
                return (
                  <g key={`edge:${step.id}`}>
                    <path
                      className="life-replay-edge passed"
                      d={edgePath(TRACK_CENTER, yAt(index - 1), selectedX(step), yAt(index))}
                    />
                    {step.alternative && (
                      <g className="life-replay-fork">
                        <path
                          className="life-replay-edge alternative"
                          d={edgePath(TRACK_CENTER, yAt(index - 1), alternativeX(step), yAt(index))}
                        />
                        <circle className="life-replay-alternative-dot" cx={alternativeX(step)} cy={yAt(index)} r="5">
                          <title>Другой вариант: {step.alternative}</title>
                        </circle>
                      </g>
                    )}
                    {step.selectedSide && index < currentIndex && (
                      <path className="life-replay-edge passed life-replay-recenter" d={`M ${selectedX(step)} ${yAt(index)} L ${TRACK_CENTER} ${yAt(index)}`} />
                    )}
                  </g>
                );
              })}

              {current.selectedSide && playing && (
                <path
                  pathLength="1"
                  className="life-replay-edge advancing life-replay-recenter"
                  d={`M ${selectedX(current)} ${yAt(currentIndex)} L ${TRACK_CENTER} ${yAt(currentIndex)}`}
                />
              )}

              {next?.alternative && (
                <g className="life-replay-fork preview">
                  <path
                    className="life-replay-edge alternative"
                    d={edgePath(TRACK_CENTER, yAt(currentIndex), alternativeX(next), yAt(nextIndex))}
                  />
                  <circle className="life-replay-alternative-dot" cx={alternativeX(next)} cy={yAt(nextIndex)} r="5">
                    <title>Другой вариант: {next.alternative}</title>
                  </circle>
                </g>
              )}

              {next?.alternative && !playing && (
                <path
                  className="life-replay-edge alternative"
                  d={edgePath(TRACK_CENTER, yAt(currentIndex), selectedX(next), yAt(nextIndex))}
                />
              )}

              {next && playing && (
                <path
                  key={`advancing:${current.id}:${next.id}:${speed}`}
                  pathLength="1"
                  className="life-replay-edge advancing"
                  d={edgePath(TRACK_CENTER, yAt(currentIndex), selectedX(next), yAt(nextIndex))}
                />
              )}
            </g>

            <g className="life-replay-nodes">
              {steps.slice(0, currentIndex).map((step, index) => (
                <circle key={step.id} cx={TRACK_CENTER} cy={yAt(index)} r="4.5" className="passed" />
              ))}
              <circle
                key={`current:${current.id}:${playing ? "playing" : "paused"}`}
                cx={selectedX(current)}
                cy={yAt(currentIndex)}
                r="7"
                className={`current${current.selectedSide && playing ? ` recentering recenter-${current.selectedSide}` : ""}`}
              />
              {next && (
                <circle
                  key={`target:${current.id}:${next.id}:${playing ? speed : "paused"}`}
                  cx={selectedX(next)}
                  cy={yAt(nextIndex)}
                  r="6"
                  className={`life-replay-target${playing ? " arriving" : ""}`}
                />
              )}
            </g>
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
