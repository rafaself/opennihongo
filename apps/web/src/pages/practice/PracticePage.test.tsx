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

it("groups game choices under Kana and Words with normal application navigation", async () => {
  await openHub();
  expect(
    screen.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeTruthy();
  expect(document.querySelector(".app-shell--lesson")).toBeNull();
  const kana = within(screen.getByRole("region", { name: "Kana" }));
  expect(
    kana.getByRole("link", { name: "Play Kana reading" }).getAttribute("href"),
  ).toContain("/practice/kana/reading");
  expect(
    kana.getByRole("link", { name: "Play Kana matching" }).getAttribute("href"),
  ).toContain("/practice/kana/matching");
  expect(
    within(screen.getByRole("region", { name: "Words" }))
      .getByRole("link", { name: "Play word matching" })
      .getAttribute("href"),
  ).toBe("/practice/words/matching");
  expect(
    kana.getByRole("radio", { name: "Hiragana" }).getAttribute("aria-checked"),
  ).toBe("true");
  expect(
    kana.getByRole<HTMLSelectElement>("combobox", { name: "Kana category" })
      .value,
  ).toBe("basic");
});

it("stores character choices in the URL and returns from a game with them preserved", async () => {
  const user = userEvent.setup();
  await openHub();
  await user.click(screen.getByRole("radio", { name: "Katakana" }));
  await user.selectOptions(
    screen.getByRole("combobox", { name: "Kana category" }),
    "small-tsu",
  );
  expect(router.state.location.search).toEqual({
    script: "katakana",
    category: "small-tsu",
  });
  expect(
    screen.getByRole("link", { name: "Practice" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(screen.getByRole("region", { name: "Kana" }).textContent).toContain(
    "4",
  );
  await user.click(screen.getByRole("link", { name: "Play Kana matching" }));
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
  expect(router.state.location.search).toEqual({
    script: "katakana",
    category: "small-tsu",
  });
  expect(
    screen
      .getByRole("radio", { name: "Katakana" })
      .getAttribute("aria-checked"),
  ).toBe("true");
});

it("normalizes invalid character options to the defaults", async () => {
  await openHub({ script: "unknown", category: "unknown" });
  expect(
    screen
      .getByRole("radio", { name: "Hiragana" })
      .getAttribute("aria-checked"),
  ).toBe("true");
  expect(
    screen.getByRole<HTMLSelectElement>("combobox", { name: "Kana category" })
      .value,
  ).toBe("basic");
});
