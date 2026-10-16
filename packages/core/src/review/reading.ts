import { createLearningRecord } from "../progress/record";
import type { LearningRecord } from "../progress/types";

export type ReadingReviewItem = Readonly<{
  itemId: string;
  reason: "incorrect" | "skipped" | "assisted" | "historical-incorrect";
  lastPracticedAt: string;
}>;

/** Latest authored reading evidence, oldest first. This is not a due-date or mastery model. */
export function selectReadingReview(
  inputs: readonly LearningRecord[],
  options: Readonly<{ profileId: string; eligibleItemIds: readonly string[] }>,
): readonly ReadingReviewItem[] {
  const eligible = new Set(options.eligibleItemIds);
  const identities = new Map<string, string>();
  const latest = new Map<
    string,
    { record: LearningRecord; reason: ReadingReviewItem["reason"] | null }
  >();
  for (const input of inputs) {
    const record = createLearningRecord(input);
    const payload = JSON.stringify(record);
    const seen = identities.get(record.id);
    if (seen !== undefined) {
      if (seen !== payload)
        throw new Error("Conflicting learning record identity.");
      continue;
    }
    identities.set(record.id, payload);
    if (
      record.profileId !== options.profileId ||
      (record.evidence && record.evidence.exerciseType !== "typed-answer")
    )
      continue;
    for (const result of record.result.sourceItemResults) {
      if (!eligible.has(result.sourceItemId)) continue;
      const previous = latest.get(result.sourceItemId);
      if (
        previous &&
        (previous.record.occurredAt > record.occurredAt ||
          (previous.record.occurredAt === record.occurredAt &&
            previous.record.id > record.id))
      )
        continue;
      const evidence = record.evidence?.items.find(
        (item) => item.sourceItemId === result.sourceItemId,
      );
      const reason =
        result.outcome === "incorrect"
          ? !evidence
            ? "historical-incorrect"
            : evidence.response === "skipped"
              ? "skipped"
              : "incorrect"
          : evidence && evidence.assistance !== "none"
            ? "assisted"
            : null;
      latest.set(result.sourceItemId, { record, reason });
    }
  }
  return Object.freeze(
    [...latest]
      .flatMap(([itemId, { record, reason }]) =>
        reason
          ? [
              Object.freeze({
                itemId,
                reason,
                lastPracticedAt: record.occurredAt,
              }),
            ]
          : [],
      )
      .sort(
        (a, b) =>
          a.lastPracticedAt.localeCompare(b.lastPracticedAt) ||
          a.itemId.localeCompare(b.itemId),
      ),
  );
}
