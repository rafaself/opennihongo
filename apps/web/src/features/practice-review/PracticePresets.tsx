import { beginnerKanji } from "@opennihongo/content";
import { Card } from "@opennihongo/ui";
import { Link } from "@tanstack/react-router";
import "./readingReview.css";
export function PracticePresets() {
  return (
    <section
      aria-labelledby="practice-guided-title"
      className="practice-hub__section"
    >
      <header className="practice-hub__section-header">
        <h2 id="practice-guided-title">A good place to start</h2>
        <p>
          Five readings, hints when you need them, and time to understand each
          answer.
        </p>
      </header>
      <div className="practice-hub__presets">
        <Card as="article">
          <h3>Hiragana vowels</h3>
          <p lang="ja">あ · い · う · え · お</p>
          <p>
            Type the sounds in romaji. Pronunciation and hints are available.
          </p>
          <Link
            className="ns-button"
            to="/practice/kana/reading"
            search={{
              scripts: ["hiragana"],
              categories: ["basic"],
              characterIds: ["あ", "い", "う", "え", "お"].map(
                (glyph) => `hiragana.basic.${glyph}`,
              ),
              difficulty: "easy",
              length: 5,
              fast: false,
            }}
          >
            Start vowel reading
          </Link>
        </Card>
        <Card as="article">
          <h3>First Kanji words</h3>
          <p lang="ja">一 · 二 · 三 · 四 · 五</p>
          <p>
            Read five number words in Kana or romaji, with their English
            meanings.
          </p>
          <Link
            className="ns-button"
            to="/practice/kanji/reading"
            search={{
              kanji: {
                themes: ["numbers"],
                ids: beginnerKanji
                  .filter(({ theme }) => theme === "numbers")
                  .slice(0, 5)
                  .map(({ id }) => id),
                difficulty: "easy",
                length: 5,
                focus: "readings",
                fast: false,
              },
            }}
          >
            Start Kanji word reading
          </Link>
        </Card>
        <Card as="article">
          <h3>Return to your readings</h3>
          <p>
            Pick mistakes, skipped items, and readings completed with help from
            saved practice.
          </p>
          <Link
            className="ns-button"
            data-variant="secondary"
            to="/practice/review"
          >
            Review saved readings
          </Link>
        </Card>
      </div>
    </section>
  );
}
