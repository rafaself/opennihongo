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

type PracticeExerciseContentProps = Readonly<{
  exercise: Exercise;
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
  exercise,
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
            What is the corresponding sound?
          </Text>
          <TypedAnswerExercise
            audioId={audioId}
            autoFocus={autoFocusTypedAnswer}
            disabled={disabled}
            exercise={exercise}
            speechText={getPracticePronunciationText(exercise)}
            onChange={onTypedAnswerChanged}
            onPlayAudio={onPlayAudio}
            onSubmit={onTypedAnswerSubmit}
            value={typedAnswer}
          />
        </div>
      );
    }
    case "matching":
      return (
        <div className="practice-session__question">
          <Text as="h1" id="practice-title" variant="display">
            Match the pairs:
          </Text>
          <MatchingBoard
            disabled={disabled}
            exercise={exercise}
            leftLabel="Romaji readings"
            matchedPairIds={matchedPairIds}
            onPairAttempt={onPairAttempt}
            rightLabel={`${scriptLabel} characters and patterns`}
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
