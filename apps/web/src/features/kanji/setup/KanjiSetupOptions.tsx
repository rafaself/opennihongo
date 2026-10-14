import {
  kanaPracticeDifficulties,
  kanaPracticeLengths,
  kanjiPracticeGames,
  type KanjiPracticeGame,
} from "@opennihongo/content";
import { Radio, RadioGroup, Switch } from "@opennihongo/ui";
import type { KanjiPracticeSearch } from "../session/options";

export type KanjiSetupChange = (
  change: (previous: KanjiPracticeSearch) => KanjiPracticeSearch,
) => void;

function description(
  game: KanjiPracticeGame,
  difficulty: KanjiPracticeSearch["difficulty"],
) {
  const preset = kanaPracticeDifficulties[difficulty];
  if (game === "matching")
    return `Up to ${String(preset.matchingPairs)} pairs per board.`;
  if (game === "quiz")
    return `Up to ${String(preset.quizChoices)} choices.${difficulty === "hard" ? " Audio after checking." : " Audio help available."}`;
  if (game === "cards")
    return difficulty === "hard"
      ? "Recall independently. Audio after revealing."
      : "Audio help available before and after revealing.";
  if (difficulty === "easy")
    return "Optional first-character and answer-length hint. Audio help available.";
  if (difficulty === "hard") return "Audio after checking.";
  return "Audio help available. No text hints.";
}

export function KanjiSetupOptions({
  game,
  search,
  onChange,
}: {
  game: KanjiPracticeGame;
  search: KanjiPracticeSearch;
  onChange: KanjiSetupChange;
}) {
  return (
    <>
      <section
        className="practice-setup__panel"
        aria-labelledby="kanji-difficulty-title"
      >
        <h2 id="kanji-difficulty-title">Choose your challenge</h2>
        <p>
          Difficulty changes the help and choices, while you choose the Kanji.
        </p>
        <RadioGroup
          aria-labelledby="kanji-difficulty-title"
          className="practice-setup__difficulty"
          value={search.difficulty}
          onValueChange={(difficulty) => {
            if (
              difficulty === "easy" ||
              difficulty === "standard" ||
              difficulty === "hard"
            )
              onChange((previous) => ({ ...previous, difficulty }));
          }}
        >
          {Object.entries(kanaPracticeDifficulties).map(([key, preset]) => (
            <Radio
              aria-label={preset.label}
              aria-describedby={`kanji-difficulty-${key}`}
              key={key}
              value={key}
              variant="card"
            >
              <strong>{preset.label}</strong>
              <span
                id={`kanji-difficulty-${key}`}
                className="practice-setup__option-description"
              >
                {description(
                  game,
                  key === "easy" || key === "hard" ? key : "standard",
                )}
              </span>
            </Radio>
          ))}
        </RadioGroup>
      </section>
      <section
        className="practice-setup__panel"
        aria-labelledby="kanji-length-title"
      >
        <h2 id="kanji-length-title">Session length</h2>
        <p>Smaller selections use all their available Kanji.</p>
        <RadioGroup
          aria-labelledby="kanji-length-title"
          className="practice-setup__length"
          value={String(
            search.length ?? kanjiPracticeGames[game].defaultLength,
          )}
          onValueChange={(value) => {
            const length = kanaPracticeLengths.find(
              (size) => String(size) === value,
            );
            if (length !== undefined)
              onChange((previous) => ({ ...previous, length }));
          }}
        >
          {kanaPracticeLengths.map((length) => (
            <Radio key={length} value={String(length)} variant="card">
              {length} items
            </Radio>
          ))}
        </RadioGroup>
      </section>
      {game === "quiz" && (
        <section
          className="practice-setup__panel"
          aria-labelledby="kanji-quiz-title"
        >
          <h2 id="kanji-quiz-title">Quiz focus</h2>
          <RadioGroup
            aria-labelledby="kanji-quiz-title"
            className="practice-setup__directions"
            value={search.focus}
            onValueChange={(focus) => {
              if (
                focus === "meanings" ||
                focus === "readings" ||
                focus === "mixed"
              )
                onChange((previous) => ({ ...previous, focus }));
            }}
          >
            <Radio value="mixed" variant="card">
              Mixed
            </Radio>
            <Radio value="meanings" variant="card">
              Meanings
            </Radio>
            <Radio value="readings" variant="card">
              Readings
            </Radio>
          </RadioGroup>
          <div className="practice-setup__fast">
            <div>
              <label htmlFor="kanji-fast">Fast mode</label>
              <p>Check immediately and move on after one second.</p>
            </div>
            <Switch
              id="kanji-fast"
              checked={search.fast}
              onCheckedChange={(fast) => {
                onChange((previous) => ({ ...previous, fast }));
              }}
            />
          </div>
        </section>
      )}
    </>
  );
}
