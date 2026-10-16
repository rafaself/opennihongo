import type { ExerciseResult } from "../exercises/result";
import type { ItemProgressBaseline, LearningRecord } from "./types";
import { isPracticeEvidence } from "./evidence";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function isId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
function isTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}
function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}
function isResult(value: unknown): value is ExerciseResult {
  if (
    !isObject(value) ||
    !isId(value["exerciseId"]) ||
    !isCount(value["attempts"])
  )
    return false;
  const items = value["sourceItemResults"];
  if (!Array.isArray(items) || items.length === 0) return false;
  const seen = new Set<string>();
  let correct = 0;
  for (const item of items as unknown[]) {
    if (
      !isObject(item) ||
      !isId(item["sourceItemId"]) ||
      (item["outcome"] !== "correct" && item["outcome"] !== "incorrect") ||
      seen.has(item["sourceItemId"])
    )
      return false;
    seen.add(item["sourceItemId"]);
    if (item["outcome"] === "correct") correct += 1;
  }
  const outcome =
    correct === items.length
      ? "correct"
      : correct === 0
        ? "incorrect"
        : "partially-correct";
  return value["outcome"] === outcome;
}

export function assertLearningRecord(
  value: unknown,
): asserts value is LearningRecord {
  if (
    !isObject(value) ||
    !isId(value["id"]) ||
    !isId(value["sessionId"]) ||
    !isId(value["profileId"]) ||
    !isTimestamp(value["occurredAt"]) ||
    !isResult(value["result"]) ||
    (value["evidence"] !== undefined &&
      !isPracticeEvidence(value["evidence"], value["result"]))
  ) {
    throw new Error("Invalid learning record.");
  }
}

export function assertItemProgressBaseline(
  value: unknown,
): asserts value is ItemProgressBaseline {
  if (
    !isObject(value) ||
    !isId(value["itemId"]) ||
    !isCount(value["correctCount"]) ||
    !isCount(value["incorrectCount"]) ||
    !Number.isSafeInteger(value["correctCount"] + value["incorrectCount"]) ||
    !isTimestamp(value["lastPracticedAt"])
  ) {
    throw new Error("Invalid item progress baseline.");
  }
}
