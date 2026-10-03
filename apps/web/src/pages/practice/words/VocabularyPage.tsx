import { kanaBeginnerWords } from "@opennihongo/content";
import { Link, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { readAppPreferences } from "../../../app/preferences";
import "./VocabularyPage.css";

type WordSortOrder = "study-order" | "japanese";

const japaneseCollator = new Intl.Collator("ja");

export function VocabularyPage() {
  const search = useSearch({ from: "/practice/words/vocabulary" });
  const [sortOrder, setSortOrder] = useState<WordSortOrder>("study-order");
  const showRomaji = readAppPreferences().showRomaji;
  const words = useMemo(
    () =>
      sortOrder === "study-order"
        ? kanaBeginnerWords
        : [...kanaBeginnerWords].sort((left, right) =>
            japaneseCollator.compare(left.hiragana, right.hiragana),
          ),
    [sortOrder],
  );

  return (
    <section aria-labelledby="words-title" className="words-page">
      <header className="words-page__header">
        <Link to="/practice" search={search} className="words-page__back">
          Back to Practice
        </Link>
        <p className="words-page__eyebrow">Beginner vocabulary</p>
        <h1 className="words-page__title" id="words-title">
          Vocabulary
        </h1>
        <p className="words-page__intro">
          Browse kana, romaji, and English meanings for beginner words.
        </p>
      </header>

      <div className="words-page__toolbar">
        <p className="words-page__count">{words.length} words</p>
        <label className="words-page__sort">
          <span>Sort words</span>
          <select
            onChange={(event) => {
              setSortOrder(event.target.value as WordSortOrder);
            }}
            value={sortOrder}
          >
            <option value="study-order">Study order</option>
            <option value="japanese">Japanese alphabetical order</option>
          </select>
        </label>
      </div>

      <ol aria-label="Beginner words" className="words-page__list">
        {words.map(({ englishMeaning, hiragana, id, romanization }) => (
          <li key={id}>
            <article className="words-page__card">
              <div className="words-page__reading">
                <h2 lang="ja">{hiragana}</h2>
                {showRomaji && <p>{romanization}</p>}
              </div>
              <p className="words-page__meaning">
                <span className="words-page__meaning-label">English</span>
                {englishMeaning}
              </p>
            </article>
          </li>
        ))}
      </ol>

      <Link
        className="ns-button words-page__start"
        data-variant="primary"
        to="/practice/words/matching"
      >
        Start word practice
      </Link>
    </section>
  );
}
