import { ExerciseSessionBuildError } from "./session-builder-contracts";

/** One declared exercise type and the source demand for a single instance. */
export type ProfilePart =
  | Readonly<{
      type: "typed-answer";
      count: number;
      sourceItemCount: 1;
    }>
  | Readonly<{
      type: "matching";
      count: number;
      sourceItemCount: number;
      config: Readonly<{ pairCount: number }>;
    }>;

export type ValidatedProfile = Readonly<{
  parts: readonly ProfilePart[];
  targetSessionSize: number;
  maxSourceItemDemand: number;
}>;

/** Validates declarative composition and computes per-exercise source demand. */
export function validateSessionProfile(profile: unknown): ValidatedProfile {
  if (typeof profile !== "object" || profile === null) {
    throw new ExerciseSessionBuildError(
      "invalid-profile",
      "A session profile is required.",
    );
  }

  const rawProfile = profile as unknown as Record<string, unknown>;
  const profileId = rawProfile["id"];
  const selectionStrategyId = rawProfile["selectionStrategyId"];
  const targetSessionSize = rawProfile["targetSessionSize"];
  const exerciseMix = rawProfile["exerciseMix"];
  if (
    typeof profileId !== "string" ||
    profileId.trim().length === 0 ||
    typeof selectionStrategyId !== "string" ||
    selectionStrategyId.trim().length === 0 ||
    typeof targetSessionSize !== "number" ||
    !Number.isSafeInteger(targetSessionSize) ||
    targetSessionSize <= 0 ||
    !Array.isArray(exerciseMix) ||
    exerciseMix.length === 0
  ) {
    throw new ExerciseSessionBuildError(
      "invalid-profile",
      "A session profile requires stable IDs, a positive safe target size, and a non-empty exercise mix.",
    );
  }

  const parts: ProfilePart[] = [];
  let exerciseCount = 0;
  let sourceItemSelections = 0;
  let maxSourceItemDemand = 0;

  for (const rawPart of exerciseMix as unknown[]) {
    if (typeof rawPart !== "object" || rawPart === null) {
      throw new ExerciseSessionBuildError(
        "invalid-profile",
        "Every exercise mix entry must be an object.",
      );
    }

    const entry = rawPart as Record<string, unknown>;
    const rawCount = entry["count"];
    if (
      typeof rawCount !== "number" ||
      !Number.isSafeInteger(rawCount) ||
      rawCount <= 0
    ) {
      throw new ExerciseSessionBuildError(
        "invalid-profile",
        "Every exercise mix count must be a positive safe integer.",
      );
    }

    let part: ProfilePart;
    if (entry["type"] === "typed-answer") {
      part = { type: "typed-answer", count: rawCount, sourceItemCount: 1 };
    } else if (entry["type"] === "matching") {
      part = validateMatchingPart(entry, rawCount);
    } else {
      throw new ExerciseSessionBuildError(
        "invalid-profile",
        `Unsupported exercise type in profile: ${String(entry["type"])}.`,
      );
    }

    exerciseCount += rawCount;
    sourceItemSelections += rawCount * part.sourceItemCount;
    maxSourceItemDemand = Math.max(maxSourceItemDemand, part.sourceItemCount);
    if (
      !Number.isSafeInteger(exerciseCount) ||
      !Number.isSafeInteger(sourceItemSelections)
    ) {
      throw new ExerciseSessionBuildError(
        "invalid-profile",
        "The profile exercise count or source-item demand exceeds safe integer limits.",
      );
    }

    parts.push(part);
  }

  if (exerciseCount !== targetSessionSize) {
    throw new ExerciseSessionBuildError(
      "invalid-profile",
      `Exercise mix count ${String(exerciseCount)} does not match target session size ${String(targetSessionSize)}.`,
    );
  }

  return { parts, targetSessionSize, maxSourceItemDemand };
}

function validateMatchingPart(
  entry: Record<string, unknown>,
  count: number,
): ProfilePart {
  const rawConfig = entry["config"];
  if (typeof rawConfig !== "object" || rawConfig === null) {
    throw invalidPairCount();
  }

  const rawPairCount = (rawConfig as Record<string, unknown>)["pairCount"];
  if (
    typeof rawPairCount !== "number" ||
    !Number.isSafeInteger(rawPairCount) ||
    rawPairCount <= 0
  ) {
    throw invalidPairCount();
  }

  return {
    type: "matching",
    count,
    sourceItemCount: rawPairCount,
    config: { pairCount: rawPairCount },
  };
}

function invalidPairCount(): ExerciseSessionBuildError {
  return new ExerciseSessionBuildError(
    "invalid-profile",
    "Every matching exercise requires a positive safe pair count.",
  );
}
