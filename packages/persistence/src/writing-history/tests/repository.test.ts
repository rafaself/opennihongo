import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDatabase } from "../../../tests/historyFixture";
import { openDatabase } from "../../database";
import {
  completeWritingHistoryChapter,
  loadWritingHistoryProgress,
  saveWritingHistoryPosition,
} from "../../index";

beforeEach(clearDatabase);
afterEach(() => vi.unstubAllGlobals());

describe("writing history progress", () => {
  it("remembers position without completing a chapter", async () => {
    expect(await loadWritingHistoryProgress()).toEqual({
      lastChapterId: null,
      completedChapterIds: [],
    });
    await saveWritingHistoryPosition("manyogana");
    expect(await loadWritingHistoryProgress()).toEqual({
      lastChapterId: "manyogana",
      completedChapterIds: [],
    });
  });

  it("unions concurrent completions and makes retries idempotent", async () => {
    await Promise.all([
      completeWritingHistoryChapter("hiragana"),
      completeWritingHistoryChapter("katakana"),
    ]);
    await completeWritingHistoryChapter("hiragana");
    await saveWritingHistoryPosition("variation");
    const progress = await loadWritingHistoryProgress();
    expect(progress.lastChapterId).toBe("variation");
    expect([...progress.completedChapterIds].sort()).toEqual([
      "hiragana",
      "katakana",
    ]);
    expect(Object.isFrozen(progress.completedChapterIds)).toBe(true);
  });

  it("rejects invalid chapter IDs", async () => {
    await expect(saveWritingHistoryPosition(" ")).rejects.toThrow(
      "Invalid chapter ID",
    );
    await expect(completeWritingHistoryChapter("")).rejects.toThrow(
      "Invalid chapter ID",
    );
  });

  it.each([
    null,
    { schemaVersion: 99, progress: {} },
    { schemaVersion: 1, progress: null },
    { schemaVersion: 1 },
    {
      schemaVersion: 1,
      progress: { lastChapterId: null, completedChapterIds: "hiragana" },
    },
    {
      schemaVersion: 1,
      progress: { lastChapterId: 42, completedChapterIds: [] },
    },
    {
      schemaVersion: 1,
      progress: { lastChapterId: null, completedChapterIds: ["a", "a"] },
    },
    {
      schemaVersion: 1,
      progress: { lastChapterId: null, completedChapterIds: [""] },
    },
  ])("preserves and reports malformed saved progress", async (value) => {
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(
        "writingHistoryProgress",
        "readwrite",
      );
      transaction
        .objectStore("writingHistoryProgress")
        .put(value, "writing-history");
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onabort = () => {
        reject(transaction.error ?? new Error("Transaction aborted"));
      };
    });
    database.close();
    await expect(loadWritingHistoryProgress()).rejects.toThrow(
      "Invalid writing history progress",
    );
    await expect(completeWritingHistoryChapter("hiragana")).rejects.toThrow(
      "Invalid writing history progress",
    );
  });

  it("reports unavailable storage", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(loadWritingHistoryProgress()).rejects.toThrow(
      "storage is unavailable",
    );
    await expect(saveWritingHistoryPosition("hiragana")).rejects.toThrow(
      "storage is unavailable",
    );
  });
});
