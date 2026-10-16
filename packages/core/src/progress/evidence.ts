import type { ExerciseResult } from "../exercises/result";
import type { PracticeEvidence } from "./types";

export function isPracticeEvidence(
  value: unknown,
  result: ExerciseResult,
): value is PracticeEvidence {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  if (
    !["typed-answer", "matching", "multiple-choice", "flashcard"].includes(
      candidate["exerciseType"] as string,
    )
  )
    return false;
  const items = candidate["items"];
  if (!Array.isArray(items) || items.length !== result.sourceItemResults.length)
    return false;
  const seen = new Set<unknown>();
  for (const item of items as unknown[]) {
    if (typeof item !== "object" || item === null) return false;
    const entry = item as Record<string, unknown>;
    const source = result.sourceItemResults.find(
      (source) => source.sourceItemId === entry["sourceItemId"],
    );
    if (!source || seen.has(entry["sourceItemId"])) return false;
    seen.add(entry["sourceItemId"]);
    if (
      !["none", "hint", "audio", "hint-and-audio"].includes(
        entry["assistance"] as string,
      )
    )
      return false;
    if (entry["response"] === "skipped") {
      if (source.outcome !== "incorrect") return false;
    } else if (
      entry["response"] !==
      (candidate["exerciseType"] === "flashcard" ? "self-reported" : "answered")
    )
      return false;
  }
  return true;
}

export function snapshotEvidence(evidence: PracticeEvidence): PracticeEvidence {
  return Object.freeze({
    exerciseType: evidence.exerciseType,
    items: Object.freeze(
      evidence.items.map((item) =>
        Object.freeze({
          sourceItemId: item.sourceItemId,
          response: item.response,
          assistance: item.assistance,
        }),
      ),
    ),
  });
}
