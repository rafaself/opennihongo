import { expect, test } from "@playwright/test";

test("explores theory, retries optional checks, and starts practice with the same character", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore Kanji", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Kanji", level: 1 }),
  ).toBeVisible();
  for (const name of ["Numbers", "Nature", "People and basics"]) {
    await expect(
      page.getByRole("list", { name, exact: true }).getByRole("link"),
    ).toHaveCount(10);
  }
  await page.getByRole("link", { name: "一 · one", exact: true }).click();
  const meaning = page.getByRole("region", {
    name: "Connect shape and meaning",
  });
  const reading = page.getByRole("region", { name: "Read the whole word" });
  await meaning.getByRole("button", { name: "two", exact: true }).click();
  await expect(meaning.getByRole("status")).toContainText("Try another answer");
  await meaning.getByRole("button", { name: "one", exact: true }).click();
  await expect(meaning.getByRole("status")).toContainText("That fits");
  await reading.getByRole("button", { name: "ひとつ", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(reading.getByRole("status")).toContainText(
    "一つ is read ひとつ",
  );
  await page.screenshot({
    path: testInfo.outputPath("kanji-theory-desktop.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "一 · one", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page.getByRole("link", { name: "Next: 二" }).click();
  await expect(
    page.getByRole("heading", { name: "二 · two", level: 1 }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Practice this character" }).click();
  await expect(
    page.getByRole("heading", { name: "Set up Kanji reading" }),
  ).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "二 (two)" })).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "一 (one)" }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Start Kanji reading" }).click();
  await expect(
    page.getByRole("textbox", {
      name: "Type the Kana or romaji reading for 二つ",
    }),
  ).toBeVisible();
});

test("supports small screens, dark theme, reduced motion, and hidden romaji", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.addInitScript(() => {
    localStorage.setItem(
      "opennihongo.preferences.v1",
      JSON.stringify({ theme: "dark", reduceMotion: true, showRomaji: false }),
    );
  });
  await page.goto("/kanji/kanji.character.u6708");
  await expect(
    page.getByRole("heading", { name: "月 · moon; month", level: 1 }),
  ).toBeVisible();
  const word = page.getByRole("region", { name: "A word to remember" });
  await expect(word.getByText("つき", { exact: true })).toBeVisible();
  await expect(word.getByText("tsuki", { exact: true })).toHaveCount(0);
  const reading = page.getByRole("region", { name: "Read the whole word" });
  await reading.getByRole("button", { name: "つき", exact: true }).click();
  await expect(reading.getByRole("status")).toContainText("That fits");
  await reading.getByRole("button", { name: "Try again" }).click();
  await expect(reading.getByRole("status")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({
    path: testInfo.outputPath("kanji-theory-mobile.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "All Kanji" }).click();
  await expect(
    page.getByRole("heading", { name: "Kanji", level: 1 }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.screenshot({
    path: testInfo.outputPath("kanji-theory-catalog.png"),
    fullPage: true,
  });
});
