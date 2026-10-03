import { assertItemProgressBaseline } from "@opennihongo/core";
import { BASELINE_ORIGIN, BASELINES_STORE, RECORDS_STORE } from "./schema";

/** A committed database version is the atomic migration-completion marker. */
export function upgradeHistory(
  database: IDBDatabase,
  transaction: IDBTransaction,
  fail: (error: unknown) => void,
) {
  const records = database.createObjectStore(RECORDS_STORE, {
    keyPath: "record.id",
  });
  records.createIndex("sessionId", "record.sessionId");
  records.createIndex("itemId", "sourceItemIds", { multiEntry: true });
  const baselines = database.createObjectStore(BASELINES_STORE, {
    keyPath: "baseline.itemId",
  });
  if (!database.objectStoreNames.contains("kanaProgress")) return;

  const cursor = transaction.objectStore("kanaProgress").openCursor();
  cursor.onsuccess = () => {
    try {
      const current = cursor.result;
      if (current === null) {
        database.deleteObjectStore("kanaProgress");
        return;
      }
      const value: unknown = current.value;
      if (typeof value !== "object" || value === null)
        throw new Error("Invalid legacy Kana progress.");
      const row = value as Record<string, unknown>;
      const baseline = {
        itemId: row["itemId"],
        correctCount: row["correctCount"],
        incorrectCount: row["incorrectCount"],
        lastPracticedAt: row["lastAnsweredAt"],
      };
      assertItemProgressBaseline(baseline);
      baselines.add({ schemaVersion: 1, baseline, origin: BASELINE_ORIGIN });
      current.continue();
    } catch (error) {
      fail(error);
    }
  };
}
