import { PracticePresets } from "../../features/practice-review/PracticePresets";
import { kanaPracticeGames, kanjiPracticeGames } from "@opennihongo/content";
import { Card } from "@opennihongo/ui";
import { Link, useSearch } from "@tanstack/react-router";
import { CardStackGameCard } from "../../views/practice/cards/CardStackGameCard";
import { getWordCards } from "../../views/practice/cards/cardStackContent";
import "./PracticePage.css";
import "../../features/kanji/kanji.css";

export function PracticePage() {
  const search = useSearch({ from: "/practice" });
  return (
    <section aria-labelledby="practice-hub-title" className="practice-hub">
      <header className="practice-hub__header">
        <p className="practice-hub__eyebrow">A little practice, every day</p>
        <h1 id="practice-hub-title">Practice</h1>
        <p>
          Choose a game, make it yours, and build confidence one session at a
          time.
        </p>
      </header>
      <PracticePresets />
      <section
        aria-labelledby="practice-kana-title"
        className="practice-hub__section"
      >
        <header className="practice-hub__section-header">
          <h2 id="practice-kana-title">Kana</h2>
          <p>
            Choose your characters, difficulty, and session length before you
            play.
          </p>
        </header>
        <Card className="practice-hub__starter">
          <div>
            <p className="practice-hub__eyebrow">New to Hiragana?</p>
            <h3>First vowels</h3>
            <p>
              Start with five Hiragana vowels. Your progress is saved on this
              device.
            </p>
          </div>
          <Link
            className="ns-button"
            data-variant="secondary"
            to="/practice/kana/vowels"
          >
            Start first vowels
          </Link>
        </Card>
        <div className="practice-hub__games">
          {Object.entries(kanaPracticeGames).map(([game, details]) => (
            <Card as="article" className="practice-hub__game" key={game}>
              <span
                aria-hidden="true"
                className={`practice-hub__art practice-hub__art--${game}`}
                lang="ja"
              >
                {details.illustration}
              </span>
              <h3>{details.title}</h3>
              <p>{details.description}</p>
              <p className="practice-hub__eyebrow">
                Hiragana · Katakana · Mixed
              </p>
              <Link
                className="ns-button practice-hub__play"
                data-variant="primary"
                to="/practice/kana/$game/setup"
                params={{ game }}
                search={search}
              >
                Set up {details.title}
              </Link>
            </Card>
          ))}
        </div>
      </section>
      <section
        aria-labelledby="practice-kanji-title"
        className="practice-hub__section"
      >
        <header className="practice-hub__section-header">
          <h2 id="practice-kanji-title">Kanji</h2>
          <p>
            Build confidence with 30 beginner Kanji, their meanings, and
            readings in words.
          </p>
        </header>
        <div className="practice-hub__games">
          {Object.entries(kanjiPracticeGames).map(([game, details]) => (
            <Card as="article" className="practice-hub__game" key={game}>
              <span
                aria-hidden="true"
                className={`practice-hub__art practice-hub__art--kanji practice-hub__art--${game}`}
                lang="ja"
              >
                {details.illustration}
              </span>
              <h3>{details.title}</h3>
              <p>{details.description}</p>
              <p className="practice-hub__eyebrow">
                Numbers · Nature · People and basics
              </p>
              <Link
                className="ns-button practice-hub__play"
                data-variant="primary"
                to="/practice/kanji/$game/setup"
                params={{ game }}
                search={search}
              >
                Set up {details.title}
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
          <Link
            className="practice-hub__reference"
            to="/practice/words/vocabulary"
            search={search}
          >
            View vocabulary
          </Link>
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
            <h3>Word matching</h3>
            <p>
              Match five Japanese words to their meanings, then try a rolling
              review.
            </p>
            <p className="practice-hub__eyebrow">
              Beginner vocabulary · 10 matches
            </p>
            <Link
              className="ns-button practice-hub__play"
              data-variant="primary"
              to="/practice/words/matching"
            >
              Play word matching
            </Link>
          </Card>
          <CardStackGameCard count={getWordCards().length} search={search} />
        </div>
      </section>
    </section>
  );
}
