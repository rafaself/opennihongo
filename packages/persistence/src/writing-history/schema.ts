export const WRITING_HISTORY_STORE = "writingHistoryProgress";
export const WRITING_HISTORY_KEY = "writing-history";

export type WritingHistoryProgress = Readonly<{
  lastChapterId: string | null;
  completedChapterIds: readonly string[];
}>;
export const emptyWritingHistoryProgress: WritingHistoryProgress =
  Object.freeze({
    lastChapterId: null,
    completedChapterIds: Object.freeze([]),
  });

export function isChapterId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/** IDs are opaque here; the application resolves them against the current catalog. */
export function readWritingHistoryProgress(
  value: unknown,
): WritingHistoryProgress {
  if (value === undefined) return emptyWritingHistoryProgress;
  const fail = () => {
    throw new Error("Invalid writing history progress schema.");
  };
  if (typeof value !== "object" || value === null) return fail();
  const envelope = value as Record<string, unknown>;
  if (envelope["schemaVersion"] !== 1) return fail();
  const candidate = envelope["progress"];
  if (typeof candidate !== "object" || candidate === null) return fail();
  const progress = candidate as Record<string, unknown>;
  const lastChapterId = progress["lastChapterId"];
  const completed: unknown = progress["completedChapterIds"];
  if (
    (lastChapterId !== null && !isChapterId(lastChapterId)) ||
    !Array.isArray(completed) ||
    !completed.every(isChapterId) ||
    new Set(completed).size !== completed.length
  )
    return fail();
  return Object.freeze({
    lastChapterId,
    completedChapterIds: Object.freeze([...completed] as string[]),
  });
}
