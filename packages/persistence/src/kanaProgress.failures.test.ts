import { beforeEach, describe, expect, it, vi } from "vitest";
import { hiraganaVowels } from "@opennihongo/core";
import { loadKanaProgress, saveKanaAnswer } from "./kanaProgress";

const { openDatabase } = vi.hoisted(() => ({
  openDatabase: vi.fn(),
}));

vi.mock("./database", () => ({
  KANA_PROGRESS_STORE: "kanaProgress",
  openDatabase,
}));

type Completion = "abort" | "complete";

function createDatabase(completion: Completion, error: DOMException | null) {
  const request = {
    result: [],
    onsuccess: null,
  } as unknown as IDBRequest<unknown[]>;
  const store = {
    get: vi.fn(() => request),
    getAll: vi.fn(() => request),
  } as unknown as IDBObjectStore;
  const transaction = {
    error,
    onabort: null,
    oncomplete: null,
    objectStore: vi.fn(() => store),
  } as unknown as IDBTransaction;
  const close = vi.fn();
  const database = {
    close,
    transaction: vi.fn(() => {
      queueMicrotask(() => {
        const handler =
          completion === "abort" ? transaction.onabort : transaction.oncomplete;
        handler?.call(transaction, new Event(completion));
      });
      return transaction;
    }),
  } as unknown as IDBDatabase;

  openDatabase.mockResolvedValue(database);
  return { database, close };
}

beforeEach(() => {
  openDatabase.mockReset();
});

describe("kana repository transaction failures", () => {
  it("preserves IndexedDB read transaction errors", async () => {
    const error = new DOMException("read transaction failed");
    const { close } = createDatabase("abort", error);

    await expect(loadKanaProgress()).rejects.toThrow(error);
    expect(close).toHaveBeenCalledOnce();
  });

  it("provides a fallback when a read transaction aborts without an error", async () => {
    const { close } = createDatabase("abort", null);

    await expect(loadKanaProgress()).rejects.toThrow(
      "Could not read local kana progress.",
    );
    expect(close).toHaveBeenCalledOnce();
  });

  it("preserves IndexedDB write transaction errors", async () => {
    const error = new DOMException("write transaction failed");
    const { close } = createDatabase("abort", error);

    await expect(
      saveKanaAnswer(hiraganaVowels[0], true, "2026-09-26T00:00:00.000Z"),
    ).rejects.toThrow(error);
    expect(close).toHaveBeenCalledOnce();
  });

  it("provides a fallback when a write transaction aborts without an error", async () => {
    const { close } = createDatabase("abort", null);

    await expect(
      saveKanaAnswer(hiraganaVowels[0], true, "2026-09-26T00:00:00.000Z"),
    ).rejects.toThrow("Could not save the kana answer.");
    expect(close).toHaveBeenCalledOnce();
  });

  it("reports when a completed write transaction has no saved answer", async () => {
    const { close } = createDatabase("complete", null);

    await expect(
      saveKanaAnswer(hiraganaVowels[0], true, "2026-09-26T00:00:00.000Z"),
    ).rejects.toThrow("The kana answer was not saved.");
    expect(close).toHaveBeenCalledOnce();
  });
});
