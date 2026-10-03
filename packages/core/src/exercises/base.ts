import type { ExerciseId, LearningItemId } from "../ids";

export type ExerciseType =
  "typed-answer" | "matching" | "multiple-choice" | "flashcard";

export type ExerciseBase<TType extends ExerciseType> = Readonly<{
  id: ExerciseId;
  type: TType;
  sourceItemIds: readonly LearningItemId[];
}>;
