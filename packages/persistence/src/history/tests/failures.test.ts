import { beforeEach, expect, it, vi } from "vitest";
import { appendLearningRecord, loadLearningHistory } from "../../index";
import { resultRecord } from "../../../tests/historyFixture";

const { openDatabase } = vi.hoisted(() => ({
  openDatabase: vi.fn<() => Promise<IDBDatabase>>(),
}));
vi.mock("../../database", () => ({ openDatabase }));

function abortedDatabase(error: DOMException | null) {
  const request = {} as IDBRequest<unknown>;
  const store = {
    get: () => request,
    getAll: () => request,
  } as unknown as IDBObjectStore;
  const tx = { error, objectStore: () => store } as unknown as IDBTransaction;
  const close = vi.fn();
  const database = {
    close,
    transaction: () => {
      queueMicrotask(() => {
        tx.onabort?.call(tx, new Event("abort"));
      });
      return tx;
    },
  } as unknown as IDBDatabase;
  openDatabase.mockResolvedValue(database);
  return close;
}
beforeEach(() => openDatabase.mockReset());
it.each(["read", "write"])(
  "preserves %s transaction errors and closes the connection",
  async (mode) => {
    const close = abortedDatabase(new DOMException("transaction failed"));
    await expect(
      mode === "read"
        ? loadLearningHistory()
        : appendLearningRecord(resultRecord),
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
        ? loadLearningHistory()
        : appendLearningRecord(resultRecord),
    ).rejects.toThrow(mode === "read" ? "Could not read" : "Could not save");
    expect(close).toHaveBeenCalledOnce();
  },
);
