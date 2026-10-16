import { expect, test, type Page } from "@playwright/test";
import { beginnerKanji } from "@opennihongo/content";
import { history } from "./e2e/history";

async function answerCurrent(page: Page) {
  const input = page.getByRole("textbox");
  const label = await input.getAttribute("aria-label");
  const item = beginnerKanji.find(
    ({ example }) =>
      label === `Type the Kana or romaji reading for ${example.text}`,
  );
  if (!item) throw new Error("Expected authored Kanji word");
  await input.fill(item.example.reading);
  await input.press("Enter");
}
export function readingReviewJourney(pages: boolean) {
  for (const mobile of [false, true])
    test(`reading review survives reload and clears only independent correct items (${mobile ? "mobile" : "desktop"})`, async ({
      page,
    }) => {
      if (mobile) {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.emulateMedia({ reducedMotion: "reduce" });
      }
      await page.goto(pages ? "./#/practice" : "/practice");
      await page
        .getByRole("link", { name: "Start Kanji word reading", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Show hint", exact: true })
        .click();
      await page.getByRole("button", { name: /Play pronunciation/ }).click();
      await page.getByRole("textbox").fill("wrong");
      await page.getByRole("textbox").press("Enter");
      await expect(page.getByText(/Reading to remember/)).toBeVisible();
      await expect(
        page.getByText(/Keep this whole-word reading/),
      ).toBeInViewport({ ratio: 1 });
      await expect(
        page.getByRole("button", { name: "Continue", exact: true }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: "Skip", exact: true }).click();
      await page
        .getByRole("button", { name: "Show hint", exact: true })
        .click();
      await answerCurrent(page);
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await answerCurrent(page);
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await answerCurrent(page);
      await page
        .getByRole("button", { name: "See results", exact: true })
        .click();
      const results = page.getByRole("region", {
        name: "Your reading results",
      });
      await expect(
        results.getByText("Incorrect · hint and audio requested", {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        results.getByText("Skipped · no help requested", { exact: true }),
      ).toBeVisible();
      await expect(
        results.getByText("Correct · hint requested", { exact: true }),
      ).toBeVisible();
      await expect
        .poll(async () => (await history(page)).records.length)
        .toBe(5);
      await page
        .getByRole("link", { name: "Review saved readings", exact: true })
        .click();
      const boxes = page.getByRole("checkbox");
      await expect(boxes).toHaveCount(3);
      await boxes.nth(1).uncheck();
      await boxes.nth(2).uncheck();
      await page.reload();
      await expect(boxes.nth(0)).toBeChecked();
      await expect(boxes.nth(1)).not.toBeChecked();
      await expect(boxes.nth(2)).not.toBeChecked();
      await page
        .getByRole("button", {
          name: "Practise selected Kanji (1)",
          exact: true,
        })
        .click();
      await expect(page.getByText("1/1", { exact: true })).toBeVisible();
      await answerCurrent(page);
      await page
        .getByRole("button", { name: "See results", exact: true })
        .click();
      await page
        .getByRole("link", { name: "Review saved readings", exact: true })
        .click();
      await expect(boxes).toHaveCount(2);
      await expect(
        page.getByText("Latest reading was incorrect", { exact: true }),
      ).toHaveCount(0);
      const width = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      expect(width.scroll).toBeLessThanOrEqual(width.viewport);
    });
}
