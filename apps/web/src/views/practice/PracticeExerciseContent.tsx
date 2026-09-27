import type {
  KanaAudioId,
  KanaExercise,
  KanaPairAnswer,
} from "@opennihongo/core";
import { Button, Surface, Text } from "@opennihongo/ui";
import { MatchingExercise } from "./MatchingExercise";
import { PronunciationButton } from "./PronunciationButton";
import { TypedAnswerExercise } from "./TypedAnswerExercise";

type PracticeExerciseContentProps = Readonly<{
  exercise: KanaExercise;
  selectedChoice: string;
  typedAnswer: string;
  matchedPairs: readonly KanaPairAnswer[];
  disabled: boolean;
  loadedAudioIds: ReadonlySet<KanaAudioId>;
  onPlayAudio: (audioId: KanaAudioId) => void;
  onChoiceSelected: (choice: string) => void;
  onTypedAnswerChanged: (value: string) => void;
  onTypedAnswerSubmit: () => void;
  onPairMatched: (pair: KanaPairAnswer) => void;
}>;

export function PracticeExerciseContent({
  exercise,
  selectedChoice,
  typedAnswer,
  matchedPairs,
  disabled,
  loadedAudioIds,
  onPlayAudio,
  onChoiceSelected,
  onTypedAnswerChanged,
  onTypedAnswerSubmit,
  onPairMatched,
}: PracticeExerciseContentProps) {
  if (exercise.kind === "multiple-choice") {
    const canPronouncePrompt = exercise.prompt.script === "hiragana";
    const promptAudioId =
      canPronouncePrompt &&
      loadedAudioIds.has(exercise.wordId)
        ? exercise.wordId
        : undefined;

    return (
      <div className="practice-session__question">
        <Text as="h1" id="practice-title" variant="display">
          {exercise.direction === "hiragana-to-romaji"
            ? "Which reading matches this word?"
            : `Choose the characters for “${exercise.prompt.text}”:`}
        </Text>
        <div className="practice-session__exercise">
          <Surface className="practice-session__prompt" elevation="card">
            <Text
              className={
                exercise.prompt.script === "hiragana"
                  ? "practice-session__prompt-kana"
                  : "practice-session__prompt-romaji"
              }
            >
              {exercise.prompt.text}
            </Text>
            {canPronouncePrompt && (
              <PronunciationButton
                audioId={promptAudioId}
                onPlay={onPlayAudio}
                text={exercise.prompt.text}
              />
            )}
          </Surface>
          <div
            aria-label="Answer choices"
            className="practice-session__choices"
            role="group"
          >
            {exercise.choices.map((choice, choiceIndex) => (
              <Button
                aria-keyshortcuts={String(choiceIndex + 1)}
                aria-pressed={selectedChoice === choice}
                className="practice-session__choice"
                data-selected={selectedChoice === choice}
                disabled={disabled}
                key={choice}
                onClick={() => {
                  onChoiceSelected(choice);
                }}
                variant="secondary"
              >
                <span
                  aria-hidden="true"
                  className="practice-session__choice-number"
                >
                  {choiceIndex + 1}
                </span>
                <span>{choice}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (exercise.kind === "typed-answer") {
    return (
      <div className="practice-session__question">
        <Text as="h1" id="practice-title" variant="display">
          What is the corresponding sound?
        </Text>
        <TypedAnswerExercise
          disabled={disabled}
          exercise={exercise}
          onChange={onTypedAnswerChanged}
          onSubmit={onTypedAnswerSubmit}
          value={typedAnswer}
        />
      </div>
    );
  }

  return (
    <div className="practice-session__question">
      <Text as="h1" id="practice-title" variant="display">
        Match the pairs:
      </Text>
      <MatchingExercise
        disabled={disabled}
        exercise={exercise}
        matchedPairs={matchedPairs}
        onPairMatched={onPairMatched}
      />
    </div>
  );
}
