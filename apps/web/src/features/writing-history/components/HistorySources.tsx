import {
  writingHistorySources,
  type HistoryReference,
} from "@opennihongo/content";

export function HistorySources({
  references,
}: {
  references: readonly HistoryReference[];
}) {
  return (
    <details className="history-sources">
      <summary>Sources and notes</summary>
      <ul>
        {references.map(({ sourceId, locator }) => {
          const source = writingHistorySources.find(
            ({ id }) => id === sourceId,
          );
          if (!source)
            throw new Error(`Unknown historical source: ${sourceId}`);
          return (
            <li key={`${sourceId}-${locator}`}>
              <a href={source.url}>{source.title}</a>
              <p>
                {source.institution} · {locator}
              </p>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
