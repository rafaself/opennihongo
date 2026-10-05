import { beforeEach, expect, it, vi } from "vitest";
import {
  completeWritingHistoryChapter,
  loadWritingHistoryProgress,
} from "../../index";

const { openDatabase } = vi.hoisted(() => ({
  openDatabase: vi.fn<() => Promise<IDBDatabase>>(),
}));
vi.mock("../../database", () => ({ openDatabase }));

function abortedDatabase(error: DOMException | null) {
  const request = {} as IDBRequest<unknown>;
  const store = { get: () => request } as unknown as IDBObjectStore;
  const transaction = {
    error,
    objectStore: () => store,
  } as unknown as IDBTransaction;
  const close = vi.fn();
  const database = {
    close,
    transaction: () => {
      queueMicrotask(() => {
        transaction.onabort?.call(transaction, new Event("abort"));
      });
      return transaction;
    },
  } as unknown as IDBDatabase;
  openDatabase.mockResolvedValue(database);
  return close;
}

beforeEach(() => {
  openDatabase.mockReset();
});
it.each(["read", "write"])(
  "preserves %s transaction errors and closes storage",
  async (mode) => {
    const close = abortedDatabase(new DOMException("transaction failed"));
    await expect(
      mode === "read"
        ? loadWritingHistoryProgress()
        : completeWritingHistoryChapter("hiragana"),
    ).rejects.toThrow("transaction failed");
    expect(close).toHaveBeenCalledOnce();
  },
);
it.each(["read", "write"])(
  "reports an aborted %s without a browser error",
  async (mode) => {
    const close = abortedDatabase(null);
    await expect(
      mode === "read"
        ? loadWritingHistoryProgress()
        : completeWritingHistoryChapter("hiragana"),
    ).rejects.toThrow("Could not access writing history progress");
    expect(close).toHaveBeenCalledOnce();
  },
);
