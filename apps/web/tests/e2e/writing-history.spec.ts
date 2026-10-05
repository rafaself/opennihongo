import { expect, test } from "@playwright/test";

test("reads the nine-chapter track, resumes after reload, and starts learning characters", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore writing history" }).click();
  await expect(page.getByText("0 of 9 chapters read")).toBeVisible();
  await page.getByRole("link", { name: "Start reading" }).click();
  await expect(
    page.getByRole("heading", { name: "Japanese before writing", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mark as read and continue" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Adopting Chinese characters",
      level: 1,
    }),
  ).toBeVisible();
  await expect(page.getByText("Saving reading progress…")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Adopting Chinese characters",
      level: 1,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "All chapters" }).click();
  await expect(page.getByText("1 of 9 chapters read")).toBeVisible();
  await page.getByRole("link", { name: "Continue reading" }).click();
  for (let chapter = 2; chapter < 9; chapter++) {
    await expect(
      page.getByText(new RegExp(`Chapter ${String(chapter)} of 9`)),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Mark as read and continue" })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "Modern Japanese writing", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Mark as read", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "All 9 chapters read" }),
  ).toBeVisible();
  await expect(page.getByText("Saving reading progress…")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Chapter read", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Explore the Kana chart" }).click();
  await expect(
    page.getByRole("heading", { name: "Kana characters" }),
  ).toBeVisible();
  await page.goto("/writing-history");
  await expect(page.getByText("9 of 9 chapters read")).toBeVisible();
  await page.getByRole("link", { name: "Revisit history" }).click();
  await expect(
    page.getByRole("heading", { name: "Japanese before writing", level: 1 }),
  ).toBeVisible();
  await page.goto("/writing-history/modern-writing");
  await page
    .getByRole("link", { name: "Start the first-vowels lesson" })
    .click();
  await page.getByRole("textbox", { name: "Romaji answer" }).fill("a");
  await page.getByRole("textbox").press("Enter");
  await expect(page.getByText("That’s right!")).toBeVisible();
  await page.reload();
  await expect(page.getByText(/1 practiced on this device/)).toBeVisible();
});

test("switches eight hiragana origins with gentle motion and a reduced-motion option", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/writing-history/hiragana");
  const choices = page.getByRole("radiogroup", { name: "Choose an example" });
  await expect(choices.getByRole("radio")).toHaveCount(8);
  await page.getByRole("radio", { name: "と /to/" }).click();
  const comparison = page.getByRole("group", { name: "Character comparison" });
  await expect(comparison.getByText("止", { exact: true })).toBeVisible();
  const transition = await comparison.evaluate((element) => {
    const effect = element.getAnimations()[0]?.effect;
    return {
      duration: effect?.getTiming().duration,
      opacity:
        effect instanceof KeyframeEffect
          ? effect.getKeyframes().map((frame) => frame["opacity"])
          : [],
    };
  });
  expect(transition.duration).toBeGreaterThan(0);
  expect(transition.opacity).toEqual(["0", "1"]);
  const bounds = await choices.boundingBox();
  const lastChoice = await page
    .getByRole("radio", { name: "と /to/" })
    .boundingBox();
  expect(bounds).not.toBeNull();
  expect(lastChoice).not.toBeNull();
  if (!bounds || !lastChoice) throw new Error("Missing character choices");
  expect(lastChoice.x + lastChoice.width).toBeLessThanOrEqual(
    bounds.x + bounds.width,
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("radio", { name: "う /u/" }).click();
  await expect(comparison.getByText("宇", { exact: true })).toBeVisible();
  await expect(comparison).toHaveCSS("animation-name", "none");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("supports mobile keyboard comparisons, historical glyphs, themes, and invalid links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/writing-history/katakana");
  await page.getByRole("radio", { name: "ア /a/" }).focus();
  await page.keyboard.down("ArrowRight");
  await expect(page.getByRole("radio", { name: "カ /ka/" })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await page.keyboard.up("ArrowRight");
  await expect(page.getByText(/left-hand portion/)).toBeVisible();
  await page.goto("/writing-history/variation");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() =>
      document.fonts.check('80px "NINJAL Hentaigana"', "𛀂"),
    ),
  ).toBe(true);
  await expect(page.locator(".history-hentaigana")).toHaveText("𛀂");
  await page.getByRole("radio", { name: "𛀃 /a/" }).click();
  await expect(page.locator(".history-hentaigana")).toHaveText("𛀃");
  await page.evaluate(() => {
    document.documentElement.dataset["theme"] = "dark";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/writing-history/multiple-scripts");
  await page.getByRole("radio", { name: "Katakana", exact: true }).click();
  await expect(page.getByLabel("Japanese example")).toHaveText(
    "私はコーヒーを飲みます。",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.goto("/writing-history/unknown");
  await expect(page.getByText("This page doesn't exist.")).toBeVisible();
});

test("upgrades a v2 database and preserves existing exercise evidence", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("opennihongo", 2);
      request.onupgradeneeded = () => {
        const records = request.result.createObjectStore("learningRecords", {
          keyPath: "record.id",
        });
        records.createIndex("sessionId", "record.sessionId");
        records.createIndex("itemId", "sourceItemIds", { multiEntry: true });
        request.result.createObjectStore("itemProgressBaselines", {
          keyPath: "baseline.itemId",
        });
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error ?? new Error("Could not open database"));
      };
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("learningRecords", "readwrite");
      transaction.objectStore("learningRecords").put({
        schemaVersion: 1,
        sourceItemIds: ["kana.hiragana.a"],
        record: {
          id: "saved-before-history",
          sessionId: "old-session",
          profileId: "kana.lesson.vowels",
          occurredAt: "2026-10-03T00:00:00.000Z",
          result: {
            exerciseId: "old-exercise",
            attempts: 1,
            outcome: "correct",
            sourceItemResults: [
              { sourceItemId: "kana.hiragana.a", outcome: "correct" },
            ],
          },
        },
      });
      transaction.oncomplete = () => {
        resolve();
      };
      transaction.onabort = () => {
        reject(transaction.error ?? new Error("Transaction aborted"));
      };
    });
    database.close();
  });
  await page.goto("/writing-history/before-writing");
  await page.getByRole("button", { name: "Mark as read and continue" }).click();
  await expect(page.getByText("Saving reading progress…")).toHaveCount(0);
  await page.goto("/practice/kana/vowels");
  await expect(page.getByText(/1 practiced on this device/)).toBeVisible();
});
