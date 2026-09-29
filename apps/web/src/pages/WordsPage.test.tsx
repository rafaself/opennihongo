// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { WordsPage } from "./WordsPage";

afterEach(cleanup);

describe("Words library", () => {
  it("shows the authored beginner words with readings and English meanings", () => {
    render(<WordsPage />);

    expect(screen.getByRole("heading", { name: "Words" })).toBeTruthy();
    expect(screen.getByText("5 words")).toBeTruthy();
    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(["そと", "はと", "さと", "みみ", "ねこ"]);
    screen.getByText("soto");
    screen.getByText("outside");
    screen.getByText("hato");
    screen.getByText("pigeon");
    screen.getByText("sato");
    screen.getByText("village");
    screen.getByText("mimi");
    screen.getByText("ear");
    screen.getByText("neko");
    screen.getByText("cat");
  });

  it("sorts by Japanese alphabetical order and links to word practice", async () => {
    const user = userEvent.setup();
    render(<WordsPage />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Sort words" }),
      "japanese",
    );

    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(["さと", "そと", "ねこ", "はと", "みみ"]);
    expect(
      screen
        .getByRole("link", { name: "Start word practice" })
        .getAttribute("href"),
    ).toBe("/words/practice");
  });
});
