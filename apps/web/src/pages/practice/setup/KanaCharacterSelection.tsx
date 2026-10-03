import { kanaCharacterCharts } from "@opennihongo/content";
import { Button, Checkbox } from "@opennihongo/ui";
import type { PracticeSearch } from "../../../app/practiceSearch";
import {
  getKanaPracticeTiles,
  toggleKanaCharacters,
  updateKanaSelection,
} from "../../../views/practice/session/kanaPracticeSelection";
import type { KanaSetupChange } from "./KanaSetupOptions";

export function KanaCharacterSelection({
  search,
  onChange,
}: {
  search: PracticeSearch;
  onChange: KanaSetupChange;
}) {
  const selected = new Set(getKanaPracticeTiles(search).map(({ id }) => id));
  const pool = getKanaPracticeTiles({
    scripts: search.scripts,
    categories: search.categories,
  });
  return (
    <section className="kana-setup__panel" aria-labelledby="characters-title">
      <h2 id="characters-title">Choose your characters</h2>
      <p>
        Mix writing systems and groups, or focus on the characters you need.
      </p>
      <fieldset className="kana-setup__fieldset">
        <legend>Writing systems</legend>
        <div className="kana-setup__chips">
          {(["hiragana", "katakana"] as const).map((script) => (
            <label
              key={script}
              className="kana-setup__chip"
              data-checked={search.scripts.includes(script)}
            >
              <Checkbox
                checked={search.scripts.includes(script)}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  onChange((previous) =>
                    updateKanaSelection(previous, {
                      scripts: checked
                        ? [...previous.scripts, script]
                        : previous.scripts.filter((item) => item !== script),
                      categories: previous.categories,
                    }),
                  );
                }}
              />
              {script === "hiragana" ? "Hiragana" : "Katakana"}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="kana-setup__fieldset">
        <legend>Character groups</legend>
        <div className="kana-setup__chips">
          {kanaCharacterCharts.hiragana.sections.map((section) => (
            <label
              key={section.id}
              className="kana-setup__chip"
              data-checked={search.categories.includes(section.id)}
            >
              <Checkbox
                checked={search.categories.includes(section.id)}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  onChange((previous) =>
                    updateKanaSelection(previous, {
                      scripts: previous.scripts,
                      categories: checked
                        ? [...previous.categories, section.id]
                        : previous.categories.filter((id) => id !== section.id),
                    }),
                  );
                }}
              />
              {section.title}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="kana-setup__selection-actions">
        <strong>
          {selected.size} of {pool.length} characters selected
        </strong>
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              onChange((previous) => {
                const next = { ...previous };
                delete next.characterIds;
                return next;
              });
            }}
          >
            Select all
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onChange((previous) => ({ ...previous, characterIds: [] }));
            }}
          >
            Clear all
          </Button>
        </div>
      </div>
      {search.scripts.map((script) =>
        kanaCharacterCharts[script].sections
          .filter(({ id }) => search.categories.includes(id))
          .map((section) => {
            const scriptLabel = script === "hiragana" ? "Hiragana" : "Katakana";
            return (
              <details
                open
                key={`${script}:${section.id}`}
                className="kana-setup__character-group"
              >
                <summary>
                  {scriptLabel} · {section.title}
                </summary>
                <div className="kana-setup__rows">
                  {section.rows.map((row, index) => {
                    const tiles = row.filter((tile) => tile !== null);
                    const ids = tiles.map(({ id }) => id);
                    const count = ids.filter((id) => selected.has(id)).length;
                    return (
                      <div key={ids.join(":")} className="kana-setup__row">
                        <Checkbox
                          aria-label={`Select ${scriptLabel} ${section.title} row ${String(index + 1)}`}
                          checked={count === ids.length}
                          indeterminate={count > 0 && count < ids.length}
                          onChange={(event) => {
                            const checked = event.currentTarget.checked;
                            onChange((previous) =>
                              toggleKanaCharacters(previous, ids, checked),
                            );
                          }}
                        />
                        <div className="kana-setup__tiles">
                          {row.map((tile, column) =>
                            tile === null ? (
                              <span key={`empty:${String(column)}`} />
                            ) : (
                              <label
                                key={tile.id}
                                className="kana-setup__tile"
                                data-checked={selected.has(tile.id)}
                              >
                                <Checkbox
                                  aria-label={`${scriptLabel} ${tile.glyph} (${tile.romanization})`}
                                  checked={selected.has(tile.id)}
                                  onChange={(event) => {
                                    const checked = event.currentTarget.checked;
                                    onChange((previous) =>
                                      toggleKanaCharacters(
                                        previous,
                                        [tile.id],
                                        checked,
                                      ),
                                    );
                                  }}
                                />
                                <span lang="ja">{tile.glyph}</span>
                                <small>{tile.romanization}</small>
                              </label>
                            ),
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </details>
            );
          }),
      )}
    </section>
  );
}
