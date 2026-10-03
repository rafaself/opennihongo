import "fake-indexeddb/auto";
import { hiraganaVowels } from "@opennihongo/content";
import { recordKanaItemResult, type KanaProgress } from "@opennihongo/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadKanaProgress, updateKanaProgress } from "./kanaProgress";

function clearDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("opennihongo");
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Database deletion failed."));
    };
    request.onblocked = () => {
      reject(new Error("Database deletion was blocked."));
    };
  });
}

async function storeRawProgress(progress: Record<string, unknown>) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("opennihongo", 1);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Database opening failed."));
    };
  });

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction("kanaProgress", "readwrite");
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("Progress record write failed."));
    };
    transaction.objectStore("kanaProgress").put(progress);
  });
  database.close();
}

beforeEach(async () => {
  vi.unstubAllGlobals();
  await clearDatabase();
});

describe("kana progress repository", () => {
  it("rejects a mismatched updater identity without changing stored progress", async () => {
    const record: KanaProgress = {
      itemId: "kana.hiragana.i",
      correctCount: 1,
      incorrectCount: 0,
      lastAnsweredAt: "2026-10-03T00:00:00.000Z",
    };
    await expect(
      updateKanaProgress("kana.hiragana.a", () => record),
    ).rejects.toThrow(/identity/i);
    expect(await loadKanaProgress()).toEqual([]);
  });

  it("rejects an invalid updater record before committing it", async () => {
    await expect(
      updateKanaProgress("kana.hiragana.a", () => ({
        itemId: "kana.hiragana.a",
        correctCount: -1,
        incorrectCount: 0,
        lastAnsweredAt: "2026-10-03T00:00:00.000Z",
      })),
    ).rejects.toThrow("Saved kana progress is invalid.");
    expect(await loadKanaProgress()).toEqual([]);
  });
  it("starts empty and persists an answered item", async () => {
    expect(await loadKanaProgress()).toEqual([]);

    const saved = await updateKanaProgress(hiraganaVowels[0].id, (existing) =>
      recordKanaItemResult(
        existing,
        { sourceItemId: hiraganaVowels[0].id, outcome: "correct" },
        "2026-09-26T00:00:00.000Z",
      ),
    );

    expect(saved).toEqual({
      itemId: "kana.hiragana.a",
      correctCount: 1,
      incorrectCount: 0,
      lastAnsweredAt: "2026-09-26T00:00:00.000Z",
    });
    expect(await loadKanaProgress()).toEqual([saved]);
  });

  it("updates counts without losing another item's progress", async () => {
    await updateKanaProgress(hiraganaVowels[0].id, (existing) =>
      recordKanaItemResult(
        existing,
        { sourceItemId: hiraganaVowels[0].id, outcome: "incorrect" },
        "2026-09-26T00:00:00.000Z",
      ),
    );
    await updateKanaProgress(hiraganaVowels[1].id, (existing) =>
      recordKanaItemResult(
        existing,
        { sourceItemId: hiraganaVowels[1].id, outcome: "correct" },
        "2026-09-26T00:00:01.000Z",
      ),
    );
    const updated = await updateKanaProgress(hiraganaVowels[0].id, (existing) =>
      recordKanaItemResult(
        existing,
        { sourceItemId: hiraganaVowels[0].id, outcome: "correct" },
        "2026-09-26T00:00:02.000Z",
      ),
    );

    expect(updated).toMatchObject({
      correctCount: 1,
      incorrectCount: 1,
      lastAnsweredAt: "2026-09-26T00:00:02.000Z",
    });
    expect(await loadKanaProgress()).toEqual([
      updated,
      {
        itemId: "kana.hiragana.i",
        correctCount: 1,
        incorrectCount: 0,
        lastAnsweredAt: "2026-09-26T00:00:01.000Z",
      },
    ]);
  });

  it("keeps both outcomes when the same item is answered concurrently", async () => {
    await Promise.all([
      updateKanaProgress(hiraganaVowels[0].id, (existing) =>
        recordKanaItemResult(
          existing,
          { sourceItemId: hiraganaVowels[0].id, outcome: "correct" },
          "2026-09-26T00:00:00.000Z",
        ),
      ),
      updateKanaProgress(hiraganaVowels[0].id, (existing) =>
        recordKanaItemResult(
          existing,
          { sourceItemId: hiraganaVowels[0].id, outcome: "incorrect" },
          "2026-09-26T00:00:01.000Z",
        ),
      ),
    ]);

    expect(await loadKanaProgress()).toEqual([
      {
        itemId: "kana.hiragana.a",
        correctCount: 1,
        incorrectCount: 1,
        lastAnsweredAt: "2026-09-26T00:00:01.000Z",
      },
    ]);
  });

  it("reports unavailable browser storage", async () => {
    vi.stubGlobal("indexedDB", undefined);

    await expect(loadKanaProgress()).rejects.toThrow(
      "Local progress storage is unavailable.",
    );
  });

  it("rejects invalid persisted records while loading progress", async () => {
    await loadKanaProgress();
    await storeRawProgress({
      itemId: "kana.hiragana.unrecognized",
      correctCount: 0,
      incorrectCount: 0,
      lastAnsweredAt: "2026-09-26T00:00:00.000Z",
    });

    await expect(loadKanaProgress()).rejects.toThrow(
      "Saved kana progress is invalid.",
    );
  });

  it("does not overwrite invalid persisted progress when saving", async () => {
    await loadKanaProgress();
    await storeRawProgress({
      itemId: "kana.hiragana.a",
      correctCount: -1,
      incorrectCount: 0,
      lastAnsweredAt: "2026-09-26T00:00:00.000Z",
    });

    await expect(
      updateKanaProgress(hiraganaVowels[0].id, (existing) =>
        recordKanaItemResult(
          existing,
          { sourceItemId: hiraganaVowels[0].id, outcome: "correct" },
          "2026-09-26T00:00:01.000Z",
        ),
      ),
    ).rejects.toThrow("Saved kana progress is invalid.");
  });
});
