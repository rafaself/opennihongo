import type { KanaProgress } from "./types";
import type { ItemExerciseResult } from "../exercises/result";

export function recordKanaItemResult(
  existing: KanaProgress | undefined,
  result: ItemExerciseResult,
  answeredAt: string,
): KanaProgress {
  const correct = result.outcome === "correct";
  const itemId = result.sourceItemId;
  if (existing !== undefined && existing.itemId !== itemId) {
    throw new Error(
      `Cannot update progress for ${itemId} with progress for ${existing.itemId}`,
    );
  }

  return {
    itemId: itemId,
    correctCount: (existing?.correctCount ?? 0) + (correct ? 1 : 0),
    incorrectCount: (existing?.incorrectCount ?? 0) + (correct ? 0 : 1),
    lastAnsweredAt: answeredAt,
  };
}
