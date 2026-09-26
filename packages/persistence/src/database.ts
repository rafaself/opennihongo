const DATABASE_NAME = "opennihongo";
const DATABASE_VERSION = 1;

export const KANA_PROGRESS_STORE = "kanaProgress";

export function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Local progress storage is unavailable."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    let blocked = false;

    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(KANA_PROGRESS_STORE)) {
        request.result.createObjectStore(KANA_PROGRESS_STORE, {
          keyPath: "itemId",
        });
      }
    };
    request.onsuccess = () => {
      const database = request.result;
      if (blocked) {
        database.close();
        return;
      }

      database.onversionchange = () => {
        database.close();
      };
      resolve(database);
    };
    request.onerror = () => {
      reject(
        request.error ?? new Error("Could not open local progress storage."),
      );
    };
    request.onblocked = () => {
      blocked = true;
      reject(new Error("Local progress storage is blocked by another tab."));
    };
  });
}
