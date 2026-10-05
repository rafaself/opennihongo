import { upgradeHistory } from "./history/upgrade";
import { WRITING_HISTORY_STORE } from "./writing-history/schema";
const DATABASE_NAME = "opennihongo";
const DATABASE_VERSION = 3;

export function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Local progress storage is unavailable."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    let blocked = false;
    let upgradeError: unknown;

    request.onupgradeneeded = (event) => {
      const transaction = request.transaction;
      if (transaction === null) {
        reject(new Error("Local storage upgrade transaction is unavailable."));
        return;
      }
      if (event.oldVersion < 2) {
        upgradeHistory(request.result, transaction, (error) => {
          upgradeError = error;
          transaction.abort();
        });
      }
      if (event.oldVersion < 3)
        request.result.createObjectStore(WRITING_HISTORY_STORE);
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
        upgradeError instanceof Error
          ? upgradeError
          : (request.error ??
              new Error("Could not open local progress storage.")),
      );
    };
    request.onblocked = () => {
      blocked = true;
      reject(new Error("Local progress storage is blocked by another tab."));
    };
  });
}
