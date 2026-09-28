import type { MatchingPairId } from "../ids";
import type { ExerciseBase } from "./base";

export type MatchingPair = Readonly<{
  id: MatchingPairId;
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
