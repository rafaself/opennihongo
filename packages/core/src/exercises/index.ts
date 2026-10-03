import type { FlashcardExercise } from "./flashcards/flashcard";
import type { MultipleChoiceExercise } from "./multiple-choice";
import type { MatchingExercise } from "./matching";
import type { TypedAnswerExercise } from "./typed-answer";

export type Exercise =
  | MatchingExercise
  | TypedAnswerExercise
  | MultipleChoiceExercise
  | FlashcardExercise;
export type { ExerciseBase, ExerciseType } from "./base";
export { ExerciseGenerationError } from "./generation-error";
export type { ExerciseGenerationErrorCode } from "./generation-error";
export type { ExerciseGenerator } from "./generator";
export { generateMatchingExercise } from "./matching-generator";
export type {
  MatchingExerciseGenerationConfig,
  MatchingSourceItem,
} from "./matching-generator";
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

export type {
  MultipleChoiceExercise,
  MultipleChoiceOption,
} from "./multiple-choice";
export { generateMultipleChoiceExercise } from "./multiple-choice-generator";
export type {
  MultipleChoiceSourceItem,
  MultipleChoiceExerciseGenerationConfig,
} from "./multiple-choice-generator";

export type {
  FlashcardFace,
  FlashcardExercise,
  FlashcardSourceItem,
  FlashcardExerciseGenerationConfig,
} from "./flashcards/flashcard";
export { generateFlashcardExercise } from "./flashcards/generateFlashcardExercise";
