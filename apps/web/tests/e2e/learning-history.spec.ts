import { expect, test, type Page } from "@playwright/test";
import type { ItemProgressBaseline, LearningRecord } from "@opennihongo/core";

async function seedV1(page: Page, lastAnsweredAt = "2026-09-26T00:00:00.000Z") {
  await page.goto("/");
  await page.evaluate(async (timestamp) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
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
    try {
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("kanaProgress", "readwrite");
        tx.objectStore("kanaProgress").put({
          itemId: "kana.hiragana.a",
          correctCount: 3,
          incorrectCount: 2,
          lastAnsweredAt: timestamp,
        });
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
  }, lastAnsweredAt);
}

async function history(page: Page) {
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

test("migrates vowel totals and preserves correct/incorrect records across reload and a new run", async ({
  page,
}) => {
  await seedV1(page);
  await page.goto("/practice/kana/vowels");
  await expect(page.getByText(/1 practiced on this device/)).toBeVisible();
  await page.getByRole("textbox", { name: "Romaji answer" }).fill("a");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByText("That’s right!")).toBeVisible();
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .press("Enter");
  await page.getByRole("textbox").fill("wrong");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByText("The answer is i.")).toBeVisible();
  const saved = await history(page);
  expect(saved.records).toHaveLength(2);
  expect(saved.records.map(({ result }) => result.outcome).sort()).toEqual([
    "correct",
    "incorrect",
  ]);
  expect(saved.baselines).toEqual([
    {
      itemId: "kana.hiragana.a",
      correctCount: 3,
      incorrectCount: 2,
      lastPracticedAt: "2026-09-26T00:00:00.000Z",
    },
  ]);
  expect(saved.stores).not.toContain("kanaProgress");
  await page.reload();
  await expect(page.getByText(/2 practiced on this device/)).toBeVisible();
  await page.getByRole("textbox").fill("a");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByText("That’s right!")).toBeVisible();
  const reloaded = await history(page);
  expect(reloaded.records).toHaveLength(3);
  expect(new Set(reloaded.records.map(({ id }) => id)).size).toBe(3);
  expect(new Set(reloaded.records.map(({ sessionId }) => sessionId)).size).toBe(
    2,
  );
});

test("records remembered and skipped vocabulary cards through the same history store", async ({
  page,
}) => {
  await page.goto("/practice/words/cards");
  await page
    .getByRole("button", { name: "Reveal answer", exact: true })
    .click();
  await page.getByRole("button", { name: /Got it/ }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect.poll(async () => (await history(page)).records.length).toBe(2);
  const saved = await history(page);
  expect(
    saved.records.every(({ profileId }) => profileId === "practice.cards"),
  ).toBe(true);
  expect(
    saved.records.every(({ result }) =>
      result.sourceItemResults.every(({ sourceItemId }) =>
        sourceItemId.startsWith("kana.word."),
      ),
    ),
  ).toBe(true);
  expect(saved.records.map(({ result }) => result.attempts).sort()).toEqual([
    0, 1,
  ]);
  expect(saved.records.map(({ result }) => result.outcome).sort()).toEqual([
    "correct",
    "incorrect",
  ]);
});

test("an invalid legacy row aborts migration while the learner can continue", async ({
  page,
}) => {
  await seedV1(page, "invalid");
  await page.goto("/practice/kana/vowels");
  await expect(page.getByText(/Progress could not be loaded/)).toBeVisible();
  await page.getByRole("textbox").fill("a");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByText(/Your answer could not be saved/)).toBeVisible();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page.getByText("い", { exact: true })).toBeVisible();
  const schema = await page.evaluate(
    () =>
      new Promise<{ version: number; stores: string[] }>((resolve) => {
        const request = indexedDB.open("opennihongo", 1);
        request.onsuccess = () => {
          resolve({
            version: request.result.version,
            stores: [...request.result.objectStoreNames],
          });
          request.result.close();
        };
      }),
  );
  expect(schema).toEqual({ version: 1, stores: ["kanaProgress"] });
});
