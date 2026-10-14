import { expect, test } from "@playwright/test";
import { history } from "./history";

type PlaybackState = typeof window & {
  kanjiPlaybackCount: number;
  kanjiAudios: HTMLAudioElement[];
};

const one = "kanji.character.u4e00";
const two = "kanji.character.u4e8c";
const url = (game: string, options: Record<string, unknown>) =>
  `/practice/kanji/${game}?kanji=${encodeURIComponent(JSON.stringify(options))}`;

test("records a contextual reading, plays recorded audio, and preserves evidence after reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const state = window as PlaybackState;
    state.kanjiPlaybackCount = 0;
    state.kanjiAudios = [];
    const OriginalAudio = window.Audio;
    window.Audio = class extends OriginalAudio {
      constructor(src?: string) {
        super(src);
        state.kanjiAudios.push(this);
        this.addEventListener("playing", () => {
          state.kanjiPlaybackCount += 1;
        });
      }
    };
  });
  await page.goto(url("reading", { ids: [one], difficulty: "easy" }));
  const input = page.getByRole("textbox", {
    name: "Type the Kana or romaji reading for 一つ",
  });
  await expect(input).toBeVisible();
  await page
    .getByRole("button", { name: "Play pronunciation for 一つ" })
    .click();
  await expect
    .poll(() =>
      page.evaluate(() => (window as PlaybackState).kanjiPlaybackCount),
    )
    .toBeGreaterThan(0);
  await page.getByRole("link", { name: "Leave practice" }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as PlaybackState).kanjiAudios.every(
          (audio) => audio.paused && !audio.hasAttribute("src"),
        ),
      ),
    )
    .toBe(true);
  await page.getByRole("link", { name: "Set up Kanji reading" }).click();
  await page.getByRole("button", { name: "Start Kanji reading" }).click();
  await input.fill("ヒトツ");
  await input.press("Enter");
  await expect(page.getByText("Your reading is correct.")).toBeVisible();
  await expect.poll(async () => (await history(page)).records.length).toBe(1);
  await page.getByRole("button", { name: "See results" }).click();
  await expect(page.getByText("1 / 1")).toBeVisible();
  await page.reload();
  const saved = await history(page);
  expect(saved.records).toHaveLength(1);
  expect(saved.records[0]?.result.sourceItemResults).toEqual([
    { sourceItemId: one, outcome: "correct" },
  ]);
  expect(saved.records[0]?.profileId).toBe("kanji.practice.reading");
  await page.getByRole("link", { name: "Leave practice" }).click();
  await page.getByRole("link", { name: "Set up Kanji reading" }).click();
  await expect(page.getByRole("checkbox", { name: "一 (one)" })).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "二 (two)" }),
  ).not.toBeChecked();
});

test("completes meaning matching and a reading quiz", async ({ page }) => {
  await page.goto(url("matching", { ids: [one, two], difficulty: "easy" }));
  const meanings = page.getByRole("group", { name: "English meanings" });
  const characters = page.getByRole("group", { name: "Kanji characters" });
  await meanings.getByRole("button", { name: "one", exact: true }).click();
  await characters.getByRole("button", { name: "一", exact: true }).click();
  await meanings.getByRole("button", { name: "two", exact: true }).click();
  await characters.getByRole("button", { name: "二", exact: true }).click();
  await page.getByRole("button", { name: "Check answer" }).click();
  await page.getByRole("button", { name: "See results" }).click();
  await expect(page.getByText("2 / 2")).toBeVisible();
  await page.goto(
    url("quiz", { ids: [one, two], focus: "readings", difficulty: "hard" }),
  );
  for (let index = 0; index < 2; index++) {
    await expect(
      page.getByRole("heading", { name: "Choose the word reading" }),
    ).toBeVisible();
    const word = await page
      .locator(".kana-quiz__prompt .practice-session__prompt-kana")
      .innerText();
    await page
      .getByRole("button", {
        name: word === "一つ" ? "ひとつ" : "ふたつ",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Check answer" }).click();
    await expect(page.getByText("Your answer is correct.")).toBeVisible();
    await page
      .getByRole("button", { name: index === 0 ? "Continue" : "See results" })
      .click();
  }
  await expect(page.getByText("2 / 2")).toBeVisible();
  await expect.poll(async () => (await history(page)).records.length).toBe(3);
});

test("saves card recall and skips with reduced motion and no mobile overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url("cards/setup", { ids: [one, two], difficulty: "hard" }));
  await expect(
    page.getByRole("heading", { name: "Set up Kanji cards" }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.getByRole("button", { name: "Start Kanji cards" }).click();
  await page.getByRole("button", { name: "Reveal answer" }).click();
  await expect(page.getByText(/On:/)).toBeVisible();
  await page.getByRole("button", { name: /Got it/ }).click();
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Practice complete!" }),
  ).toBeVisible();
  await expect.poll(async () => (await history(page)).records.length).toBe(2);
  const saved = await history(page);
  expect(saved.records.map(({ result }) => result.attempts).sort()).toEqual([
    0, 1,
  ]);
  expect(
    saved.records.every(({ result }) =>
      result.sourceItemResults.every(({ sourceItemId }) =>
        [one, two].includes(sourceItemId),
      ),
    ),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
});
