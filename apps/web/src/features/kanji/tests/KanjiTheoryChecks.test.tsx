import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { appendLearningRecord } from "@opennihongo/persistence";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { router } from "../../../app/router";

afterEach(cleanup);
beforeEach(() => vi.mocked(appendLearningRecord).mockClear());

async function open() {
  render(<RouterProvider router={router} />);
  await router.navigate({
    to: "/kanji/$kanjiId",
    params: { kanjiId: "kanji.character.u4e00" },
  });
  await screen.findByRole("heading", { name: "一 · one", level: 1 });
}

it("explains each answer, keeps the checks independent, and allows retry without recording scores", async () => {
  const user = userEvent.setup();
  await open();
  const meaning = within(
    screen.getByRole("region", { name: "Connect shape and meaning" }),
  );
  const reading = within(
    screen.getByRole("region", { name: "Read the whole word" }),
  );
  await user.click(meaning.getByRole("button", { name: "two" }));
  expect(meaning.getByRole("status").textContent).toContain(
    "Try another answer",
  );
  expect(meaning.getByRole("status").textContent).toContain("二 means two");
  await user.click(meaning.getByRole("button", { name: "one" }));
  expect(meaning.getByRole("status").textContent).toContain("That fits");
  expect(
    meaning.getByRole("button", { name: "one" }).getAttribute("aria-pressed"),
  ).toBe("true");
  await user.click(reading.getByRole("button", { name: "ふたつ" }));
  expect(reading.getByRole("status").textContent).toContain(
    "ふたつ is the reading of 二つ",
  );
  await user.click(reading.getByRole("button", { name: "ひとつ" }));
  expect(reading.getByRole("status").textContent).toContain(
    "一つ is read ひとつ",
  );
  await user.click(reading.getByRole("button", { name: "Try again" }));
  expect(reading.queryByRole("status")).toBeNull();
  expect(meaning.getByRole("status").textContent).toContain("That fits");
  expect(
    screen.getByText("Optional · No scores or saved results"),
  ).toBeTruthy();
  expect(appendLearningRecord).not.toHaveBeenCalled();
});

it("supports keyboard answers and resets feedback when changing characters", async () => {
  const user = userEvent.setup();
  await open();
  const reading = within(
    screen.getByRole("region", { name: "Read the whole word" }),
  );
  reading.getByRole("button", { name: "ひとつ" }).focus();
  await user.keyboard("{Enter}");
  expect(reading.getByRole("status").textContent).toContain("That fits");
  reading.getByRole("button", { name: "Try again" }).focus();
  await user.keyboard(" ");
  expect(reading.queryByRole("status")).toBeNull();
  expect(document.activeElement).toBe(
    reading.getByRole("button", { name: "ひとつ" }),
  );
  await user.click(reading.getByRole("button", { name: "ふたつ" }));
  await user.click(screen.getByRole("link", { name: "Next: 二" }));
  await screen.findByRole("heading", { name: "二 · two", level: 1 });
  expect(screen.queryByRole("status")).toBeNull();
  expect(
    screen.getByRole("button", { name: "ふたつ" }).getAttribute("aria-pressed"),
  ).toBe("false");
});
