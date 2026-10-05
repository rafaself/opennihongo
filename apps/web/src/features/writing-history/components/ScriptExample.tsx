import { useState } from "react";
import { SegmentedControl } from "@opennihongo/ui";
import type { HistoryUnit } from "@opennihongo/content";

type Example = Extract<HistoryUnit, { kind: "script-example" }>;
const labels = {
  kanji: "Kanji",
  hiragana: "Hiragana",
  katakana: "Katakana",
  romaji: "Rōmaji",
  mark: "Marks",
};

export function ScriptExample({ unit }: { unit: Example }) {
  const [selected, setSelected] = useState("all");
  const scripts = [...new Set(unit.tokens.map(({ script }) => script))];
  return (
    <div className="history-script-example">
      <SegmentedControl
        aria-label="Highlight a writing system"
        value={selected}
        onValueChange={setSelected}
        options={[
          { value: "all", label: "All scripts" },
          ...scripts.map((script) => ({
            value: script,
            label: labels[script],
          })),
        ]}
      />
      <p aria-label="Japanese example" className="history-sentence" lang="ja">
        {unit.tokens.map((token, index) => (
          <span
            key={index}
            data-script={token.script}
            data-highlighted={selected === "all" || selected === token.script}
          >
            {token.text}
          </span>
        ))}
      </p>
      <p className="history-translation">{unit.translation}</p>
      <ul className="history-script-legend">
        {unit.tokens
          .filter(
            ({ script }) =>
              selected === "all" || script === selected || script === "mark",
          )
          .map((token, index) => (
            <li key={index}>
              <span className="history-token" lang="ja">
                {token.text}
              </span>
              <div>
                <strong>{labels[token.script]}</strong>
                <p>{token.explanation}</p>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
