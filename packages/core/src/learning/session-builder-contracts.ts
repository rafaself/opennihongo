import type { ExerciseSessionId } from "../ids";
import type {
  Exercise,
  MultipleChoiceExercise,
  MultipleChoiceSourceItem,
  MultipleChoiceExerciseGenerationConfig,
  MatchingExercise,
  MatchingExerciseGenerationConfig,
  MatchingSourceItem,
  TypedAnswerExercise,
  TypedAnswerExerciseGenerationConfig,
  TypedAnswerSourceItem,
} from "../exercises/index";
import type { ExerciseGenerator } from "../exercises/generator";
import type { RandomSource } from "../random/random-source";
import type {
  ItemSelectionStrategy,
  RandomizedItemSelectionRequest,
} from "./item-selection-strategy";
import type { SessionProfile } from "./session-profile";

/** A generated exercise collection ready for presentation or persistence. */
export type ExerciseSession = Readonly<{
  id: ExerciseSessionId;
  profileId: SessionProfile["id"];
  exercises: readonly Exercise[];
}>;

/** Maps authored caller data into the minimal source contract for a generator. */
export type ExerciseSessionSourceAdapters<TItem> = Readonly<{
  "typed-answer"?: (item: TItem) => TypedAnswerSourceItem;
  "multiple-choice"?: (item: TItem) => MultipleChoiceSourceItem;
  matching?: (item: TItem) => MatchingSourceItem;
}>;

/** Statically available generators for each supported exercise type. */
export type ExerciseSessionGenerators = Readonly<{
  "typed-answer"?: ExerciseGenerator<
    TypedAnswerSourceItem,
    TypedAnswerExerciseGenerationConfig,
    TypedAnswerExercise
  >;
  "multiple-choice"?: ExerciseGenerator<
    MultipleChoiceSourceItem,
    MultipleChoiceExerciseGenerationConfig,
    MultipleChoiceExercise
  >;
  matching?: ExerciseGenerator<
    MatchingSourceItem,
    MatchingExerciseGenerationConfig,
    MatchingExercise
  >;
}>;

/** Inputs for constructing one complete session before rendering. */
export type BuildExerciseSessionRequest<TItem> = Readonly<{
  sessionId: ExerciseSessionId;
  profile: SessionProfile;
  eligibleItems: readonly TItem[];
  selectionStrategy: ItemSelectionStrategy<
    TItem,
    RandomizedItemSelectionRequest<TItem>
  >;
  sourceAdapters: ExerciseSessionSourceAdapters<TItem>;
  generators: ExerciseSessionGenerators;
  random: RandomSource;
}>;

/** Stable failure reasons for invalid or impossible session construction. */
export type ExerciseSessionBuildErrorCode =
  | "invalid-request"
  | "invalid-profile"
  | "selection-strategy-mismatch"
  | "missing-generator"
  | "insufficient-source-items"
  | "incomplete-selection"
  | "invalid-source-item"
  | "duplicate-source-item-id"
  | "invalid-generated-exercise";

/** A domain error raised when a session cannot honor its declared profile. */
export class ExerciseSessionBuildError extends Error {
  constructor(
    readonly code: ExerciseSessionBuildErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ExerciseSessionBuildError";
  }
}
