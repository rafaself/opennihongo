import type { ExerciseId, LearningItemId } from "../ids";
import { ExerciseGenerationError } from "./generation-error";
import type { ExerciseGenerator } from "./generator";
import type { TypedAnswerExercise } from "./typed-answer";

/**
 * Minimal caller-adapted content needed to generate one typed-answer exercise.
 * Content selection and domain-specific mapping stay with the caller.
 */
export type TypedAnswerSourceItem = Readonly<{
  id: LearningItemId;
  prompt: Readonly<{ text: string }>;
  acceptedAnswers: readonly string[];
}>;

/** Stable identity supplied by the caller for the generated exercise. */
export type TypedAnswerExerciseGenerationConfig = Readonly<{
  exerciseId: ExerciseId;
}>;

/**
 * Copies one compatible source item into a typed-answer exercise without
 * changing its prompt or accepted-answer semantics. It does not use random
 * choices, so the injected RandomSource is intentionally unused.
 */
export const generateTypedAnswerExercise: ExerciseGenerator<
  TypedAnswerSourceItem,
  TypedAnswerExerciseGenerationConfig,
  TypedAnswerExercise
> = (sourceItems, config) => {
  const sourceItem = sourceItems[0];

  if (sourceItem === undefined) {
    throw new ExerciseGenerationError(
      "insufficient-source-items",
      "Expected one source item but received none.",
    );
  }

  if (sourceItems.length > 1) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      `Expected exactly one source item but received ${String(sourceItems.length)}.`,
    );
  }

  if (config.exerciseId.trim().length === 0) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "A stable exercise ID is required.",
    );
  }

  if (sourceItem.id.trim().length === 0) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "A typed-answer source item must have a stable ID.",
    );
  }

  if (sourceItem.prompt.text.trim().length === 0) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "A typed-answer source item must have prompt text.",
    );
  }

  if (
    sourceItem.acceptedAnswers.length === 0 ||
    sourceItem.acceptedAnswers.some((answer) => answer.trim().length === 0)
  ) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "A typed-answer source item must have non-empty accepted answers.",
    );
  }

  return {
    id: config.exerciseId,
    type: "typed-answer",
    prompt: { ...sourceItem.prompt },
    acceptedAnswers: [...sourceItem.acceptedAnswers],
    sourceItemIds: [sourceItem.id],
  };
};
