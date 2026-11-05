import { useMemo } from "react";
import type { GameSessionState } from "../data/types";
import { lifePathGraph, type LifePathNode } from "../engine/lifePaths";

function edgePath(from: LifePathNode, to: LifePathNode): string {
  const middle = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} C ${from.x} ${middle}, ${to.x} ${middle}, ${to.x} ${to.y}`;
}

export function LifePathGraph({ state }: { state: GameSessionState }) {
  const graph = useMemo(() => lifePathGraph(state), [state]);
  if (!graph) return null;
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));

  return (
    <section className="life-path" aria-labelledby="life-path-title">
      <header className="life-path-heading">
        <h2 id="life-path-title">Как могла повернуть жизнь</h2>
        <p>Все дороги, которые были возможны до первого вопроса: {graph.leafCount} вариантов жизни. Выбранная жизнь показана сплошной линией, остальные — пунктиром.</p>
      </header>
      <div className="life-path-legend" aria-hidden="true">
        <span><i className="legend-selected" />Выбранная жизнь</span>
        <span><i className="legend-alternative" />Другая возможность</span>
      </div>
      <div className="life-path-viewport">
        <svg viewBox={`0 0 ${graph.width} ${graph.height}`} role="img" aria-label="Дерево всех возможных дорог жизни">
          <g className="life-path-edges" aria-hidden="true">
            {graph.edges.map((edge) => {
              const from = nodes.get(edge.from)!;
              const to = nodes.get(edge.to)!;
              return <path key={edge.id} className={edge.selected ? "selected" : "alternative"} d={edgePath(from, to)} />;
            })}
          </g>
          <g className="life-path-nodes">
            {graph.nodes.map((node) => (
              <g
                key={node.id}
                className={`life-path-node ${node.status}`}
                transform={`translate(${node.x} ${node.y})`}
                aria-hidden="true"
              >
                <circle className="life-path-dot" r={node.selected ? 6 : 4.5} />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </section>
  );
}
