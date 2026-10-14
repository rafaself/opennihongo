import {
  kanaPracticeDifficulties,
  kanaPracticeGames,
  kanaPracticeLengths,
  type KanaPracticeGame,
} from "@opennihongo/content";
import { Radio, RadioGroup, Switch } from "@opennihongo/ui";
import type { PracticeSearch } from "../../../app/practiceSearch";

export type KanaSetupChange = (
  change: (previous: PracticeSearch) => PracticeSearch,
) => void;

export function difficultyDescription(
  game: KanaPracticeGame,
  difficulty: PracticeSearch["difficulty"],
) {
  const preset = kanaPracticeDifficulties[difficulty];
  if (game === "matching")
    return `Up to ${String(preset.matchingPairs)} pairs per board.`;
  if (game === "quiz")
    return `Up to ${String(preset.quizChoices)} choices.${difficulty === "hard" ? " Audio after checking." : " Audio help available."}`;
  if (difficulty === "easy")
    return "Optional first-letter and answer-length hint. Audio help available.";
  if (difficulty === "hard")
    return game === "cards"
      ? "Recall independently. Audio after revealing."
      : "Read independently. Audio after checking.";
  return "Audio help available. No text hints.";
}

export function KanaSetupOptions({
  game,
  search,
  onChange,
}: {
  game: KanaPracticeGame;
  search: PracticeSearch;
  onChange: KanaSetupChange;
}) {
  return (
    <>
      <section
        className="practice-setup__panel"
        aria-labelledby="difficulty-title"
      >
        <h2 id="difficulty-title">Choose your challenge</h2>
        <p>
          Difficulty changes the help and choices, while you choose the
          characters.
        </p>
        <RadioGroup
          aria-labelledby="difficulty-title"
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
              aria-describedby={`difficulty-${key}`}
              key={key}
              value={key}
              variant="card"
            >
              <strong>{preset.label}</strong>
              <span
                id={`difficulty-${key}`}
                className="practice-setup__option-description"
              >
                {difficultyDescription(
                  game,
                  key === "easy" || key === "hard" ? key : "standard",
                )}
              </span>
            </Radio>
          ))}
        </RadioGroup>
      </section>
      <section className="practice-setup__panel" aria-labelledby="length-title">
        <h2 id="length-title">Session length</h2>
        <p>Smaller selections use their available characters.</p>
        <RadioGroup
          aria-labelledby="length-title"
          className="practice-setup__length"
          value={String(search.length ?? kanaPracticeGames[game].defaultLength)}
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
          aria-labelledby="quiz-options-title"
        >
          <h2 id="quiz-options-title">Quiz options</h2>
          <RadioGroup
            aria-label="Question direction"
            className="practice-setup__directions"
            value={search.direction}
            onValueChange={(direction) => {
              if (
                direction === "random" ||
                direction === "character" ||
                direction === "romaji"
              )
                onChange((previous) => ({ ...previous, direction }));
            }}
          >
            <Radio value="random" variant="card">
              Random
            </Radio>
            <Radio value="character" variant="card">
              Character → Romaji
            </Radio>
            <Radio value="romaji" variant="card">
              Romaji → Character
            </Radio>
          </RadioGroup>
          <div className="practice-setup__fast">
            <div>
              <label htmlFor="quiz-fast">Fast mode</label>
              <p>Check each choice immediately and move on after one second.</p>
            </div>
            <Switch
              id="quiz-fast"
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
