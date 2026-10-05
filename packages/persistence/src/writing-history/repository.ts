import { openDatabase } from "../database";
import {
  isChapterId,
  readWritingHistoryProgress,
  WRITING_HISTORY_KEY,
  WRITING_HISTORY_STORE,
  type WritingHistoryProgress,
} from "./schema";

async function transactionProgress(
  chapterId?: string,
  complete = false,
): Promise<WritingHistoryProgress> {
  if (chapterId !== undefined && !isChapterId(chapterId))
    throw new Error("Invalid chapter ID.");
  const database = await openDatabase();
  try {
    return await new Promise<WritingHistoryProgress>((resolve, reject) => {
      const transaction = database.transaction(
        WRITING_HISTORY_STORE,
        chapterId === undefined ? "readonly" : "readwrite",
      );
      const store = transaction.objectStore(WRITING_HISTORY_STORE);
      const request = store.get(WRITING_HISTORY_KEY);
      let progress: WritingHistoryProgress;
      let failure: unknown;
      request.onsuccess = () => {
        try {
          progress = readWritingHistoryProgress(request.result);
          if (chapterId !== undefined) {
            progress = Object.freeze({
              lastChapterId: chapterId,
              completedChapterIds: Object.freeze(
                complete
                  ? [...new Set([...progress.completedChapterIds, chapterId])]
                  : [...progress.completedChapterIds],
              ),
            });
            store.put({ schemaVersion: 1, progress }, WRITING_HISTORY_KEY);
          }
        } catch (error) {
          failure = error;
          transaction.abort();
        }
      };
      transaction.oncomplete = () => {
        resolve(progress);
      };
      transaction.onabort = () => {
        reject(
          failure instanceof Error
            ? failure
            : (transaction.error ??
                new Error("Could not access writing history progress.")),
        );
      };
    });
  } finally {
    database.close();
  }
}

export function loadWritingHistoryProgress(): Promise<WritingHistoryProgress> {
  return transactionProgress();
}
export function saveWritingHistoryPosition(
  chapterId: string,
): Promise<WritingHistoryProgress> {
  return transactionProgress(chapterId);
}
export function completeWritingHistoryChapter(
  chapterId: string,
): Promise<WritingHistoryProgress> {
  return transactionProgress(chapterId, true);
}
