import { useMemo, useState } from "react";
import type { GameSessionState } from "../data/types";
import { lifePathGraph, type LifePathNode } from "../engine/lifePaths";

function labelLines(label: string): string[] {
  const words = label.split(/\s+/);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || (current.length + word.length + 1 > 22 && lines.length < 2)) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  if (lines.length > 2) {
    lines[1] = `${lines.slice(1).join(" ").slice(0, 19).trimEnd()}…`;
    return lines.slice(0, 2);
  }
  if (lines[1] && lines[1].length > 22) lines[1] = `${lines[1].slice(0, 19).trimEnd()}…`;
  return lines;
}

function edgePath(from: LifePathNode, to: LifePathNode): string {
  const startX = from.x + 76;
  const endX = to.x - 76;
  const control = (startX + endX) / 2;
  return `M ${startX} ${from.y} C ${control} ${from.y}, ${control} ${to.y}, ${endX} ${to.y}`;
}

export function LifePathGraph({ state }: { state: GameSessionState }) {
  const graph = useMemo(() => lifePathGraph(state), [state]);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  if (!graph) return null;
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const activeNode = activeNodeId ? nodes.get(activeNodeId) : null;

  return (
    <section className="life-path" aria-labelledby="life-path-title">
      <header className="life-path-heading">
        <h2 id="life-path-title">Как могла повернуть жизнь</h2>
        <p>В этой истории была поворотная точка: {graph.branchLabel.toLocaleLowerCase("ru")}. Показаны обе возможные дороги, выбранный в разговоре путь выделен.</p>
      </header>
      <div className="life-path-legend" aria-hidden="true">
        <span><i className="legend-selected" />Выбранный путь</span>
        <span><i className="legend-alternative" />Другая возможность</span>
      </div>
      <div className="life-path-viewport">
        <svg viewBox="0 0 1020 300" role="img" aria-label="Схема возможных дорог жизни и выбранного пути">
          <g className="life-path-edges" aria-hidden="true">
            {graph.edges.map((edge) => {
              const from = nodes.get(edge.from)!;
              const to = nodes.get(edge.to)!;
              return <path key={edge.id} className={edge.selected ? "selected" : "alternative"} d={edgePath(from, to)} />;
            })}
          </g>
          <g className="life-path-nodes">
            {graph.nodes.map((node) => {
              const lines = labelLines(node.label);
              return (
                <g
                  key={node.id}
                  className={`life-path-node ${node.selected ? "selected" : "alternative"}`}
                  transform={`translate(${node.x} ${node.y})`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${node.year}. ${node.label}. ${node.summary}`}
                  onMouseEnter={() => setActiveNodeId(node.id)}
                  onMouseLeave={() => setActiveNodeId(null)}
                  onFocus={() => setActiveNodeId(node.id)}
                  onBlur={() => setActiveNodeId(null)}
                  onClick={() => setActiveNodeId(node.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveNodeId(node.id);
                    }
                  }}
                >
                  <title>{node.summary}</title>
                  <rect x="-76" y="-40" width="152" height="80" rx="4" />
                  <text className="life-path-year" y="-17" textAnchor="middle">{node.year}</text>
                  <text className="life-path-label" textAnchor="middle">
                    {lines.map((line, index) => <tspan key={`${index}:${line}`} x="0" y={index === 0 ? 7 : 24}>{line}</tspan>)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <div className={`life-path-tooltip ${activeNode ? "visible" : ""}`} role="status" aria-live="polite">
        {activeNode ? <><strong>{activeNode.year} · {activeNode.label}</strong><span>{activeNode.summary}</span></> : <span>Наведите указатель на узел, нажмите на него или выберите с клавиатуры, чтобы увидеть решение.</span>}
      </div>
    </section>
  );
}
