import type { LearningRecord } from "@opennihongo/core";
import { openDatabase } from "../src/database";

export const resultRecord: LearningRecord = {
  id: "record-1",
  sessionId: "session-1",
  profileId: "profile-1",
  occurredAt: "2026-10-03T12:00:00.000Z",
  result: {
    exerciseId: "exercise-1",
    attempts: 3,
    outcome: "partially-correct",
    sourceItemResults: [
      { sourceItemId: "kana.hiragana.a", outcome: "correct" },
      { sourceItemId: "word.cat", outcome: "incorrect" },
    ],
  },
};

export function clearDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase("opennihongo");
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Database request failed"));
    };
  });
}

export async function seedLegacy(rows: readonly unknown[]) {
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("opennihongo", 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("kanaProgress", { keyPath: "itemId" });
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("Database request failed"));
    };
  });
  await new Promise<void>((resolve, reject) => {
    const tx = database.transaction("kanaProgress", "readwrite");
    rows.forEach((row) => tx.objectStore("kanaProgress").put(row));
    tx.oncomplete = () => {
      resolve();
    };
    tx.onabort = () => {
      reject(tx.error ?? new Error("Database transaction failed"));
    };
  });
  database.close();
}

export async function putRaw(store: string, value: unknown) {
  const db = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      tx.objectStore(store).put(value);
      tx.oncomplete = () => {
        resolve();
      };
      tx.onabort = () => {
        reject(tx.error ?? new Error("Database transaction failed"));
      };
    });
  } finally {
    db.close();
  }
}
