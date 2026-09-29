// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { kanaBeginnerWords } from "@opennihongo/content";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it } from "vitest";
import { router } from "../../app/router";

afterEach(cleanup);

async function renderWordsRoute() {
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/words" });
  await screen.findByRole("heading", { name: "Words" });
}

async function matchWord(
  user: ReturnType<typeof userEvent.setup>,
  hiragana: string,
  meaning: string,
) {
  await user.click(screen.getByRole("button", { name: hiragana }));
  await user.click(screen.getByRole("button", { name: meaning }));
}

async function matchNextVisibleWord(user: ReturnType<typeof userEvent.setup>) {
  const group = screen.getByRole("group", { name: "Japanese words" });
  const next = within(group)
    .getAllByRole("button")
    .find((button) => !(button as HTMLButtonElement).disabled);
  if (!next)
    throw new Error("The current round should have an unmatched word.");
  const word = kanaBeginnerWords.find(({ hiragana }) =>
    next.textContent.endsWith(hiragana),
  );
  if (!word) throw new Error("Every Japanese option should have word content.");
  await user.click(next);
  await user.click(screen.getByRole("button", { name: word.englishMeaning }));
}

async function finishVisibleRound(user: ReturnType<typeof userEvent.setup>) {
  let attempts = 0;
  while (!screen.queryByRole("button", { name: /^(Continue|See results)$/ })) {
    await matchNextVisibleWord(user);
    attempts += 1;
    if (attempts > 5)
      throw new Error("A round should complete after five matches.");
  }
}

describe("Words practice route", () => {
  it("runs two matching rounds, tracks accuracy, and supports replay and return", async () => {
    const user = userEvent.setup();
    await renderWordsRoute();

    await user.click(screen.getByRole("link", { name: "Start word practice" }));
    await screen.findByRole("heading", { name: "Review five beginner words" });
    expect(document.title).toBe("Word practice · OpenNihongo");
    expect(document.querySelector(".app-shell--lesson")).not.toBeNull();
    expect(
      screen.queryByRole("navigation", { name: "Primary navigation" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Open menu" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("group", { name: "English meanings" }).children,
    ).toHaveLength(5);
    expect(
      screen.getByRole("group", { name: "Japanese words" }).children,
    ).toHaveLength(5);
    const firstMeaning = within(
      screen.getByRole("group", { name: "English meanings" }),
    ).getAllByRole("button")[0];
    const firstJapaneseWord = within(
      screen.getByRole("group", { name: "Japanese words" }),
    ).getAllByRole("button")[0];
    expect(firstMeaning?.getAttribute("aria-keyshortcuts")).toBe("1");
    expect(firstJapaneseWord?.getAttribute("aria-keyshortcuts")).toBe("6");
    await user.keyboard("1");
    expect(firstMeaning?.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen
        .getByRole("progressbar", { name: "Lesson progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("0");

    await user.click(screen.getByRole("button", { name: "pigeon" }));
    await user.click(screen.getByRole("button", { name: "そと" }));
    expect(screen.getByRole("status").textContent).toBe(
      "That pair doesn’t match. Try again.",
    );
    await user.click(screen.getByRole("button", { name: "outside" }));
    await user.click(screen.getByRole("button", { name: "そと" }));
    expect(
      screen
        .getByRole("progressbar", { name: "Lesson progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("10");
    await finishVisibleRound(user);

    expect(
      screen.getByRole("heading", { name: "All five pairs matched" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("progressbar", { name: "Lesson progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("50");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("group", { name: "English meanings" }).children,
    ).toHaveLength(3);
    expect(
      screen.getByRole("group", { name: "Japanese words" }).children,
    ).toHaveLength(3);
    await matchNextVisibleWord(user);
    expect(
      screen.getByRole("group", { name: "English meanings" }).children,
    ).toHaveLength(3);
    expect(
      screen.getByRole("group", { name: "Japanese words" }).children,
    ).toHaveLength(3);
    await matchNextVisibleWord(user);
    expect(
      screen.getByRole("group", { name: "English meanings" }).children,
    ).toHaveLength(3);
    expect(
      screen.getByRole("group", { name: "Japanese words" }).children,
    ).toHaveLength(3);
    await finishVisibleRound(user);

    expect(
      screen
        .getByRole("progressbar", { name: "Lesson progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("100");
    await user.click(screen.getByRole("button", { name: "See results" }));
    expect(screen.getByText("10 / 10")).toBeTruthy();
    expect(screen.getByText("91%")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Return to Words" })
        .getAttribute("href"),
    ).toBe("/words");

    await user.click(screen.getByRole("button", { name: "Replay" }));
    await screen.findByRole("heading", { name: "Review five beginner words" });
    expect(
      screen
        .getByRole("progressbar", { name: "Lesson progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("0");
    await user.click(screen.getByRole("link", { name: "Leave word practice" }));
    await screen.findByRole("heading", { name: "Words" });
  }, 10_000);

  it("discards session progress when leaving before completion", async () => {
    const user = userEvent.setup();
    await renderWordsRoute();
    await user.click(screen.getByRole("link", { name: "Start word practice" }));
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await matchWord(user, "そと", "outside");
    expect(
      screen
        .getByRole("progressbar", { name: "Lesson progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("10");

    await user.click(screen.getByRole("link", { name: "Leave word practice" }));
    await screen.findByRole("heading", { name: "Words" });
    await user.click(screen.getByRole("link", { name: "Start word practice" }));
    await screen.findByRole("heading", { name: "Review five beginner words" });
    expect(
      screen
        .getByRole("progressbar", { name: "Lesson progress" })
        .getAttribute("aria-valuenow"),
    ).toBe("0");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("button", { name: "そと" }).getAttribute("disabled"),
    ).toBeNull();
  });
});
