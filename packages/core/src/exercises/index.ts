import type { MatchingExercise } from "./matching";
import type { TypedAnswerExercise } from "./typed-answer";

export type Exercise = MatchingExercise | TypedAnswerExercise;
export type { ExerciseBase, ExerciseType } from "./base";
export type {
  MatchingConfig,
  MatchingExercise,
  MatchingPair,
} from "./matching";
export type { TypedAnswerExercise } from "./typed-answer";
