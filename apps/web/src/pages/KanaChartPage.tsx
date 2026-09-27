import { useState } from "react";
import {
  kanaCharacterCharts,
  hiraganaSyllabary,
  type KanaChartSection,
  type KanaChartScript,
  type KanaChartTile,
} from "@opennihongo/core";
import { getKanaChartAudioAsset } from "@opennihongo/audio-assets";
import { Link } from "@tanstack/react-router";
import { SegmentedControl } from "@opennihongo/ui";
import {
  playJapaneseAudioAsset,
  playJapanesePronunciation,
} from "../lib/pronunciation";
import "./KanaChartPage.css";

function KanaTile({
  tile,
  script,
}: {
  tile: KanaChartTile;
  script: KanaChartScript;
}) {
  const kanaId =
    script === "hiragana"
      ? hiraganaSyllabary.find((kana) => kana.glyph === tile.glyph)?.id
      : undefined;
  const audioAsset = kanaId ? getKanaChartAudioAsset(kanaId) : undefined;

  return (
    <button
      aria-label={`Play pronunciation for ${tile.glyph}, ${tile.romanization}`}
      className="kana-chart__tile"
      onClick={() => {
        if (audioAsset && playJapaneseAudioAsset(audioAsset)) {
          return;
        }
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

function ChartSection({
  section,
  script,
}: {
  section: KanaChartSection;
  script: KanaChartScript;
}) {
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
                <KanaTile key={tile.id} script={script} tile={tile} />
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
  const titleId = `kana-chart-${script}-title`;

  return (
    <section aria-labelledby={titleId} className="kana-chart__panel">
      <header className="kana-chart__intro">
        <h2 className="kana-chart__title" id={titleId}>
          {chart.heading}
        </h2>
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
        <ChartSection key={section.id} script={script} section={section} />
      ))}
    </section>
  );
}

export function KanaChartPage() {
  const [script, setScript] = useState<KanaChartScript>("hiragana");

  return (
    <section aria-labelledby="kana-chart-page-title" className="kana-chart">
      <h1 className="kana-chart__page-title" id="kana-chart-page-title">
        Kana characters
      </h1>
      <div className="kana-chart__script-selector">
        <SegmentedControl
          aria-label="Kana scripts"
          onValueChange={setScript}
          options={[
            { value: "hiragana", label: "Hiragana" },
            { value: "katakana", label: "Katakana" },
          ]}
          value={script}
        />
      </div>
      <KanaChartPanel script={script} />
    </section>
  );
}
