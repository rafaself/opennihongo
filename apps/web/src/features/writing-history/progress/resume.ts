import { writingHistoryChapters } from "@opennihongo/content";
import type { WritingHistoryProgress } from "@opennihongo/persistence";

export function getKnownHistoryCompletions(
  progress: WritingHistoryProgress,
): readonly string[] {
  return writingHistoryChapters
    .filter(({ id }) => progress.completedChapterIds.includes(id))
    .map(({ id }) => id);
}
export function getHistoryResumeChapter(progress: WritingHistoryProgress) {
  const first = writingHistoryChapters[0];
  if (!first) throw new Error("Writing history requires at least one chapter.");
  const index = writingHistoryChapters.findIndex(
    ({ id }) => id === progress.lastChapterId,
  );
  const last = writingHistoryChapters[index];
  if (last && !progress.completedChapterIds.includes(last.id)) return last;
  const ordered = [
    ...writingHistoryChapters.slice(index + 1),
    ...writingHistoryChapters.slice(0, index + 1),
  ];
  return (
    ordered.find(({ id }) => !progress.completedChapterIds.includes(id)) ??
    first
  );
}
