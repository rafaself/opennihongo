import {
  kanaPracticeGames,
  kanaPracticeDifficulties,
  type KanaPracticeGame,
} from "@opennihongo/content";
import { Button } from "@opennihongo/ui";
import type { PracticeSearch } from "../../../app/practiceSearch";
import { getKanaPracticeSummary } from "../../../views/practice/session/kanaPracticeContent";

export function KanaSetupSummary({
  game,
  search,
  onStart,
}: {
  game: KanaPracticeGame;
  search: PracticeSearch;
  onStart: () => void;
}) {
  const summary = getKanaPracticeSummary(game, search);
  const preset = kanaPracticeDifficulties[search.difficulty];
  const units =
    game === "matching"
      ? "pairs"
      : game === "quiz"
        ? "questions"
        : game === "cards"
          ? "cards"
          : "answers";
  const distinct = game === "quiz" || game === "matching";
  return (
    <section className="practice-setup__summary" aria-label="Your session">
      <div className="practice-setup__summary-content">
        <span
          aria-hidden="true"
          className="practice-setup__summary-art"
          lang="ja"
        >
          {kanaPracticeGames[game].illustration}
        </span>
        <h2>Your session</h2>
        <p className="practice-setup__session-count">
          {summary.count} {units}
        </p>
        <p>
          {search.scripts
            .map((script) => (script === "hiragana" ? "Hiragana" : "Katakana"))
            .join(" + ") || "No writing system selected"}{" "}
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
            Your selection has {summary.available}{" "}
            {distinct ? "distinct readings" : "characters"}. This session uses
            all available items.
          </p>
        )}
        {game === "quiz" && summary.choices < preset.quizChoices && (
          <p className="practice-setup__notice">
            Only {summary.distinct} distinct readings are available, so each
            question has {summary.choices} choices.
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
          Start {kanaPracticeGames[game].title}
        </Button>
      </div>
    </section>
  );
}
