import type {
  ItemProgress,
  ItemProgressBaseline,
  LearningRecord,
} from "./types";
import { assertItemProgressBaseline } from "./validation";
import { createLearningRecord } from "./record";

/** Commutative counts and latest activity: neither load order nor attempts affects evidence. */
export function deriveItemProgress(
  records: readonly LearningRecord[],
  baselines: readonly ItemProgressBaseline[] = [],
): readonly ItemProgress[] {
  const progress = new Map<string, ItemProgress>();
  const seenRecords = new Map<string, string>();
  for (const baseline of baselines) {
    assertItemProgressBaseline(baseline);
    if (progress.has(baseline.itemId))
      throw new Error("Duplicate item progress baseline.");
    progress.set(baseline.itemId, entry(baseline));
  }
  for (const input of records) {
    const record = createLearningRecord(input);
    const payload = JSON.stringify(record);
    const previous = seenRecords.get(record.id);
    if (previous !== undefined) {
      if (previous !== payload)
        throw new Error("Conflicting learning record identity.");
      continue;
    }
    seenRecords.set(record.id, payload);
    for (const item of record.result.sourceItemResults) {
      const existing = progress.get(item.sourceItemId);
      progress.set(
        item.sourceItemId,
        entry({
          itemId: item.sourceItemId,
          correctCount:
            (existing?.correctCount ?? 0) + Number(item.outcome === "correct"),
          incorrectCount:
            (existing?.incorrectCount ?? 0) +
            Number(item.outcome === "incorrect"),
          lastPracticedAt: new Date(
            Math.max(
              Date.parse(existing?.lastPracticedAt ?? record.occurredAt),
              Date.parse(record.occurredAt),
            ),
          ).toISOString(),
        }),
      );
    }
  }
  return Object.freeze(
    [...progress.values()].sort((a, b) => (a.itemId < b.itemId ? -1 : 1)),
  );
}

function entry(input: ItemProgressBaseline): ItemProgress {
  const completedCount = input.correctCount + input.incorrectCount;
  if (!Number.isSafeInteger(completedCount))
    throw new Error("Progress counts exceed safe integer limits.");
  return Object.freeze({
    ...input,
    completedCount,
    lastPracticedAt: new Date(input.lastPracticedAt).toISOString(),
  });
}
