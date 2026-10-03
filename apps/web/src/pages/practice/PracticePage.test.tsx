import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, expect, it } from "vitest";
import { router } from "../../app/router";

afterEach(cleanup);
async function openHub(search = {}) {
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice", search });
  await screen.findByRole("heading", { name: "Practice", level: 1 });
}

it("groups configurable Kana games and existing word games under normal navigation", async () => {
  await openHub();
  expect(
    screen.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeTruthy();
  expect(document.querySelector(".app-shell--lesson")).toBeNull();
  const kana = within(screen.getByRole("region", { name: "Kana" }));
  for (const game of ["reading", "matching", "quiz", "cards"]) {
    expect(
      kana
        .getByRole("link", { name: `Set up Kana ${game}` })
        .getAttribute("href"),
    ).toContain(`/practice/kana/${game}/setup`);
  }
  expect(
    within(screen.getByRole("region", { name: "Words" }))
      .getByRole("link", { name: "Play word matching" })
      .getAttribute("href"),
  ).toBe("/practice/words/matching");
});

it("retains setup choices when entering a game, leaving, and reopening setup", async () => {
  const user = userEvent.setup();
  await openHub({ scripts: ["katakana"], categories: ["small-tsu"] });
  await user.click(screen.getByRole("link", { name: "Set up Kana matching" }));
  await screen.findByRole("heading", { name: "Set up Kana matching" });
  expect(
    screen.getByRole("link", { name: "Practice" }).getAttribute("aria-current"),
  ).toBe("page");
  await user.click(screen.getByRole("button", { name: "Start Kana matching" }));
  await screen.findByRole("heading", { name: "Match the pairs:" });
  expect(document.title).toBe("Kana matching · OpenNihongo");
  expect(document.querySelector(".app-shell--lesson")).not.toBeNull();
  expect(
    screen.queryByRole("navigation", { name: "Primary navigation" }),
  ).toBeNull();
  const characters = screen.getByRole("group", {
    name: "Katakana characters and patterns",
  });
  expect(within(characters).getAllByRole("button")).toHaveLength(4);
  expect(characters.textContent).toContain("ッ");
  await user.click(screen.getByRole("link", { name: "Leave practice" }));
  await screen.findByRole("heading", { name: "Practice", level: 1 });
  expect(router.state.location.search).toMatchObject({
    scripts: ["katakana"],
    categories: ["small-tsu"],
  });
  await user.click(screen.getByRole("link", { name: "Set up Kana matching" }));
  expect(
    await screen.findByRole("checkbox", { name: "Katakana" }),
  ).toHaveProperty("checked", true);
});

it("normalizes invalid options before opening setup", async () => {
  const user = userEvent.setup();
  await openHub({ scripts: ["unknown"], categories: ["unknown"] });
  await user.click(screen.getByRole("link", { name: "Set up Kana reading" }));
  expect(
    await screen.findByRole("checkbox", { name: "Hiragana" }),
  ).toHaveProperty("checked", true);
  expect(
    screen.getByRole("checkbox", { name: "Basic characters" }),
  ).toHaveProperty("checked", true);
});

it("keeps vocabulary browsing within Practice and preserves the hub choices", async () => {
  const user = userEvent.setup();
  await openHub({ scripts: ["katakana"], categories: ["dakuten"] });
  const navigation = within(
    screen.getByRole("navigation", { name: "Primary navigation" }),
  );
  expect(navigation.getByRole("link", { name: "Home" })).toBeTruthy();
  expect(navigation.queryByRole("link", { name: "Words" })).toBeNull();
  await user.click(
    within(screen.getByRole("region", { name: "Words" })).getByRole("link", {
      name: "View vocabulary",
    }),
  );
  await screen.findByRole("heading", { name: "Vocabulary", level: 1 });
  expect(router.state.location.pathname).toBe("/practice/words/vocabulary");
  expect(
    screen.getByRole("link", { name: "Practice" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(screen.getByText("5 words")).toBeTruthy();
  await user.click(screen.getByRole("link", { name: "Back to Practice" }));
  await screen.findByRole("heading", { name: "Practice", level: 1 });
  expect(router.state.location.search).toMatchObject({
    scripts: ["katakana"],
    categories: ["dakuten"],
  });
});

it("opens the saved five-vowel exercise from the Kana group", async () => {
  const user = userEvent.setup();
  await openHub();
  await user.click(
    within(screen.getByRole("region", { name: "Kana" })).getByRole("link", {
      name: "Start first vowels",
    }),
  );
  await screen.findByRole("heading", { name: "Learn the five vowels" });
  expect(router.state.location.pathname).toBe("/practice/kana/vowels");
  expect(document.title).toBe("First vowels · OpenNihongo");
  expect(
    screen.queryByRole("navigation", { name: "Primary navigation" }),
  ).toBeNull();
  await user.click(screen.getByRole("link", { name: "Leave practice" }));
  await screen.findByRole("heading", { name: "Practice", level: 1 });
});

it("carries a chart section through the hub into game setup", async () => {
  const user = userEvent.setup();
  await openHub();
  await user.click(screen.getByRole("link", { name: "Kana" }));
  await screen.findByRole("heading", { name: "Kana characters" });
  await user.click(screen.getByRole("radio", { name: "Katakana" }));
  await user.click(
    within(screen.getByRole("region", { name: "Small ッ" })).getByRole("link", {
      name: "Practice this section",
    }),
  );
  await screen.findByRole("heading", { name: "Practice", level: 1 });
  expect(router.state.location.search).toMatchObject({
    scripts: ["katakana"],
    categories: ["small-tsu"],
  });
  await user.click(screen.getByRole("link", { name: "Set up Kana quiz" }));
  expect(
    await screen.findByRole("checkbox", { name: "Small っ" }),
  ).toHaveProperty("checked", true);
  expect(
    within(screen.getByRole("region", { name: "Your session" })).getByText(
      "4 questions",
    ),
  ).toBeTruthy();
});
