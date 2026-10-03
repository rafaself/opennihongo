import { createSingleAnswerResult } from "../results";
import type { ExerciseResult } from "../result";
import type { TypedAnswerExercise } from "./exercise";

/** The caller supplies the content domain's normalization policy. */
export function evaluateTypedAnswer(
  exercise: TypedAnswerExercise,
  input: string,
  normalize: (value: string) => string,
): ExerciseResult {
  const correct = exercise.acceptedAnswers.some(
    (answer) => normalize(answer) === normalize(input),
  );
  return createSingleAnswerResult(exercise, correct, 1);
}
