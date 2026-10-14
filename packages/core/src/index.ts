export { normalizeKanaAnswer } from "./kana/index";
export { normalizeJapaneseReading } from "./kanji/reading";
export type { KanaAudioId, KanaId, KanaWordId } from "./kana/index";
export type {
  ExerciseId,
  ExerciseSessionId,
  LearningItemId,
  LearningRecordId,
  ItemSelectionStrategyId,
  MatchingPairId,
  SessionProfileId,
} from "./ids";
export type {
  ItemSelectionRequest,
  ItemSelectionStrategy,
  RandomizedItemSelectionRequest,
  ExerciseMixEntry,
  SessionProfile,
  BuildExerciseSessionRequest,
  ExerciseSession,
  ExerciseSessionBuildErrorCode,
  ExerciseSessionGenerators,
  ExerciseSessionSourceAdapters,
} from "./learning/index";
export {
  randomWithoutReplacementSelectionStrategy,
  orderedSelectionStrategy,
  orderedSelectionStrategyId,
  createExerciseSessionState,
  getCurrentExercise,
  recordExerciseSessionResult,
  advanceExerciseSession,
  type ExerciseSessionState,
  randomWithoutReplacementSelectionStrategyId,
  ExerciseSessionBuildError,
  buildExerciseSession,
} from "./learning/index";
export type {
  FlashcardFace,
  FlashcardExercise,
  FlashcardSourceItem,
  FlashcardExerciseGenerationConfig,
  ExerciseBase,
  Exercise,
  ExerciseGenerationErrorCode,
  ExerciseGenerator,
  ExerciseType,
  MultipleChoiceExercise,
  MultipleChoiceOption,
  MultipleChoiceSourceItem,
  MultipleChoiceExerciseGenerationConfig,
  MatchingConfig,
  MatchingExerciseGenerationConfig,
  MatchingExercise,
  MatchingPair,
  MatchingSourceItem,
  TypedAnswerExerciseGenerationConfig,
  TypedAnswerSourceItem,
  TypedAnswerExercise,
  ExerciseOutcome,
  ExerciseResult,
  ItemExerciseOutcome,
  ItemExerciseResult,
} from "./exercises/index";
export {
  ExerciseGenerationError,
  evaluateTypedAnswer,
  createSingleAnswerResult,
  createMatchingResult,
  scoreExerciseResults,
  countExerciseItems,
  generateFlashcardExercise,
  generateMultipleChoiceExercise,
  generateMatchingExercise,
  generateTypedAnswerExercise,
} from "./exercises/index";
export type { RandomSource } from "./random/index";
export { SeededRandomSource, shuffle } from "./random/index";
export {
  createLearningRecord,
  deriveItemProgress,
  assertLearningRecord,
  assertItemProgressBaseline,
} from "./progress/index";
export type {
  LearningRecord,
  ItemProgressBaseline,
  ItemProgress,
} from "./progress/index";
