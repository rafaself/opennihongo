import "../../../views/practice/tests/practiceTestHelpers";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { expect, it } from "vitest";
import { beginnerKanji } from "@opennihongo/content";
import { router } from "../../../app/router";

async function open(game = "reading", kanji: Record<string, unknown> = {}) {
  render(<RouterProvider router={router} />);
  await router.navigate({
    to: "/practice/kanji/$game/setup",
    params: { game },
    search: { scripts: ["katakana"], kanji },
  });
  await screen.findByRole("heading", { name: `Set up Kanji ${game}` });
}

it("offers all four Kanji games from the hub", async () => {
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice" });
  for (const game of ["reading", "matching", "quiz", "cards"])
    expect(
      screen
        .getByRole("link", { name: `Set up Kanji ${game}` })
        .getAttribute("href"),
    ).toContain(`/practice/kanji/${game}/setup`);
});

it("selects themes and individual characters while preserving URL configuration", async () => {
  const user = userEvent.setup();
  await open();
  expect(
    screen.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("checkbox", { name: "一 (one)" }));
  await user.click(screen.getByRole("checkbox", { name: "Nature" }));
  expect(router.state.location.search.kanji?.ids).toHaveLength(19);
  await user.click(screen.getByRole("checkbox", { name: "Nature" }));
  expect(router.state.location.search.kanji?.ids).toHaveLength(29);
  await user.click(screen.getByRole("radio", { name: "Easy" }));
  await user.click(screen.getByRole("radio", { name: "20 items" }));
  const search = router.state.location.search;
  expect(search.scripts).toEqual(["katakana"]);
  await user.click(screen.getByRole("button", { name: "Start Kanji reading" }));
  await screen.findByRole("heading", { name: "Read this word" });
  expect(
    screen.queryByRole("navigation", { name: "Primary navigation" }),
  ).toBeNull();
  await user.click(screen.getByRole("link", { name: "Leave practice" }));
  await user.click(screen.getByRole("link", { name: "Set up Kanji reading" }));
  expect(router.state.location.search).toEqual(search);
  expect(screen.getByRole("checkbox", { name: "一 (one)" })).toHaveProperty(
    "checked",
    false,
  );
});

it("blocks empty and single-answer games and explains reduced choices", async () => {
  const user = userEvent.setup();
  await open("quiz", {
    difficulty: "hard",
    length: 20,
    ids: beginnerKanji.slice(0, 3).map(({ id }) => id),
  });
  expect(screen.getByText("3 questions")).toBeTruthy();
  expect(screen.getByText("3 choices per question")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Clear all" }));
  expect(router.state.location.search.kanji?.ids).toEqual([]);
  expect(
    screen.getByRole("button", { name: "Start Kanji quiz" }),
  ).toHaveProperty("disabled", true);
  await user.click(screen.getByRole("checkbox", { name: "一 (one)" }));
  expect(screen.getByRole("alert").textContent).toContain(
    "two distinct answers",
  );
  await user.click(screen.getByRole("checkbox", { name: "二 (two)" }));
  await user.click(screen.getByRole("radio", { name: "Readings" }));
  await user.click(screen.getByRole("switch", { name: "Fast mode" }));
  expect(router.state.location.search.kanji).toMatchObject({
    focus: "readings",
    fast: true,
  });
  await user.click(screen.getByRole("button", { name: "Select all" }));
  expect(router.state.location.search.kanji?.ids).toBeUndefined();
});

it("selects whole groups from a partial selection without changing other themes", async () => {
  const user = userEvent.setup();
  await open();
  await user.click(screen.getByRole("checkbox", { name: "一 (one)" }));
  const numbers = screen.getByRole("checkbox", { name: "Select Numbers" });
  expect(numbers).toHaveProperty("indeterminate", true);
  await user.click(numbers);
  expect(screen.getByText("30 selected")).toBeTruthy();
  expect(numbers).toHaveProperty("indeterminate", false);
  await user.click(numbers);
  expect(screen.getByText("20 selected")).toBeTruthy();
  expect(
    screen.getByRole("checkbox", { name: "日 (sun; day)" }),
  ).toHaveProperty("checked", true);
  expect(screen.getByRole("checkbox", { name: "一 (one)" })).toHaveProperty(
    "checked",
    false,
  );
});

it.each(["matching", "quiz", "cards"])(
  "starts %s with its chosen options intact",
  async (game) => {
    const user = userEvent.setup();
    await open(game);
    await user.click(screen.getByRole("radio", { name: "Hard" }));
    await user.click(screen.getByRole("radio", { name: "Standard" }));
    await user.click(screen.getByRole("radio", { name: "5 items" }));
    await user.click(screen.getByRole("radio", { name: "10 items" }));
    if (game === "quiz") {
      await user.click(screen.getByRole("radio", { name: "Meanings" }));
      await user.click(screen.getByRole("radio", { name: "Mixed" }));
    }
    const search = router.state.location.search;
    await user.click(
      screen.getByRole("button", { name: `Start Kanji ${game}` }),
    );
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(`/practice/kanji/${game}`);
    });
    expect(router.state.location.search).toEqual(search);
    expect(search.kanji).toMatchObject({ difficulty: "standard", length: 10 });
  },
);

it.each(["reading", "matching", "quiz", "cards"])(
  "redirects unusable %s URLs to setup",
  async (game) => {
    render(<RouterProvider router={router} />);
    const to =
      game === "reading"
        ? "/practice/kanji/reading"
        : game === "matching"
          ? "/practice/kanji/matching"
          : game === "quiz"
            ? "/practice/kanji/quiz"
            : "/practice/kanji/cards";
    await router.navigate({ to, search: { kanji: { ids: [] } } });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        `/practice/kanji/${game}/setup`,
      );
    });
    expect(screen.getByRole("alert").textContent).toContain(
      "Select at least one",
    );
  },
);

it("uses ten cards by default and rejects an unknown game", async () => {
  await open("cards", { themes: [] });
  expect(
    screen
      .getByRole("radio", { name: "10 items" })
      .getAttribute("aria-checked"),
  ).toBe("true");
  expect(screen.getByText("No theme selected · Standard")).toBeTruthy();
  await router.navigate({
    to: "/practice/kanji/$game/setup",
    params: { game: "unknown" },
  });
  await screen.findByRole("heading", { name: "This page doesn't exist." });
});
