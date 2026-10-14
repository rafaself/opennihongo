import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, expect, it } from "vitest";
import { beginnerKanji } from "@opennihongo/content";
import { router } from "../../../app/router";
import {
  defaultAppPreferences,
  saveAppPreferences,
} from "../../../app/preferences";

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

it("discovers Kanji theory from Home and keeps the section active on character pages", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/" });
  await user.click(await screen.findByRole("link", { name: "Explore Kanji" }));
  await screen.findByRole("heading", { name: "Kanji", level: 1 });
  for (const name of ["Numbers", "Nature", "People and basics"]) {
    expect(
      within(screen.getByRole("list", { name })).getAllByRole("link"),
    ).toHaveLength(10);
  }
  await user.click(screen.getByRole("link", { name: "一 · one" }));
  await screen.findByRole("heading", { name: "一 · one", level: 1 });
  expect(document.title).toBe("一 · one · OpenNihongo");
  expect(
    within(screen.getByRole("navigation", { name: "Primary navigation" }))
      .getByRole("link", { name: "Kanji" })
      .getAttribute("aria-current"),
  ).toBe("page");
  expect(screen.getByText("一つ", { selector: "span" })).toBeTruthy();
  expect(screen.getByText("ひとつ")).toBeTruthy();
  await user.click(screen.getByRole("link", { name: "Next: 二" }));
  await screen.findByRole("heading", { name: "二 · two", level: 1 });
  await user.click(screen.getByRole("link", { name: "Previous: 一" }));
  await screen.findByRole("heading", { name: "一 · one", level: 1 });
  await user.click(screen.getByRole("link", { name: "All Kanji" }));
  await screen.findByRole("heading", { name: "Kanji", level: 1 });
});

it.each(beginnerKanji)(
  "opens the public reference for $glyph with its common readings",
  async (character) => {
    render(<RouterProvider router={router} />);
    await router.navigate({
      to: "/kanji/$kanjiId",
      params: { kanjiId: character.id },
    });
    await screen.findByRole("heading", {
      name: `${character.glyph} · ${character.meaning}`,
      level: 1,
    });
    const readings = within(
      screen.getByRole("region", { name: "Common readings" }),
    );
    expect(readings.getByText(character.onReadings.join(" · "))).toBeTruthy();
    expect(readings.getByText(character.kunReadings.join(" · "))).toBeTruthy();
    expect(screen.getByRole("link", { name: "All Kanji" })).toBeTruthy();
  },
);

it("offers practice after the final character and recovers from an unknown ID", async () => {
  render(<RouterProvider router={router} />);
  await router.navigate({
    to: "/kanji/$kanjiId",
    params: { kanjiId: "kanji.character.u4e0b" },
  });
  await screen.findByRole("heading", { name: "下 · below; down", level: 1 });
  expect(
    screen
      .getByRole("link", { name: "Explore Kanji practice" })
      .getAttribute("href"),
  ).toBe("/practice");
  await router.navigate({
    to: "/kanji/$kanjiId",
    params: { kanjiId: "unknown" },
  });
  await screen.findByRole("heading", { name: "This page doesn't exist." });
  expect(document.title).toBe("Page not found · OpenNihongo");
});

it("shows the word reading with the learner's romaji preference and links to learning sources", async () => {
  const user = userEvent.setup();
  render(<RouterProvider router={router} />);
  await router.navigate({
    to: "/kanji/$kanjiId",
    params: { kanjiId: "kanji.character.u5341" },
  });
  await screen.findByRole("heading", { name: "十 · ten", level: 1 });
  expect(screen.getByText("とおか")).toBeTruthy();
  expect(screen.getByText("tooka")).toBeTruthy();
  await user.click(screen.getByText("Learning sources"));
  expect(
    screen
      .getByRole("link", { name: "Joyo Kanji reading table" })
      .getAttribute("href"),
  ).toContain("bunka.go.jp");
  expect(
    screen
      .getByRole("link", { name: "Practice this character" })
      .getAttribute("href"),
  ).toContain("kanji.character.u5341");
  saveAppPreferences({ ...defaultAppPreferences, showRomaji: false });
  await router.navigate({
    to: "/kanji/$kanjiId",
    params: { kanjiId: "kanji.character.u4e00" },
  });
  await screen.findByRole("heading", { name: "一 · one", level: 1 });
  expect(screen.queryByText("hitotsu")).toBeNull();
  expect(screen.getByText("ひとつ")).toBeTruthy();
});
