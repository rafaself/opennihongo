import {
  assertItemProgressBaseline,
  assertLearningRecord,
  createLearningRecord,
  type ItemProgressBaseline,
  type LearningRecord,
} from "@opennihongo/core";

export const RECORDS_STORE = "learningRecords";
export const BASELINES_STORE = "itemProgressBaselines";
export const BASELINE_ORIGIN = "kana-progress-v1";

function envelope(value: unknown): Record<string, unknown> {
  if (
    typeof value !== "object" ||
    value === null ||
    (value as Record<string, unknown>)["schemaVersion"] !== 1
  ) {
    throw new Error(
      "Saved learning history has an invalid or unsupported schema.",
    );
  }
  return value as Record<string, unknown>;
}

export function readRecord(value: unknown): LearningRecord {
  const stored = envelope(value);
  assertLearningRecord(stored["record"]);
  const record = createLearningRecord(stored["record"]);
  if (
    JSON.stringify(stored["sourceItemIds"]) !==
    JSON.stringify(
      record.result.sourceItemResults.map(({ sourceItemId }) => sourceItemId),
    )
  ) {
    throw new Error("Saved learning record item index is invalid.");
  }
  return record;
}

export function readBaseline(value: unknown): ItemProgressBaseline {
  const stored = envelope(value);
  if (stored["origin"] !== BASELINE_ORIGIN)
    throw new Error("Saved progress baseline origin is invalid.");
  assertItemProgressBaseline(stored["baseline"]);
  const baseline = stored["baseline"];
  return Object.freeze({
    itemId: baseline.itemId,
    correctCount: baseline.correctCount,
    incorrectCount: baseline.incorrectCount,
    lastPracticedAt: baseline.lastPracticedAt,
  });
}

export function storedRecord(record: LearningRecord) {
  return {
    schemaVersion: 1,
    record,
    sourceItemIds: record.result.sourceItemResults.map(
      ({ sourceItemId }) => sourceItemId,
    ),
  };
}
