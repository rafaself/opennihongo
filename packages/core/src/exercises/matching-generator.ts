import type { ExerciseId, LearningItemId } from "../ids";
import { shuffle } from "../random/shuffle";
import { ExerciseGenerationError } from "./generation-error";
import type { ExerciseGenerator } from "./generator";
import type { MatchingConfig, MatchingExercise } from "./matching";

/** Minimal caller-adapted content for an already-selected matching pair. */
export type MatchingSourceItem = Readonly<{
  id: LearningItemId;
  left: string;
  right: string;
}>;

/** Stable exercise identity plus the requested size of the selected set. */
export type MatchingExerciseGenerationConfig = Readonly<{
  exerciseId: ExerciseId;
}> &
  MatchingConfig;

/**
 * Builds matching pairs from a caller-selected set and independently shuffles
 * each presentation side. Pair identities depend only on stable source IDs.
 */
export const generateMatchingExercise: ExerciseGenerator<
  MatchingSourceItem,
  MatchingExerciseGenerationConfig,
  MatchingExercise
> = (sourceItems, config, random) => {
  if (config.exerciseId.trim().length === 0) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "A stable exercise ID is required.",
    );
  }

  if (!Number.isSafeInteger(config.pairCount) || config.pairCount <= 0) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "The matching pair count must be a positive safe integer.",
    );
  }

  const sourceIds = new Set<LearningItemId>();

  for (const item of sourceItems) {
    if (item.id.trim().length === 0) {
      throw new ExerciseGenerationError(
        "invalid-configuration",
        "A matching source item must have a stable ID.",
      );
    }

    if (sourceIds.has(item.id)) {
      throw new ExerciseGenerationError(
        "invalid-configuration",
        `Duplicate matching source item ID: ${item.id}.`,
      );
    }

    sourceIds.add(item.id);

    if (item.left.trim().length === 0 || item.right.trim().length === 0) {
      throw new ExerciseGenerationError(
        "invalid-configuration",
        `Matching source item ${item.id} must have non-empty left and right text.`,
      );
    }
  }

  if (sourceItems.length < config.pairCount) {
    throw new ExerciseGenerationError(
      "insufficient-source-items",
      `Expected ${String(config.pairCount)} unique source items but received ${String(sourceItems.length)}.`,
    );
  }

  if (sourceItems.length > config.pairCount) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      `Expected exactly ${String(config.pairCount)} selected source items but received ${String(sourceItems.length)}.`,
    );
  }

  const pairs = sourceItems.map((item) => ({
    id: `pair.${item.id}`,
    sourceItemId: item.id,
    left: item.left,
    right: item.right,
  }));
  const pairIds = pairs.map(({ id }) => id);

  return {
    id: config.exerciseId,
    type: "matching",
    sourceItemIds: sourceItems.map(({ id }) => id),
    config: { pairCount: config.pairCount },
    pairs,
    leftOrder: shuffle(pairIds, random),
    rightOrder: shuffle(pairIds, random),
  };
};
