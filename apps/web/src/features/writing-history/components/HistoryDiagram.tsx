import { useId } from "react";
import type { HistoryUnit } from "@opennihongo/content";
import { historyDiagramLabel, layoutHistoryDiagram } from "./diagramLayout";

export function HistoryDiagram({
  unit,
}: {
  unit: Extract<HistoryUnit, { kind: "diagram" }>;
}) {
  const markerId = useId();
  const layout = layoutHistoryDiagram(unit);
  function label(id: string) {
    const node = unit.nodes.find((entry) => entry.id === id);
    if (!node) throw new Error(`Unknown historical diagram node: ${id}`);
    return node.label;
  }
  return (
    <div className="history-diagram">
      <svg
        className="history-flow"
        viewBox={`0 0 ${String(layout.width)} ${String(layout.height)}`}
        role="img"
        aria-label={unit.title}
      >
        <title>{unit.title}</title>
        <desc>
          {unit.edges
            .map(
              (edge) =>
                `${label(edge.from)}: ${edge.label} → ${label(edge.to)}`,
            )
            .join(". ")}
        </desc>
        <defs>
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6" />
          </marker>
        </defs>
        {layout.edges.map(({ from, to, start, end, routeX }) => (
          <path
            key={`${from}-${to}`}
            className="history-flow-edge"
            markerEnd={`url(#${markerId})`}
            d={
              routeX === null
                ? `M${String(start.x)},${String(start.y)} C${String(start.x)},${String((start.y + end.y) / 2)} ${String(end.x)},${String((start.y + end.y) / 2)} ${String(end.x)},${String(end.y)}`
                : `M${String(start.x)},${String(start.y)} H${String(routeX)} V${String(end.y)} H${String(end.x)}`
            }
          />
        ))}
        {layout.nodes.map((node) => {
          const lines = historyDiagramLabel(node.label);
          return (
            <g key={node.id}>
              <rect
                x={node.x - 130}
                y={node.y - 44}
                width="260"
                height="88"
                rx="14"
              />
              <text x={node.x} y={node.y - (lines.length - 1) * 14}>
                {lines.map((line, index) => (
                  <tspan x={node.x} dy={index === 0 ? 0 : 28} key={line}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>
      <details className="history-diagram-details">
        <summary>Explore the diagram connections</summary>
        <div className="history-diagram-nodes">
          {unit.nodes.map((node, index) => (
            <div className="history-diagram-node" key={node.id}>
              <span aria-hidden="true" className="history-node-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{node.label}</h3>
              <p>{node.detail}</p>
            </div>
          ))}
        </div>
        <ul aria-label="Historical connections" className="history-connections">
          {unit.edges.map((edge) => (
            <li key={`${edge.from}-${edge.to}`}>
              <span>{label(edge.from)}</span>
              <span className="history-connection-label">
                <span aria-hidden="true">→ </span>
                {edge.label}
              </span>
              <strong>{label(edge.to)}</strong>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
