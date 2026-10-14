import {
  kanaPracticeDifficulties,
  kanjiPracticeGames,
  type KanjiPracticeGame,
} from "@opennihongo/content";
import { Button } from "@opennihongo/ui";
import { getKanjiSummary, type KanjiPracticeSearch } from "../session/options";

export function KanjiSetupSummary({
  game,
  search,
  onStart,
}: {
  game: KanjiPracticeGame;
  search: KanjiPracticeSearch;
  onStart: () => void;
}) {
  const summary = getKanjiSummary(game, search);
  const preset = kanaPracticeDifficulties[search.difficulty];
  const units =
    game === "matching"
      ? "pairs"
      : game === "quiz"
        ? "questions"
        : game === "cards"
          ? "cards"
          : "answers";
  return (
    <section className="practice-setup__summary" aria-label="Your session">
      <div className="practice-setup__summary-content">
        <span
          aria-hidden="true"
          className="practice-setup__summary-art"
          lang="ja"
        >
          {kanjiPracticeGames[game].illustration}
        </span>
        <h2>Your session</h2>
        <p className="practice-setup__session-count">
          {summary.count} {units}
        </p>
        <p>
          {search.themes.length === 0
            ? "No theme selected"
            : `${String(summary.available)} available Kanji`}{" "}
          · {preset.label}
        </p>
        {game === "matching" && (
          <p>
            {summary.boards.length}{" "}
            {summary.boards.length === 1 ? "board" : "boards"} · up to{" "}
            {preset.matchingPairs} pairs each
          </p>
        )}
        {game === "quiz" && <p>{summary.choices} choices per question</p>}
        {summary.count < summary.requested && (
          <p className="practice-setup__notice">
            Your selection has {summary.available} available items. This session
            uses all available items.
          </p>
        )}
        {game === "quiz" && summary.choices < preset.quizChoices && (
          <p className="practice-setup__notice">
            There are fewer distinct answers than the requested difficulty
            allows.
          </p>
        )}
        {!summary.canStart && (
          <p role="alert" className="practice-setup__error">
            {summary.error}
          </p>
        )}
      </div>
      <div className="practice-setup__start">
        <Button disabled={!summary.canStart} onClick={onStart}>
          Start {kanjiPracticeGames[game].title}
        </Button>
      </div>
    </section>
  );
}
