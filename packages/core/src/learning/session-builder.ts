import type { Exercise } from "../exercises/index";
import type { ExerciseType } from "../exercises/base";
import {
  ExerciseSessionBuildError,
  type BuildExerciseSessionRequest,
  type ExerciseSession,
} from "./session-builder-contracts";
import {
  buildExercise,
  prepareExerciseParts,
} from "./session-exercise-factory";
import { validateSessionProfile } from "./session-profile-plan";

export {
  ExerciseSessionBuildError,
  type BuildExerciseSessionRequest,
  type ExerciseSession,
  type ExerciseSessionBuildErrorCode,
  type ExerciseSessionGenerators,
  type ExerciseSessionSourceAdapters,
} from "./session-builder-contracts";

/**
 * Builds a concrete session before presentation. Source items may be reused
 * across different exercise types, but each type selects distinct items.
 */
export function buildExerciseSession<TItem>(
  request: BuildExerciseSessionRequest<TItem>,
): ExerciseSession {
  const { profile, sessionId, selectionStrategy, eligibleItems } = request;

  if (typeof sessionId !== "string" || sessionId.trim().length === 0) {
    throw new ExerciseSessionBuildError(
      "invalid-request",
      "A stable non-empty exercise session ID is required.",
    );
  }

  const validatedProfile = validateSessionProfile(profile);
  if (selectionStrategy.id !== profile.selectionStrategyId) {
    throw new ExerciseSessionBuildError(
      "selection-strategy-mismatch",
      `Profile ${profile.id} requires selection strategy ${profile.selectionStrategyId}, but received ${selectionStrategy.id}.`,
    );
  }

  const preparedParts = prepareExerciseParts<TItem>(
    validatedProfile.parts,
    request,
  );

  if (!Array.isArray(eligibleItems)) {
    throw new ExerciseSessionBuildError(
      "invalid-request",
      "Eligible source items must be provided as an array.",
    );
  }

  if (eligibleItems.length < validatedProfile.maxSourceItemDemand) {
    throw new ExerciseSessionBuildError(
      "insufficient-source-items",
      `Profile ${profile.id} needs at least ${String(validatedProfile.maxSourceItemDemand)} eligible items for one exercise, but only ${String(eligibleItems.length)} are available.`,
    );
  }

  const exercises: Exercise[] = [];
  const selectedSourceIdsByType = new Map<ExerciseType, Set<string>>();

  for (const part of preparedParts) {
    const selectedSourceIds =
      selectedSourceIdsByType.get(part.type) ?? new Set<string>();
    for (let count = 0; count < part.count; count += 1) {
      const availableItems = eligibleItems.filter(
        (item: TItem) => !selectedSourceIds.has(part.adapter(item).id),
      );
      if (availableItems.length < part.sourceItemCount) {
        throw new ExerciseSessionBuildError(
          "insufficient-source-items",
          `Profile ${profile.id} needs ${String(part.sourceItemCount)} unused source items for another ${part.type} exercise, but only ${String(availableItems.length)} are available.`,
        );
      }

      const selection: unknown = selectionStrategy.select({
        eligibleItems: availableItems,
        count: part.sourceItemCount,
        random: request.random,
      });
      const returnedCount = Array.isArray(selection) ? selection.length : null;
      if (returnedCount === null || returnedCount !== part.sourceItemCount) {
        throw new ExerciseSessionBuildError(
          "incomplete-selection",
          `Selection strategy ${selectionStrategy.id} returned ${returnedCount === null ? "a non-array value" : String(returnedCount)} items; this ${part.type} exercise requires ${String(part.sourceItemCount)}.`,
        );
      }

      const selectedItems = selection as readonly TItem[];
      const exercise = buildExercise(part, selectedItems, request);
      for (const sourceItemId of exercise.sourceItemIds) {
        if (selectedSourceIds.has(sourceItemId)) {
          throw new ExerciseSessionBuildError(
            "duplicate-source-item-id",
            `Selected source item ID ${sourceItemId} was already used by another ${part.type} exercise.`,
          );
        }
      }
      for (const sourceItemId of exercise.sourceItemIds) {
        selectedSourceIds.add(sourceItemId);
      }
      selectedSourceIdsByType.set(part.type, selectedSourceIds);
      exercises.push(exercise);
    }
  }

  return Object.freeze({
    id: sessionId,
    profileId: profile.id,
    exercises: Object.freeze(exercises),
  });
}
