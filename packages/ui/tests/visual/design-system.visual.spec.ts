import { expect, test, type Page } from "@playwright/test";

const storyIds = {
  primaryButton: "components-button--primary",
  openPopover: "components-popover--open",
  achievementUnlocked: "patterns-achievement-unlocked--default",
} as const;

async function openStory(page: Page, storyId: string): Promise<void> {
  await page.goto(`/iframe.html?id=${storyId}&viewMode=story`);
  await page.locator("#storybook-root").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready.then(() => true));
}

test("captures the core red and neutral theme in light and dark", async ({
  page,
}) => {
  await openStory(page, storyIds.primaryButton);
  await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();

  for (const theme of ["light", "dark"] as const) {
    await page.locator("html").evaluate((element, value) => {
      element.setAttribute("data-theme", value);
    }, theme);
    await expect(page).toHaveScreenshot(`button-primary-${theme}.png`);
  }
});

test("captures the tactile pressed Button state", async ({ page }) => {
  await openStory(page, storyIds.primaryButton);
  const button = page.getByRole("button", { name: "Continue" });
  await expect(button).toBeVisible();
  await button.hover();
  await page.mouse.down();
  await expect
    .poll(() => button.evaluate((element) => element.matches(":active")))
    .toBe(true);

  await expect(page).toHaveScreenshot("button-primary-pressed.png");
  await page.mouse.up();
});

test("captures an open Popover overlay", async ({ page }) => {
  await openStory(page, storyIds.openPopover);
  await expect(
    page.getByText("Use this reference when reviewing the kana reading."),
  ).toBeVisible();

  await expect(page).toHaveScreenshot("popover-open.png");
});

test("captures the Achievement Unlocked gamification pattern", async ({
  page,
}) => {
  await openStory(page, storyIds.achievementUnlocked);
  await expect(page.getByText("Kana explorer")).toBeVisible();

  await expect(page).toHaveScreenshot("achievement-unlocked.png");
});
