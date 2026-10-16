import { expect, test } from "@playwright/test";

test("serves the production app, images, and playable pronunciation from the Pages path", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./");
  await expect(
    page.getByRole("heading", {
      name: "A little Japanese. A little every day.",
    }),
  ).toBeVisible();
  const brand = page.locator(".app-sidebar__brand img");
  await expect(brand).toHaveAttribute("src", "/opennihongo/kitsune.svg");
  await expect
    .poll(() => brand.evaluate((image: HTMLImageElement) => image.naturalWidth))
    .toBeGreaterThan(0);

  await page.getByRole("link", { name: "Kana", exact: true }).click();
  const audioResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/opennihongo/assets/kana.chart.hiragana.a.") &&
      response.url().endsWith(".opus"),
  );
  await page
    .getByRole("button", { name: "Play pronunciation for あ, a", exact: true })
    .click();
  const response = await audioResponse;
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("audio/");
  const audioUrl = response.url();
  const playback = await page.evaluate(async (source) => {
    const audio = new Audio(source);
    await audio.play();
    const started = !audio.paused && audio.readyState >= 2;
    audio.pause();
    return started;
  }, audioUrl);
  expect(playback).toBe(true);
  expect(errors).toEqual([]);
});

test("refreshes shared routes and query parameters and preserves accessible section links", async ({
  page,
}) => {
  await page.goto("./#/kanji/kanji.character.u4e00");
  await expect(
    page.getByRole("heading", { name: "一 · one", level: 1 }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "一 · one", level: 1 }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Practice this character" }).click();
  const selectedPractice = new URL(page.url()).hash;
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  expect(new URL(page.url()).hash).toBe(`${selectedPractice}#app-main`);
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "一 (one)" })).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "二 (two)" }),
  ).not.toBeChecked();
  expect(new URL(page.url()).pathname).toBe("/opennihongo/");

  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("link", { name: "Japanese", exact: true }).click();
  await expect(page).toHaveURL(/\/opennihongo\/#\/settings#japanese$/);
  await expect(page.getByRole("switch", { name: "Show romaji" })).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Settings", level: 1 }),
  ).toBeVisible();
});
