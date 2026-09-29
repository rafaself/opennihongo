import type { KanaItem, KanaProgress } from "./types";

export function recordKanaAnswer(
  existing: KanaProgress | undefined,
  item: Pick<KanaItem, "id">,
  correct: boolean,
  answeredAt: string,
): KanaProgress {
  if (existing !== undefined && existing.itemId !== item.id) {
    throw new Error(
      `Cannot update progress for ${item.id} with progress for ${existing.itemId}`,
    );
  }

  return {
    itemId: item.id,
    correctCount: (existing?.correctCount ?? 0) + (correct ? 1 : 0),
    incorrectCount: (existing?.incorrectCount ?? 0) + (correct ? 0 : 1),
    lastAnsweredAt: answeredAt,
  };
}
