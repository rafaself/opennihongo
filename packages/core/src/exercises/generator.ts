import type { RandomSource } from "../random/random-source";
import type { ExerciseBase, ExerciseType } from "./base";

/**
 * Generates one concrete exercise from source items already selected by the
 * caller, an exercise-specific configuration, and an injected random source.
 * Item selection policy belongs to the caller, not to the generator.
 */
export type ExerciseGenerator<
  TSourceItem,
  TConfig,
  TExercise extends ExerciseBase<ExerciseType>,
> = (
  sourceItems: readonly TSourceItem[],
  config: TConfig,
  random: RandomSource,
) => TExercise;
