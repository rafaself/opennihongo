import { kanjiTheorySources } from "@opennihongo/content";

export function KanjiSources() {
  return (
    <details className="kanji-theory__sources">
      <summary>Learning sources</summary>
      <ul>
        {kanjiTheorySources.map((source) => (
          <li key={source.url}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.title}
            </a>
            <p>
              {source.institution} · {source.note}
            </p>
          </li>
        ))}
      </ul>
    </details>
  );
}
