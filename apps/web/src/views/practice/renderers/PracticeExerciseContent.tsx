import type { KanaPracticeDifficulty } from "@opennihongo/content";
import { MultipleChoiceExercise } from "./MultipleChoiceExercise";
import type {
  Exercise,
  LearningItemId,
  MatchingPairId,
} from "@opennihongo/core";
import { Text } from "@opennihongo/ui";
import { MatchingBoard } from "../../../components/matching/MatchingBoard";
import {
  getPracticeAudioIds,
  getPracticePronunciationText,
} from "../session/practiceAudio";
import { TypedAnswerExercise } from "./TypedAnswerExercise";

export type ExercisePresentation = Readonly<{
  instruction?: string;
  inputLabel?: string;
  supportingText?: string;
  speechText?: string;
  leftLabel?: string;
  rightLabel?: string;
}>;

type PracticeExerciseContentProps = Readonly<{
  presentation?: ExercisePresentation | undefined;
  difficulty: KanaPracticeDifficulty;
  onHintRequested: () => void;
  exercise: Exclude<Exercise, { type: "flashcard" }>;
  selectedOptionId: string | null;
  onOptionSelected: (id: string) => void;
  scriptLabel: string;
  typedAnswer: string;
  matchedPairIds: readonly MatchingPairId[];
  disabled: boolean;
  autoFocusTypedAnswer: boolean;
  loadedAudioIds: ReadonlySet<LearningItemId>;
  onPlayAudio: (audioId: LearningItemId) => void;
  onTypedAnswerChanged: (value: string) => void;
  onTypedAnswerSubmit: () => void;
  onPairAttempt: (matchedPairId: MatchingPairId | null) => void;
}>;

export function PracticeExerciseContent({
  presentation,
  exercise,
  difficulty,
  onHintRequested,
  selectedOptionId,
  onOptionSelected,
  scriptLabel,
  typedAnswer,
  matchedPairIds,
  disabled,
  autoFocusTypedAnswer,
  loadedAudioIds,
  onPlayAudio,
  onTypedAnswerChanged,
  onTypedAnswerSubmit,
  onPairAttempt,
}: PracticeExerciseContentProps) {
  switch (exercise.type) {
    case "typed-answer": {
      const audioId = getPracticeAudioIds(exercise).find((id) =>
        loadedAudioIds.has(id),
      );
      return (
        <div className="practice-session__question">
          <Text as="h1" id="practice-title" variant="display">
            {presentation?.instruction ?? "What is the corresponding sound?"}
          </Text>
          <TypedAnswerExercise
            audioId={audioId}
            audioAvailable={difficulty !== "hard" || disabled}
            hintAvailable={difficulty === "easy"}
            onHintRequested={onHintRequested}
            autoFocus={autoFocusTypedAnswer}
            disabled={disabled}
            exercise={exercise}
            inputLabel={presentation?.inputLabel}
            supportingText={presentation?.supportingText}
            speechText={
              presentation?.speechText ?? getPracticePronunciationText(exercise)
            }
            onChange={onTypedAnswerChanged}
            onPlayAudio={onPlayAudio}
            onSubmit={onTypedAnswerSubmit}
            value={typedAnswer}
          />
        </div>
      );
    }
    case "multiple-choice":
      return (
        <MultipleChoiceExercise
          exercise={exercise}
          instruction={presentation?.instruction}
          supportingText={presentation?.supportingText}
          audioAvailable={difficulty !== "hard" || disabled}
          selectedOptionId={selectedOptionId}
          disabled={disabled}
          onSelect={onOptionSelected}
          onPlayAudio={onPlayAudio}
          audioId={getPracticeAudioIds(exercise).find((id) =>
            loadedAudioIds.has(id),
          )}
          speechText={
            presentation?.speechText ?? getPracticePronunciationText(exercise)
          }
        />
      );
    case "matching":
      return (
        <div className="practice-session__question">
          <Text as="h1" id="practice-title" variant="display">
            Match the pairs:
          </Text>
          <MatchingBoard
            key={exercise.id}
            disabled={disabled}
            exercise={exercise}
            leftLabel={presentation?.leftLabel ?? "Romaji readings"}
            matchedPairIds={matchedPairIds}
            onPairAttempt={onPairAttempt}
            rightLabel={
              presentation?.rightLabel ??
              `${scriptLabel} characters and patterns`
            }
          />
        </div>
      );
    default:
      return assertNever(exercise);
  }
}

function assertNever(exercise: never): never {
  throw new Error(`Unsupported exercise type: ${String(exercise)}`);
}
