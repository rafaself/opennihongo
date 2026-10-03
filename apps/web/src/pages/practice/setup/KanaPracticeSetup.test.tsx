import "../../../views/practice/tests/practiceTestHelpers";
import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { router } from "../../../app/router";
import { render } from "@testing-library/react";
import { RouterProvider } from "@tanstack/react-router";

async function open(game = "reading", search = {}) {
  render(<RouterProvider router={router} />);
  await router.navigate({
    to: "/practice/kana/$game/setup",
    params: { game },
    search,
  });
  await screen.findByRole("heading", { name: /Set up Kana/ });
}

it("configures a mixed-script selection, preserves individual choices, and starts the requested session", async () => {
  const user = userEvent.setup();
  await open("reading", { difficulty: "easy", length: 20 });
  expect(
    screen.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("checkbox", { name: "Hiragana あ (a)" }));
  expect(
    screen.getByRole<HTMLInputElement>("checkbox", {
      name: "Select Hiragana Basic characters row 1",
    }).indeterminate,
  ).toBe(true);
  await user.click(screen.getByRole("checkbox", { name: "Katakana" }));
  expect(router.state.location.search.characterIds).not.toContain(
    "hiragana.basic.あ",
  );
  expect(router.state.location.search.characterIds).toContain(
    "katakana.basic.ア",
  );
  await user.click(screen.getByRole("button", { name: "Start Kana reading" }));
  await screen.findByRole("heading", {
    name: "What is the corresponding sound?",
  });
  expect(router.state.location.pathname).toBe("/practice/kana/reading");
  expect(router.state.location.search).toMatchObject({
    scripts: ["hiragana", "katakana"],
    difficulty: "easy",
    length: 20,
  });
  expect(
    screen.queryByRole("navigation", { name: "Primary navigation" }),
  ).toBeNull();
  expect(screen.getByRole("button", { name: "Show hint" })).toBeTruthy();
});

it("supports clearing and selecting rows and keeps explicit empty choices in the URL", async () => {
  const user = userEvent.setup();
  await open("matching", { categories: ["small-tsu"] });
  await user.click(screen.getByRole("radio", { name: "Easy" }));
  await user.click(screen.getByRole("radio", { name: "20 items" }));
  expect(router.state.location.search).toMatchObject({
    difficulty: "easy",
    length: 20,
  });
  await user.click(screen.getByRole("button", { name: "Clear all" }));
  expect(router.state.location.search.characterIds).toEqual([]);
  expect(
    screen.getByRole("button", { name: "Start Kana matching" }),
  ).toHaveProperty("disabled", true);
  expect(screen.getByRole("alert").textContent).toContain(
    "Select at least one character",
  );
  await user.click(
    screen.getByRole("checkbox", { name: "Select Hiragana Small っ row 1" }),
  );
  expect(router.state.location.search.characterIds).toHaveLength(4);
  expect(
    screen.getByRole("button", { name: "Start Kana matching" }),
  ).toHaveProperty("disabled", false);
  await user.click(screen.getByRole("button", { name: "Select all" }));
  expect(router.state.location.search.characterIds).toBeUndefined();
});

it("explains reduced sizes and prevents ambiguous one-sound quizzes", async () => {
  await open("quiz", {
    categories: ["small-tsu"],
    difficulty: "hard",
    length: 20,
  });
  const summary = within(screen.getByRole("region", { name: "Your session" }));
  expect(summary.getByText("4 questions")).toBeTruthy();
  expect(summary.getByText(/Only 4 distinct readings/)).toBeTruthy();
  await router.navigate({
    to: "/practice/kana/quiz",
    search: {
      scripts: ["hiragana", "katakana"],
      characterIds: ["hiragana.basic.あ", "katakana.basic.ア"],
    },
  });
  await waitFor(() => {
    expect(router.state.location.pathname).toBe("/practice/kana/quiz/setup");
  });
  expect(screen.getByRole("alert").textContent).toContain(
    "two distinct readings",
  );
});

