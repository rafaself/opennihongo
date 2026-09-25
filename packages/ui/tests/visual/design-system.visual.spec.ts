import { expect, test, type Page } from "@playwright/test";

const storyIds = {
  primaryButton: "components-button--primary",
  secondaryButton: "components-button--secondary",
  openPopover: "components-popover--open",
  reducedMotionPopover: "components-popover--reduced-motion",
  reducedMotionTooltip: "components-tooltip--reduced-motion",
  selectedSelect: "components-select--selected",
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
  const button = page.getByRole("button", { name: "Continue" });
  await expect(button).toBeVisible();
  await expect
    .poll(() =>
      button.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          height: style.height,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform,
          boxShadow: style.boxShadow,
        };
      }),
    )
    .toMatchObject({
      height: "50px",
      fontSize: "15px",
      fontWeight: "700",
      letterSpacing: "0.8px",
      textTransform: "uppercase",
    });
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).boxShadow))
    .toContain("0px 4px 0px");

  for (const theme of ["light", "dark"] as const) {
    await page.locator("html").evaluate((element, value) => {
      element.setAttribute("data-theme", value);
    }, theme);
    await expect(page).toHaveScreenshot(`button-primary-${theme}.png`);
  }
});

test("captures the tactile pressed Button state", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openStory(page, storyIds.primaryButton);
  const button = page.getByRole("button", { name: "Continue" });
  await expect(button).toBeVisible();
  await button.hover();
  await page.mouse.down();
  await expect
    .poll(() => button.evaluate((element) => element.matches(":active")))
    .toBe(true);
  await expect
    .poll(() =>
      button.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          pressOffset: new DOMMatrixReadOnly(style.transform).m42,
          boxShadow: style.boxShadow,
        };
      }),
    )
    .toEqual({ pressOffset: 4, boxShadow: "none" });

  await expect(page).toHaveScreenshot("button-primary-pressed.png");
  await page.mouse.up();
});

test("removes Button press travel when reduced motion is active", async ({
  page,
}) => {
  await openStory(page, storyIds.primaryButton);
  const button = page.getByRole("button", { name: "Continue" });
  await button.hover();
  await page.mouse.down();

  await expect
    .poll(() =>
      button.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          active: element.matches(":active"),
          pressOffset: new DOMMatrixReadOnly(style.transform).m42,
          boxShadow: style.boxShadow,
        };
      }),
    )
    .toEqual({ active: true, pressOffset: 0, boxShadow: "none" });

  await page.mouse.up();
});

test("captures the elevated secondary Button state", async ({ page }) => {
  await openStory(page, storyIds.secondaryButton);
  const button = page.getByRole("button", { name: "Continue" });
  await expect(button).toBeVisible();
  await expect
    .poll(() =>
      button.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          height: style.height,
          fontWeight: style.fontWeight,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform,
          borderWidth: style.borderTopWidth,
          boxShadow: style.boxShadow,
        };
      }),
    )
    .toMatchObject({
      height: "50px",
      fontWeight: "700",
      letterSpacing: "0.8px",
      textTransform: "uppercase",
      borderWidth: "2px",
    });
  await expect
    .poll(() => button.evaluate((element) => getComputedStyle(element).boxShadow))
    .toContain("0px 2px 0px");

  await expect(page).toHaveScreenshot("button-secondary.png");

  await page.locator("html").evaluate((element) => {
    element.setAttribute("data-theme", "dark");
  });
  await expect(page).toHaveScreenshot("button-secondary-dark.png");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await button.hover();
  await page.mouse.down();
  await expect
    .poll(() =>
      button.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          pressOffset: new DOMMatrixReadOnly(style.transform).m42,
          boxShadow: style.boxShadow,
        };
      }),
    )
    .toEqual({ pressOffset: 2, boxShadow: "none" });
  await page.mouse.up();
});

test("captures an open Popover overlay", async ({ page }) => {
  await openStory(page, storyIds.openPopover);
  await expect(
    page.getByText("Use this reference when reviewing the kana reading."),
  ).toBeVisible();

  await expect(page).toHaveScreenshot("popover-open.png");
});

test("applies reduced motion to portaled Popover content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openStory(page, storyIds.reducedMotionPopover);
  const content = page.locator(".ns-popover__content");

  await expect(content).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect
    .poll(() => content.evaluate((element) => getComputedStyle(element).animationName))
    .toBe("none");
});

test("applies reduced motion to portaled Tooltip content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openStory(page, storyIds.reducedMotionTooltip);
  const trigger = page.getByRole("button", { name: "Save lesson" });
  await trigger.focus();
  const content = page.locator(".ns-tooltip__content");

  await expect(content).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect
    .poll(() => content.evaluate((element) => getComputedStyle(element).animationName))
    .toBe("none");
});

test("locks document scrolling while Select is open and restores it on close", async ({
  page,
}) => {
  await openStory(page, storyIds.selectedSelect);
  const body = page.locator("body");
  const previousScrollLock = await body.getAttribute("data-scroll-locked");
  const trigger = page.getByRole("combobox", { name: "Writing system" });

  await trigger.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect
    .poll(() => body.getAttribute("data-scroll-locked"))
    .not.toBe(previousScrollLock);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect
    .poll(() => body.getAttribute("data-scroll-locked"))
    .toBe(previousScrollLock);
});

test("captures the Achievement Unlocked gamification pattern", async ({
  page,
}) => {
  await openStory(page, storyIds.achievementUnlocked);
  await expect(page.getByText("Kana explorer")).toBeVisible();

  await expect(page).toHaveScreenshot("achievement-unlocked.png");
});
