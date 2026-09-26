import "fake-indexeddb/auto";
import { hiraganaVowels } from "@opennihongo/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadKanaProgress, saveKanaAnswer } from "./kanaProgress";

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
  it("starts empty and persists an answered item", async () => {
    expect(await loadKanaProgress()).toEqual([]);

    const saved = await saveKanaAnswer(
      hiraganaVowels[0],
      true,
      "2026-09-26T00:00:00.000Z",
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
    await saveKanaAnswer(hiraganaVowels[0], false, "2026-09-26T00:00:00.000Z");
    await saveKanaAnswer(hiraganaVowels[1], true, "2026-09-26T00:00:01.000Z");
    const updated = await saveKanaAnswer(
      hiraganaVowels[0],
      true,
      "2026-09-26T00:00:02.000Z",
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
      saveKanaAnswer(hiraganaVowels[0], true, "2026-09-26T00:00:00.000Z"),
      saveKanaAnswer(hiraganaVowels[0], false, "2026-09-26T00:00:01.000Z"),
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
      saveKanaAnswer(hiraganaVowels[0], true, "2026-09-26T00:00:01.000Z"),
    ).rejects.toThrow("Saved kana progress is invalid.");
  });
});
