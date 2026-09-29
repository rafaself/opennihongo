import type { MatchingExercise } from "./matching";
import type { TypedAnswerExercise } from "./typed-answer";

export type Exercise = MatchingExercise | TypedAnswerExercise;
export type { ExerciseBase, ExerciseType } from "./base";
export { ExerciseGenerationError } from "./generation-error";
export type { ExerciseGenerationErrorCode } from "./generation-error";
export type { ExerciseGenerator } from "./generator";
export { generateTypedAnswerExercise } from "./typed-answer-generator";
export type {
  TypedAnswerExerciseGenerationConfig,
  TypedAnswerSourceItem,
} from "./typed-answer-generator";
export type {
  MatchingConfig,
  MatchingExercise,
  MatchingPair,
} from "./matching";
export type { TypedAnswerExercise } from "./typed-answer";
export type {
  ExerciseOutcome,
  ExerciseResult,
  ItemExerciseOutcome,
  ItemExerciseResult,
} from "./result";
