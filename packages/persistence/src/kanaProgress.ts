import {
  hiraganaVowels,
  recordKanaAnswer,
  type KanaId,
  type KanaItem,
  type KanaProgress,
} from "@opennihongo/core";
import { KANA_PROGRESS_STORE, openDatabase } from "./database";

function isKanaId(value: unknown): value is KanaId {
  return hiraganaVowels.some(({ id }) => id === value);
}

function readProgress(value: unknown): KanaProgress {
  if (typeof value !== "object" || value === null) {
    throw new Error("Saved kana progress is invalid.");
  }

  const record = value as Record<string, unknown>;
  const itemId = record["itemId"];
  const correctCount = record["correctCount"];
  const incorrectCount = record["incorrectCount"];
  const lastAnsweredAt = record["lastAnsweredAt"];
  if (
    !isKanaId(itemId) ||
    typeof correctCount !== "number" ||
    !Number.isSafeInteger(correctCount) ||
    correctCount < 0 ||
    typeof incorrectCount !== "number" ||
    !Number.isSafeInteger(incorrectCount) ||
    incorrectCount < 0 ||
    typeof lastAnsweredAt !== "string"
  ) {
    throw new Error("Saved kana progress is invalid.");
  }

  return { itemId, correctCount, incorrectCount, lastAnsweredAt };
}

/** Reads committed progress from this device's IndexedDB database. */
export async function loadKanaProgress(): Promise<KanaProgress[]> {
  const database = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(KANA_PROGRESS_STORE, "readonly");
      const request = transaction.objectStore(KANA_PROGRESS_STORE).getAll();
      let progress: KanaProgress[] = [];
      let failure: unknown;

      request.onsuccess = () => {
        try {
          progress = request.result.map(readProgress);
        } catch (error) {
          failure = error;
          transaction.abort();
        }
      };
      transaction.oncomplete = () => {
        resolve(progress);
      };
      transaction.onabort = () => {
        const reason =
          failure instanceof Error
            ? failure
            : (transaction.error ??
              new Error("Could not read local kana progress."));
        reject(reason);
      };
    });
  } finally {
    database.close();
  }
}

/** Records one outcome atomically, preserving updates from other open tabs. */
export async function saveKanaAnswer(
  item: KanaItem,
  correct: boolean,
  answeredAt: string,
): Promise<KanaProgress> {
  const database = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(
        KANA_PROGRESS_STORE,
        "readwrite",
      );
      const store = transaction.objectStore(KANA_PROGRESS_STORE);
      const request = store.get(item.id);
      let saved: KanaProgress | undefined;
      let failure: unknown;

      request.onsuccess = () => {
        try {
          const existing =
            request.result === undefined
              ? undefined
              : readProgress(request.result);
          saved = recordKanaAnswer(existing, item, correct, answeredAt);
          store.put(saved);
        } catch (error) {
          failure = error;
          transaction.abort();
        }
      };
      transaction.oncomplete = () => {
        if (saved) {
          resolve(saved);
        } else {
          reject(new Error("The kana answer was not saved."));
        }
      };
      transaction.onabort = () => {
        const reason =
          failure instanceof Error
            ? failure
            : (transaction.error ??
              new Error("Could not save the kana answer."));
        reject(reason);
      };
    });
  } finally {
    database.close();
  }
}
