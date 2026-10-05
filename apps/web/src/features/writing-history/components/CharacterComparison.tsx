import { useState } from "react";
import { SegmentedControl } from "@opennihongo/ui";
import { getHistoricalCharacter, type HistoryUnit } from "@opennihongo/content";

type Comparison = Extract<HistoryUnit, { kind: "character-comparison" }>;

function characterById(id: string) {
  const character = getHistoricalCharacter(id);
  if (!character) throw new Error(`Unknown historical character: ${id}`);
  return character;
}

export function CharacterComparison({ unit }: { unit: Comparison }) {
  const [selectedId, setSelectedId] = useState(unit.characterIds[0] ?? "");
  const [usage, setUsage] = useState<"meaning" | "sound">("meaning");
  const character = characterById(selectedId);
  const origin = character.origins[0];
  const source = origin ? characterById(origin.sourceCharacterId) : character;
  return (
    <div className="history-comparison">
      <p>{unit.introduction}</p>
      {unit.characterIds.length > 1 && (
        <SegmentedControl
          aria-label="Choose an example"
          value={selectedId}
          onValueChange={setSelectedId}
          options={unit.characterIds.map((id) => {
            const entry = characterById(id);
            return {
              value: id,
              label: (
                <>
                  <span lang="ja" className="history-choice-glyph">
                    {entry.glyph}
                  </span>{" "}
                  /{entry.reading}/
                </>
              ),
            };
          })}
        />
      )}
      {unit.mode === "phonetic-use" && (
        <SegmentedControl
          aria-label="Character use"
          value={usage}
          onValueChange={setUsage}
          options={[
            { value: "meaning", label: "Meaning" },
            { value: "sound", label: "Sound" },
          ]}
        />
      )}
      <div
        key={`${selectedId}:${usage}`}
        className="history-comparison-detail"
        role="group"
        aria-label="Character comparison"
      >
        <div className="history-character-pair">
          <div>
            <span className="history-glyph" lang="ja">
              {source.glyph}
            </span>
            <span className="history-caption">
              {unit.mode === "phonetic-use"
                ? "The same character"
                : "Source character (jibo)"}
            </span>
          </div>
          <span aria-hidden="true" className="history-character-arrow">
            →
          </span>
          {unit.mode === "phonetic-use" ? (
            <div className="history-usage-result">
              <strong>
                {usage === "meaning"
                  ? source.semanticHint
                  : `/${source.reading}/`}
              </strong>
              <p>
                {usage === "meaning"
                  ? unit.meaningExplanation
                  : unit.soundExplanation}
              </p>
            </div>
          ) : (
            <div>
              <span
                className={`history-glyph${character.form === "historical-variant" ? " history-hentaigana" : ""}`}
                lang="ja"
              >
                {character.glyph}
              </span>
              <span className="history-caption">
                {character.form === "historical-variant"
                  ? "Historical alternative"
                  : character.script}{" "}
                · /{character.reading}/
              </span>
            </div>
          )}
        </div>
        {unit.mode !== "phonetic-use" && (
          <>
            <p>{character.summary}</p>
            {origin && (
              <div className="history-origin-note">
                <strong>
                  {origin.transformation === "cursive"
                    ? "Cursive development"
                    : "Abbreviation"}
                </strong>
                {origin.componentHint && <p>{origin.componentHint}</p>}
                <p>{origin.caveat}</p>
                {origin.confidence === "uncertain" && (
                  <p>This historical relationship is uncertain.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
