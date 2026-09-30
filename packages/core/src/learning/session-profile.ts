import type { ItemSelectionStrategyId, SessionProfileId } from "../ids";
import type { MatchingConfig } from "../exercises/matching";

/** Number of generated exercises of one supported type in a profile. */
export type ExerciseMixEntry =
  | Readonly<{
      type: "typed-answer";
      count: number;
    }>
  | Readonly<{
      type: "multiple-choice";
      count: number;
    }>
  | Readonly<{
      type: "matching";
      count: number;
      config: MatchingConfig;
    }>;

/** Declarative composition for a session, independent of generated exercises. */
export type SessionProfile = Readonly<{
  id: SessionProfileId;
  targetSessionSize: number;
  exerciseMix: readonly ExerciseMixEntry[];
  selectionStrategyId: ItemSelectionStrategyId;
}>;
