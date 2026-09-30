import { kanaCharacterCharts } from "@opennihongo/content";
import { Card, SegmentedControl } from "@opennihongo/ui";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { getKanaPracticeItemCount } from "../../views/practice/session/kanaPracticeContent";
import "./PracticePage.css";

export function PracticePage() {
  const search = useSearch({ from: "/practice" });
  const navigate = useNavigate({ from: "/practice" });
  const chart = kanaCharacterCharts[search.script];
  const scriptLabel = search.script === "hiragana" ? "Hiragana" : "Katakana";

  return (
    <section aria-labelledby="practice-hub-title" className="practice-hub">
      <header className="practice-hub__header">
        <p className="practice-hub__eyebrow">A little practice, every day</p>
        <h1 id="practice-hub-title">Practice</h1>
        <p>Choose a game and build confidence, one short session at a time.</p>
      </header>

      <section
        aria-labelledby="practice-kana-title"
        className="practice-hub__section"
      >
        <header className="practice-hub__section-header">
          <h2 id="practice-kana-title">Kana</h2>
          <p>Get familiar with characters, sounds, and reading patterns.</p>
        </header>
        <div className="practice-hub__selectors">
          <SegmentedControl
            aria-label="Practice Kana script"
            options={[
              { value: "hiragana", label: "Hiragana" },
              { value: "katakana", label: "Katakana" },
            ]}
            value={search.script}
            onValueChange={(script) => {
              void navigate({ search: { ...search, script }, replace: true });
            }}
          />
          <label className="practice-hub__category">
            <span>Kana category</span>
            <select
              value={search.category}
              onChange={(event) => {
                void navigate({
                  search: { ...search, category: event.target.value },
                  replace: true,
                });
              }}
            >
              {chart.sections.map(({ id, title }) => (
                <option key={id} value={id}>
                  {title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="practice-hub__games">
          {(["reading", "matching"] as const).map((mode) => (
            <Card as="article" className="practice-hub__game" key={mode}>
              <span
                aria-hidden="true"
                className={`practice-hub__art practice-hub__art--${mode}`}
              >
                {mode === "reading" ? (
                  <span lang="ja">
                    {search.script === "hiragana" ? "あ" : "ア"}
                  </span>
                ) : (
                  <span>{search.script === "hiragana" ? "あ" : "ア"} ↔ a</span>
                )}
              </span>
              <p className="practice-hub__eyebrow">
                {scriptLabel} ·{" "}
                {getKanaPracticeItemCount(mode, search.script, search.category)}{" "}
                {mode === "reading" ? "answers" : "pairs"}
              </p>
              <h3>{mode === "reading" ? "Kana reading" : "Kana matching"}</h3>
              <p>
                {mode === "reading"
                  ? "See a character or pattern and type its romaji reading."
                  : "Find each character or pattern’s matching romaji reading."}
              </p>
              <Link
                className="ns-button practice-hub__play"
                data-variant="primary"
                search={search}
                to={
                  mode === "reading"
                    ? "/practice/kana/reading"
                    : "/practice/kana/matching"
                }
              >
                {mode === "reading"
                  ? "Play Kana reading"
                  : "Play Kana matching"}
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="practice-words-title"
        className="practice-hub__section"
      >
        <header className="practice-hub__section-header">
          <h2 id="practice-words-title">Words</h2>
          <p>Make beginner vocabulary feel familiar.</p>
        </header>
        <div className="practice-hub__games">
          <Card as="article" className="practice-hub__game">
            <span
              aria-hidden="true"
              className="practice-hub__art practice-hub__art--words"
            >
              <span lang="ja">ねこ</span>
              <span>cat</span>
            </span>
            <p className="practice-hub__eyebrow">
              Beginner vocabulary · 10 matches
            </p>
            <h3>Word matching</h3>
            <p>
              Match five Japanese words to their meanings, then try a rolling
              review.
            </p>
            <Link
              className="ns-button practice-hub__play"
              data-variant="primary"
              to="/practice/words/matching"
            >
              Play word matching
            </Link>
          </Card>
        </div>
      </section>
    </section>
  );
}
