import type { ExerciseId, LearningItemId } from "../ids";
import type {
  Exercise,
  MatchingExerciseGenerationConfig,
  MatchingSourceItem,
  TypedAnswerSourceItem,
} from "../exercises/index";
import type { ExerciseType } from "../exercises/base";
import {
  ExerciseSessionBuildError,
  type BuildExerciseSessionRequest,
  type ExerciseSessionGenerators,
  type ExerciseSessionSourceAdapters,
} from "./session-builder-contracts";
import type { ProfilePart } from "./session-profile-plan";

type PreparedProfilePart<TItem> =
  | (Extract<ProfilePart, { type: "typed-answer" }> &
      Readonly<{
        adapter: NonNullable<
          ExerciseSessionSourceAdapters<TItem>["typed-answer"]
        >;
        generator: NonNullable<ExerciseSessionGenerators["typed-answer"]>;
      }>)
  | (Extract<ProfilePart, { type: "matching" }> &
      Readonly<{
        adapter: NonNullable<ExerciseSessionSourceAdapters<TItem>["matching"]>;
        generator: NonNullable<ExerciseSessionGenerators["matching"]>;
      }>);

/** Resolves dependencies up front with exhaustive, static type dispatch. */
export function prepareExerciseParts<TItem>(
  parts: readonly ProfilePart[],
  request: BuildExerciseSessionRequest<TItem>,
): readonly PreparedProfilePart<TItem>[] {
  const preparedParts: PreparedProfilePart<TItem>[] = [];

  for (const part of parts) {
    switch (part.type) {
      case "typed-answer": {
        const adapter = request.sourceAdapters["typed-answer"];
        const generator = request.generators["typed-answer"];
        if (adapter === undefined || generator === undefined) {
          throw new ExerciseSessionBuildError(
            "missing-generator",
            "Typed-answer exercises require a typed-answer source adapter and generator.",
          );
        }
        preparedParts.push({ ...part, adapter, generator });
        break;
      }
      case "matching": {
        const adapter = request.sourceAdapters.matching;
        const generator = request.generators.matching;
        if (adapter === undefined || generator === undefined) {
          throw new ExerciseSessionBuildError(
            "missing-generator",
            "Matching exercises require a matching source adapter and generator.",
          );
        }
        preparedParts.push({ ...part, adapter, generator });
        break;
      }
    }
  }

  return preparedParts;
}

/** Adapts and generates one exercise from exactly one selected item group. */
export function buildExercise<TItem>(
  part: PreparedProfilePart<TItem>,
  selectedItems: readonly TItem[],
  request: BuildExerciseSessionRequest<TItem>,
): Exercise {
  switch (part.type) {
    case "typed-answer": {
      const sourceItems = selectedItems.map(part.adapter);
      const sourceIds = validateSourceIds(sourceItems);
      const exerciseId = createExerciseId(
        request.sessionId,
        request.profile.id,
        part.type,
        sourceIds,
      );
      const generated = part.generator(
        sourceItems,
        { exerciseId },
        request.random,
      );
      assertGeneratedExercise(generated, exerciseId, part.type, sourceIds);
      return freezeExercise(generated);
    }
    case "matching": {
      const sourceItems = selectedItems.map(part.adapter);
      const sourceIds = validateSourceIds(sourceItems);
      const exerciseId = createExerciseId(
        request.sessionId,
        request.profile.id,
        part.type,
        sourceIds,
      );
      const config: MatchingExerciseGenerationConfig = {
        exerciseId,
        pairCount: part.config.pairCount,
      };
      const generated = part.generator(sourceItems, config, request.random);
      assertGeneratedExercise(generated, exerciseId, part.type, sourceIds);
      return freezeExercise(generated);
    }
  }
}

function validateSourceIds(
  sourceItems: readonly (TypedAnswerSourceItem | MatchingSourceItem)[],
): LearningItemId[] {
  const sourceIds = sourceItems.map(({ id }) => id);
  const usedIds = new Set<LearningItemId>();

  for (const id of sourceIds) {
    if (typeof id !== "string" || id.trim().length === 0) {
      throw new ExerciseSessionBuildError(
        "invalid-source-item",
        "Every selected source item must have a stable non-empty ID.",
      );
    }
    if (usedIds.has(id)) {
      throw new ExerciseSessionBuildError(
        "duplicate-source-item-id",
        `Selected source item ID ${id} is repeated within one exercise.`,
      );
    }
    usedIds.add(id);
  }

  return sourceIds;
}

function createExerciseId(
  sessionId: string,
  profileId: string,
  type: ExerciseType,
  sourceIds: readonly LearningItemId[],
): ExerciseId {
  // The tuple contains only strings and string arrays, which JSON always encodes.
  const identity = JSON.stringify([
    sessionId,
    profileId,
    type,
    [...sourceIds].sort(),
  ]);
  return `session-exercise:${identity}`;
}

function assertGeneratedExercise(
  exercise: unknown,
  expectedId: ExerciseId,
  expectedType: ExerciseType,
  expectedSourceIds: readonly LearningItemId[],
): void {
  if (typeof exercise !== "object" || exercise === null) {
    throw invalidGeneratedExercise(expectedType);
  }
  const candidate = exercise as Record<string, unknown>;
  const sourceItemIds = candidate["sourceItemIds"];
  if (
    candidate["id"] !== expectedId ||
    candidate["type"] !== expectedType ||
    !Array.isArray(sourceItemIds) ||
    sourceItemIds.length !== expectedSourceIds.length ||
    !sourceItemIds.every(
      (id: unknown, index: number) => id === expectedSourceIds[index],
    )
  ) {
    throw invalidGeneratedExercise(expectedType);
  }
}

function invalidGeneratedExercise(
  expectedType: ExerciseType,
): ExerciseSessionBuildError {
  return new ExerciseSessionBuildError(
    "invalid-generated-exercise",
    `The ${expectedType} generator did not preserve its assigned exercise and source identities.`,
  );
}

function freezeExercise(exercise: Exercise): Exercise {
  switch (exercise.type) {
    case "typed-answer":
      return Object.freeze({
        id: exercise.id,
        type: exercise.type,
        prompt: Object.freeze({ text: exercise.prompt.text }),
        acceptedAnswers: Object.freeze([...exercise.acceptedAnswers]),
        sourceItemIds: Object.freeze([...exercise.sourceItemIds]),
      });
    case "matching":
      return Object.freeze({
        id: exercise.id,
        type: exercise.type,
        sourceItemIds: Object.freeze([...exercise.sourceItemIds]),
        config: Object.freeze({ pairCount: exercise.config.pairCount }),
        pairs: Object.freeze(
          exercise.pairs.map((pair) => Object.freeze({ ...pair })),
        ),
        leftOrder: Object.freeze([...exercise.leftOrder]),
        rightOrder: Object.freeze([...exercise.rightOrder]),
      });
  }
}
