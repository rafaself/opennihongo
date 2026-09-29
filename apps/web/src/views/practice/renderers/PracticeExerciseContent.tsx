import type { Exercise, KanaAudioId, MatchingPairId } from "@opennihongo/core";
import { Text } from "@opennihongo/ui";
import { getPracticeAudioIds } from "../session/practiceAudio";
import { MatchingExercise } from "./MatchingExercise";
import { TypedAnswerExercise } from "./TypedAnswerExercise";

type PracticeExerciseContentProps = Readonly<{
  exercise: Exercise;
  typedAnswer: string;
  matchedPairIds: readonly MatchingPairId[];
  disabled: boolean;
  autoFocusTypedAnswer: boolean;
  loadedAudioIds: ReadonlySet<KanaAudioId>;
  onPlayAudio: (audioId: KanaAudioId) => void;
  onTypedAnswerChanged: (value: string) => void;
  onTypedAnswerSubmit: () => void;
  onPairAttempt: (matchedPairId: MatchingPairId | null) => void;
}>;

export function PracticeExerciseContent({
  exercise,
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
          <MatchingExercise
            disabled={disabled}
            exercise={exercise}
            matchedPairIds={matchedPairIds}
            onPairAttempt={onPairAttempt}
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
