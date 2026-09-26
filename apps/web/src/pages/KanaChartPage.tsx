import {
  kanaCharacterCharts,
  type KanaChartSection,
  type KanaChartScript,
  type KanaChartTile,
} from "@opennihongo/core";
import { Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opennihongo/ui";
import { playJapanesePronunciation } from "../lib/pronunciation";
import "./KanaChartPage.css";

function KanaTile({ tile }: { tile: KanaChartTile }) {
  return (
    <button
      aria-label={`Play pronunciation for ${tile.glyph}, ${tile.romanization}`}
      className="kana-chart__tile"
      onClick={() => {
        playJapanesePronunciation(tile.speechText);
      }}
      type="button"
    >
      <span className="kana-chart__glyph" lang="ja">
        {tile.glyph}
      </span>
      <span className="kana-chart__romanization">{tile.romanization}</span>
      <span aria-hidden="true" className="kana-chart__progress" />
    </button>
  );
}

function ChartSection({ section }: { section: KanaChartSection }) {
  const titleId = `kana-chart-${section.id}-title`;

  return (
    <section aria-labelledby={titleId} className="kana-chart__section">
      <header className="kana-chart__section-header">
        <h3 className="kana-chart__section-title" id={titleId}>
          {section.title}
        </h3>
        <p className="kana-chart__section-description">{section.description}</p>
      </header>
      <div className="kana-chart__rows">
        {section.rows.map((row, rowIndex) => (
          <div
            className="kana-chart__row"
            key={`${section.id}-row-${String(rowIndex)}`}
            style={{
              gridTemplateColumns: `repeat(${String(row.length)}, minmax(0, 4.5rem))`,
            }}
          >
            {row.map((tile, columnIndex) =>
              tile ? (
                <KanaTile key={tile.id} tile={tile} />
              ) : (
                <span
                  aria-hidden="true"
                  className="kana-chart__empty"
                  key={`${section.id}-empty-${String(rowIndex)}-${String(columnIndex)}`}
                />
              ),
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function KanaChartPanel({ script }: { script: KanaChartScript }) {
  const chart = kanaCharacterCharts[script];

  return (
    <TabsContent className="kana-chart__panel" value={script}>
      <header className="kana-chart__intro">
        <h2 className="kana-chart__title">{chart.heading}</h2>
        <p className="kana-chart__description">{chart.description}</p>
        <Link
          className="ns-button kana-chart__learn-button"
          data-variant="primary"
          to="/kana/lesson"
        >
          Learn characters
        </Link>
      </header>
      {chart.sections.map((section) => (
        <ChartSection key={section.id} section={section} />
      ))}
    </TabsContent>
  );
}

export function KanaChartPage() {
  return (
    <section aria-labelledby="kana-chart-page-title" className="kana-chart">
      <h1 className="kana-chart__page-title" id="kana-chart-page-title">
        Kana characters
      </h1>
      <Tabs className="kana-chart__tabs" defaultValue="hiragana">
        <TabsList aria-label="Kana scripts" className="kana-chart__tab-list">
          <TabsTrigger value="hiragana">Hiragana</TabsTrigger>
          <TabsTrigger value="katakana">Katakana</TabsTrigger>
        </TabsList>
        <KanaChartPanel script="hiragana" />
        <KanaChartPanel script="katakana" />
      </Tabs>
    </section>
  );
}
