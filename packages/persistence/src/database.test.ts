import { afterEach, describe, expect, it, vi } from "vitest";
import { KANA_PROGRESS_STORE, openDatabase } from "./database";

type EventHandler = ((this: IDBOpenDBRequest, event: Event) => unknown) | null;

type OpenRequest = {
  result: IDBDatabase;
  error: DOMException | null;
  onblocked: EventHandler;
  onerror: EventHandler;
  onupgradeneeded: EventHandler;
  onsuccess: EventHandler;
};

function createDatabase(containsStore = false) {
  const createObjectStore = vi.fn();
  const close = vi.fn();

  return {
    database: {
      objectStoreNames: { contains: vi.fn(() => containsStore) },
      createObjectStore,
      close,
    } as unknown as IDBDatabase,
    createObjectStore,
    close,
  };
}

function createOpenRequest(database: IDBDatabase): OpenRequest {
  return {
    result: database,
    error: null,
    onblocked: null,
    onerror: null,
    onupgradeneeded: null,
    onsuccess: null,
  };
}

function dispatch(
  handler: EventHandler,
  request: OpenRequest,
  eventName: string,
): void {
  handler?.call(request as unknown as IDBOpenDBRequest, new Event(eventName));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("openDatabase", () => {
  it("creates the progress store during the first upgrade and closes on version change", async () => {
    const { database, createObjectStore, close } = createDatabase();
    const request = createOpenRequest(database);
    vi.stubGlobal("indexedDB", { open: vi.fn(() => request) });

    const opening = openDatabase();
    dispatch(request.onupgradeneeded, request, "upgradeneeded");
    dispatch(request.onsuccess, request, "success");

    await expect(opening).resolves.toBe(database);
    expect(createObjectStore).toHaveBeenCalledWith(KANA_PROGRESS_STORE, {
      keyPath: "itemId",
    });
    database.onversionchange?.(
      new Event("versionchange") as IDBVersionChangeEvent,
    );
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("keeps an existing progress store during an upgrade", async () => {
    const { database, createObjectStore } = createDatabase(true);
    const request = createOpenRequest(database);
    vi.stubGlobal("indexedDB", { open: vi.fn(() => request) });

    const opening = openDatabase();
    dispatch(request.onupgradeneeded, request, "upgradeneeded");
    dispatch(request.onsuccess, request, "success");

    await expect(opening).resolves.toBe(database);
    expect(createObjectStore).not.toHaveBeenCalled();
  });

  it("rejects a blocked upgrade and closes a late successful connection", async () => {
    const { database, close } = createDatabase();
    const request = createOpenRequest(database);
    vi.stubGlobal("indexedDB", { open: vi.fn(() => request) });

    const opening = openDatabase();
    dispatch(request.onblocked, request, "blocked");
    dispatch(request.onsuccess, request, "success");

    await expect(opening).rejects.toThrow(
      "Local progress storage is blocked by another tab.",
    );
    expect(close).toHaveBeenCalledTimes(1);
  });

  it.each([
    [new DOMException("open failed"), "open failed"],
    [null, "Could not open local progress storage."],
  ])("reports open request failure", async (error, expectedMessage) => {
    const { database } = createDatabase();
    const request = createOpenRequest(database);
    request.error = error;
    vi.stubGlobal("indexedDB", { open: vi.fn(() => request) });

    const opening = openDatabase();
    dispatch(request.onerror, request, "error");

    await expect(opening).rejects.toThrow(expectedMessage);
  });
});
