import { useId } from "react";
import { Surface } from "@opennihongo/ui";
import type { HistoryUnit } from "@opennihongo/content";
import { CharacterComparison } from "./CharacterComparison";
import { HistoryDiagram } from "./HistoryDiagram";
import { HistorySources } from "./HistorySources";
import { ScriptExample } from "./ScriptExample";

function UnitBody({ unit }: { unit: HistoryUnit }) {
  switch (unit.kind) {
    case "explanation":
    case "note":
      return (
        <>
          {unit.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </>
      );
    case "diagram":
      return <HistoryDiagram unit={unit} />;
    case "character-comparison":
      return <CharacterComparison unit={unit} />;
    case "script-example":
      return <ScriptExample unit={unit} />;
    case "timeline":
      return (
        <ol className="history-timeline">
          {unit.entries.map((entry) => (
            <li key={entry.label}>
              <h3>{entry.label}</h3>
              <p>{entry.detail}</p>
            </li>
          ))}
        </ol>
      );
  }
}

export function HistoryUnitView({ unit }: { unit: HistoryUnit }) {
  const titleId = useId();
  if (unit.kind === "note")
    return (
      <details className="history-supplement">
        <summary>{unit.title}</summary>
        <UnitBody unit={unit} />
        <HistorySources references={unit.references} />
      </details>
    );
  return (
    <section
      aria-labelledby={titleId}
      className="history-unit"
      data-kind={unit.kind}
    >
      <Surface className="history-unit-surface" elevation="card">
        <h2 id={titleId}>{unit.title}</h2>
        <UnitBody unit={unit} />
        <HistorySources references={unit.references} />
      </Surface>
    </section>
  );
}
