import { beginnerKanji, kanjiThemes } from "@opennihongo/content";
import { Button, Checkbox } from "@opennihongo/ui";
import {
  getKanjiItems,
  toggleKanji,
  updateKanjiThemes,
  type KanjiPracticeSearch,
} from "../session/options";
import type { KanjiSetupChange } from "./KanjiSetupOptions";

export function KanjiSelection({
  search,
  onChange,
}: {
  search: KanjiPracticeSearch;
  onChange: KanjiSetupChange;
}) {
  const selected = new Set(getKanjiItems(search).map(({ id }) => id));
  return (
    <section
      className="practice-setup__panel kanji-selection"
      aria-labelledby="kanji-selection-title"
    >
      <h2 id="kanji-selection-title">Choose your Kanji</h2>
      <p>
        Choose themes, then select the individual characters you want to
        practice.
      </p>
      <fieldset className="practice-setup__fieldset">
        <legend>Themes</legend>
        <div className="practice-setup__chips">
          {kanjiThemes.map((theme) => (
            <label
              key={theme.id}
              className="practice-setup__chip"
              data-checked={search.themes.includes(theme.id)}
            >
              <Checkbox
                aria-label={theme.label}
                checked={search.themes.includes(theme.id)}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  onChange((previous) =>
                    updateKanjiThemes(
                      previous,
                      kanjiThemes
                        .filter(({ id }) =>
                          id === theme.id
                            ? checked
                            : previous.themes.includes(id),
                        )
                        .map(({ id }) => id),
                    ),
                  );
                }}
              />
              {theme.label}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="practice-setup__selection-actions">
        <span>{selected.size} selected</span>
        <div>
          <Button
            variant="secondary"
            onClick={() => {
              onChange((previous) => {
                const next = { ...previous };
                delete next.ids;
                return next;
              });
            }}
          >
            Select all
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onChange((previous) => ({ ...previous, ids: [] }));
            }}
          >
            Clear all
          </Button>
        </div>
      </div>
      {kanjiThemes
        .filter(({ id }) => search.themes.includes(id))
        .map((theme) => {
          const items = beginnerKanji.filter((item) => item.theme === theme.id);
          const count = items.filter(({ id }) => selected.has(id)).length;
          return (
            <details
              open
              key={theme.id}
              className="practice-setup__character-group"
            >
              <summary>{theme.label}</summary>
              <div className="kanji-selection__group">
                <Checkbox
                  aria-label={`Select ${theme.label}`}
                  checked={count === items.length}
                  indeterminate={count > 0 && count < items.length}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    onChange((previous) =>
                      toggleKanji(
                        previous,
                        items.map(({ id }) => id),
                        checked,
                      ),
                    );
                  }}
                />
                <div className="practice-setup__tiles">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="practice-setup__tile"
                      data-checked={selected.has(item.id)}
                    >
                      <Checkbox
                        aria-label={`${item.glyph} (${item.meaning})`}
                        checked={selected.has(item.id)}
                        onChange={(event) => {
                          const checked = event.currentTarget.checked;
                          onChange((previous) =>
                            toggleKanji(previous, [item.id], checked),
                          );
                        }}
                      />
                      <span lang="ja">{item.glyph}</span>
                      <small>{item.meaning}</small>
                    </label>
                  ))}
                </div>
              </div>
            </details>
          );
        })}
    </section>
  );
}
