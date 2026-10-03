import {
  createLearningRecord,
  type ExerciseSessionId,
  type ItemProgressBaseline,
  type LearningItemId,
  type LearningRecord,
} from "@opennihongo/core";
import { openDatabase } from "../database";
import {
  BASELINES_STORE,
  RECORDS_STORE,
  readBaseline,
  readRecord,
  storedRecord,
} from "./schema";

export type LearningHistory = Readonly<{
  records: readonly LearningRecord[];
  baselines: readonly ItemProgressBaseline[];
}>;
export type LearningHistoryQuery =
  | Readonly<{ itemId: LearningItemId }>
  | Readonly<{ sessionId: ExerciseSessionId }>;

/** Append one immutable completion atomically; retries never duplicate evidence. */
export async function appendLearningRecord(
  input: LearningRecord,
): Promise<void> {
  const record = createLearningRecord(input);
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(RECORDS_STORE, "readwrite");
      const store = tx.objectStore(RECORDS_STORE);
      const request = store.get(record.id);
      let failure: unknown;
      request.onsuccess = () => {
        try {
          if (request.result === undefined) store.add(storedRecord(record));
          else if (
            JSON.stringify(readRecord(request.result)) !==
            JSON.stringify(record)
          )
            throw new Error("Conflicting learning record identity.");
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
      tx.oncomplete = () => {
        resolve();
      };
      tx.onabort = () => {
        reject(
          failure instanceof Error
            ? failure
            : (tx.error ?? new Error("Could not save local learning history.")),
        );
      };
    });
  } finally {
    db.close();
  }
}

/** Return evidence, never calculated progress. Item queries retain complete multi-item results. */
export async function loadLearningHistory(
  query?: LearningHistoryQuery,
): Promise<LearningHistory> {
  const db = await openDatabase();
  try {
    return await new Promise<LearningHistory>((resolve, reject) => {
      const tx = db.transaction([RECORDS_STORE, BASELINES_STORE], "readonly");
      const store = tx.objectStore(RECORDS_STORE);
      const request =
        query === undefined
          ? store.getAll()
          : "itemId" in query
            ? store.index("itemId").getAll(query.itemId)
            : store.index("sessionId").getAll(query.sessionId);
      let records: readonly LearningRecord[] = [];
      let baselines: readonly ItemProgressBaseline[] = [];
      let failure: unknown;
      const fail = (error: unknown) => {
        failure = error;
        tx.abort();
      };
      request.onsuccess = () => {
        try {
          records = (request.result as unknown[]).map(readRecord);
        } catch (error) {
          fail(error);
        }
      };
      if (query === undefined || "itemId" in query) {
        const baselineRequest = tx
          .objectStore(BASELINES_STORE)
          .getAll(query?.itemId);
        baselineRequest.onsuccess = () => {
          try {
            baselines = (baselineRequest.result as unknown[]).map(readBaseline);
          } catch (error) {
            fail(error);
          }
        };
      }
      tx.oncomplete = () => {
        resolve({ records, baselines });
      };
      tx.onabort = () => {
        reject(
          failure instanceof Error
            ? failure
            : (tx.error ?? new Error("Could not read local learning history.")),
        );
      };
    });
  } finally {
    db.close();
  }
}