it("defaults cards to ten items, rejects unknown games, and restores setup from its URL", async () => {
  await open("cards", {
    scripts: ["katakana"],
    categories: ["dakuten"],
    difficulty: "hard",
  });
  expect(
    screen
      .getByRole("radio", { name: "10 items" })
      .getAttribute("aria-checked"),
  ).toBe("true");
  expect(
    screen.getByRole("radio", { name: "Hard" }).getAttribute("aria-checked"),
  ).toBe("true");
  const search = router.state.location.search;
  await router.navigate({ to: "/practice" });
  await router.navigate({
    to: "/practice/kana/$game/setup",
    params: { game: "cards" },
    search,
  });
  expect(screen.getByRole("checkbox", { name: "Katakana" })).toHaveProperty(
    "checked",
    true,
  );
  await router.navigate({
    to: "/practice/kana/$game/setup",
    params: { game: "unknown" },
  });
  await screen.findByRole("heading", { name: "This page doesn't exist." });
});

it("allows empty writing-system choices and selects or clears a complete character row", async () => {
  const user = userEvent.setup();
  await open("reading", { scripts: [], categories: ["small-tsu"] });
  expect(
    screen.getByText("No writing system selected · Standard"),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Start Kana reading" }),
  ).toHaveProperty("disabled", true);
  await user.click(screen.getByRole("checkbox", { name: "Hiragana" }));
  const row = screen.getByRole("checkbox", {
    name: "Select Hiragana Small っ row 1",
  });
  await user.click(row);
  expect(router.state.location.search.characterIds).toEqual([]);
  await user.click(row);
  expect(router.state.location.search.characterIds).toHaveLength(4);
  await user.click(screen.getByRole("checkbox", { name: "Hiragana" }));
  expect(router.state.location.search.scripts).toEqual([]);
  expect(
    screen.getByRole("button", { name: "Start Kana reading" }),
  ).toHaveProperty("disabled", true);
});

it("preserves individually selected characters when removing and adding groups", async () => {
  const user = userEvent.setup();
  await open("reading", {
    categories: ["basic", "small-tsu"],
    characterIds: ["hiragana.basic.あ", "hiragana.small-tsu.っ+k"],
  });
  await user.click(screen.getByRole("checkbox", { name: "Basic characters" }));
  expect(router.state.location.search.characterIds).toEqual([
    "hiragana.small-tsu.っ+k",
  ]);
  await user.click(screen.getByRole("checkbox", { name: "Combinations" }));
  expect(router.state.location.search.characterIds).toHaveLength(34);
  expect(router.state.location.search.characterIds).toContain(
    "hiragana.small-tsu.っ+k",
  );
  expect(router.state.location.search.categories).toEqual([
    "combinations",
    "small-tsu",
  ]);
});

it.each(["reading", "matching", "cards"])(
  "returns an empty %s session to setup with its selection preserved",
  async (game) => {
    render(<RouterProvider router={router} />);
    const to =
      game === "reading"
        ? "/practice/kana/reading"
        : game === "matching"
          ? "/practice/kana/matching"
          : "/practice/kana/cards";
    await router.navigate({
      to,
      search: { characterIds: [], difficulty: "hard" },
    });
    await screen.findByRole("heading", { name: `Set up Kana ${game}` });
    expect(router.state.location.search).toMatchObject({
      characterIds: [],
      difficulty: "hard",
    });
    expect(
      screen.getByRole("button", { name: `Start Kana ${game}` }),
    ).toHaveProperty("disabled", true);
  },
);

it("keeps character selection in view when URL options change", async () => {
  const scroll = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const user = userEvent.setup();
  await open("reading", { categories: ["small-tsu"] });
  scroll.mockClear();
  await user.click(
    screen.getByRole("checkbox", { name: "Hiragana っ+k (kk)" }),
  );
  expect(router.state.location.search.characterIds).toHaveLength(3);
  expect(scroll).not.toHaveBeenCalled();
});
