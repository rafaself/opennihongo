import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { clearDatabase, resultRecord } from "../../../tests/historyFixture";
import { openDatabase } from "../../database";
import { loadLearningHistory, loadWritingHistoryProgress } from "../../index";
import { upgradeHistory } from "../../history/upgrade";
import { storedRecord } from "../../history/schema";

beforeEach(clearDatabase);

describe("writing history database upgrade", () => {
  it("adds reading storage to a fresh database", async () => {
    expect(await loadWritingHistoryProgress()).toEqual({
      lastChapterId: null,
      completedChapterIds: [],
    });
    const database = await openDatabase();
    expect(database.version).toBe(3);
    expect([...database.objectStoreNames]).toEqual([
      "itemProgressBaselines",
      "learningRecords",
      "writingHistoryProgress",
    ]);
    database.close();
  });

  it("preserves v2 exercise records and baselines without recreating their stores", async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("opennihongo", 2);
      request.onupgradeneeded = () => {
        const transaction = request.transaction;
        if (!transaction) throw new Error("Missing upgrade transaction");
        upgradeHistory(request.result, transaction, reject);
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error("Could not open database"));
      };
    });
    const baseline = {
      itemId: "kana.hiragana.a",
      correctCount: 2,
      incorrectCount: 1,
      lastPracticedAt: "2026-10-03T00:00:00.000Z",
    };
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        ["learningRecords", "itemProgressBaselines"],
        "readwrite",
      );
      transaction
        .objectStore("learningRecords")
        .put(storedRecord(resultRecord));
      transaction
        .objectStore("itemProgressBaselines")
        .put({ schemaVersion: 1, origin: "kana-progress-v1", baseline });
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onabort = () => {
        reject(transaction.error ?? new Error("Transaction aborted"));
      };
    });
    database.close();
    await loadWritingHistoryProgress();
    expect(await loadLearningHistory()).toEqual({
      records: [resultRecord],
      baselines: [baseline],
    });
  });
});
