import type { Page } from "@playwright/test";
import type { ItemProgressBaseline, LearningRecord } from "@opennihongo/core";

export async function history(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("opennihongo");
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error("Database request failed"));
      };
    });
    try {
      return await new Promise<{
        records: LearningRecord[];
        baselines: ItemProgressBaseline[];
        stores: string[];
      }>((resolve, reject) => {
        const tx = db.transaction(
          ["learningRecords", "itemProgressBaselines"],
          "readonly",
        );
        const recordsRequest = tx
          .objectStore("learningRecords")
          .getAll() as IDBRequest<{ record: LearningRecord }[]>;
        const baselinesRequest = tx
          .objectStore("itemProgressBaselines")
          .getAll() as IDBRequest<{ baseline: ItemProgressBaseline }[]>;
        tx.oncomplete = () => {
          resolve({
            records: recordsRequest.result.map(({ record }) => record),
            baselines: baselinesRequest.result.map(({ baseline }) => baseline),
            stores: [...db.objectStoreNames],
          });
        };
        tx.onabort = () => {
          reject(tx.error ?? new Error("Database transaction failed"));
        };
      });
    } finally {
      db.close();
    }
  });
}
