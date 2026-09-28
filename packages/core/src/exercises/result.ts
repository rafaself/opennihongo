import type { ExerciseId, LearningItemId } from "../ids";

export type ExerciseOutcome = "correct" | "partially-correct" | "incorrect";

export type ItemExerciseOutcome = "correct" | "incorrect";

export type ItemExerciseResult = Readonly<{
  sourceItemId: LearningItemId;
  outcome: ItemExerciseOutcome;
}>;

export type ExerciseResult = Readonly<{
  exerciseId: ExerciseId;
  sourceItemResults: readonly ItemExerciseResult[];
  outcome: ExerciseOutcome;
  attempts: number;
}>;
