import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { deriveItemProgress } from "@opennihongo/core";
import { appendLearningRecord, loadLearningHistory } from "../../index";
import { openDatabase } from "../../database";
import {
  clearDatabase,
  resultRecord,
  seedLegacy,
  putRaw,
} from "../../../tests/historyFixture";

beforeEach(clearDatabase);

describe("v1 Kana totals migration", () => {
  const rows = ["a", "i", "u", "e", "o"].map((kana, index) => ({
    itemId: `kana.hiragana.${kana}`,
    correctCount: index + 1,
    incorrectCount: index,
    lastAnsweredAt: "2026-09-26T00:00:00.000Z",
  }));
  it("imports all totals once without fabricating history and removes the old store", async () => {
    await seedLegacy(rows);
    const history = await loadLearningHistory();
    expect(history.records).toEqual([]);
    expect(history.baselines).toEqual(
      [...rows]
        .sort((a, b) => a.itemId.localeCompare(b.itemId))
        .map(({ lastAnsweredAt, ...row }) => ({
          ...row,
          lastPracticedAt: lastAnsweredAt,
        })),
    );
    expect(await loadLearningHistory()).toEqual(history);
    const db = await openDatabase();
    expect(db.version).toBe(2);
    expect(db.objectStoreNames.contains("kanaProgress")).toBe(false);
    db.close();
    await appendLearningRecord(resultRecord);
    const updated = await loadLearningHistory({ itemId: "kana.hiragana.a" });
    expect(
      deriveItemProgress(updated.records, updated.baselines).find(
        ({ itemId }) => itemId === "kana.hiragana.a",
      ),
    ).toMatchObject({ correctCount: 2, incorrectCount: 0 });
    expect(
      (await loadLearningHistory({ sessionId: "session-1" })).baselines,
    ).toEqual([]);
  });
  it("aborts the entire upgrade and preserves v1 rows when a legacy row is invalid", async () => {
    await seedLegacy([rows[0], { ...rows[1], lastAnsweredAt: "bad" }]);
    await expect(loadLearningHistory()).rejects.toThrow(
      "Invalid item progress baseline",
    );
    const db = await new Promise<IDBDatabase>((resolve) => {
      const request = indexedDB.open("opennihongo", 1);
      request.onsuccess = () => {
        resolve(request.result);
      };
    });
    expect(db.version).toBe(1);
    expect(db.objectStoreNames.contains("kanaProgress")).toBe(true);
    expect(db.objectStoreNames.contains("learningRecords")).toBe(false);
    db.close();
  });
  it("migrates an empty legacy database", async () => {
    await seedLegacy([]);
    expect(await loadLearningHistory()).toEqual({ records: [], baselines: [] });
  });
  it("rejects corrupted baseline storage", async () => {
    await putRaw("itemProgressBaselines", {
      schemaVersion: 1,
      baseline: { itemId: "item" },
      origin: "kana-progress-v1",
    });
    await expect(loadLearningHistory()).rejects.toThrow();
  });
});
