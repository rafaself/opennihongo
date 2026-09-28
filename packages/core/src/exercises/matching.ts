import type { LearningItemId, MatchingPairId } from "../ids";
import type { ExerciseBase } from "./base";

export type MatchingPair = Readonly<{
  id: MatchingPairId;
  sourceItemId: LearningItemId;
  left: string;
  right: string;
}>;

export type MatchingConfig = Readonly<{
  pairCount: number;
}>;

export type MatchingExercise = Readonly<
  ExerciseBase<"matching"> & {
    config: MatchingConfig;
    pairs: readonly MatchingPair[];
    leftOrder: readonly MatchingPairId[];
    rightOrder: readonly MatchingPairId[];
  }
>;
