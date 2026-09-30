import "./practiceTestHelpers";
import { act, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { router } from "../../../app/router";
import { openQuiz, questions, question, requireValue } from "./quizTestHelpers";
import { audioCacheMock } from "./practiceTestHelpers";

it("checks once and advances at one second, including the final results", async () => {
  const user = userEvent.setup();
  await openQuiz({ direction: "romaji", fast: true });
  await user.click(screen.getByRole("button", { name: "Start quiz" }));
  await screen.findByRole("heading", { name: "Choose the correct answer" });
  vi.useFakeTimers();
  for (const [index, exercise] of questions("romaji").entries()) {
    const correct = requireValue(
      exercise.options.find(({ id }) => id === exercise.correctOptionId),
    );
    const button = within(
      screen.getByRole("group", { name: "Answer options" }),
    ).getByRole("button", { name: correct.text });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.getByRole("status").textContent).toContain("That’s right!");
    expect(screen.queryByRole("button", { name: "Continue" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Check answer" })).toBeNull();
    expect(screen.getByText(exercise.prompt.text)).toBeTruthy();
    await act(() => vi.advanceTimersByTimeAsync(999));
    expect(screen.getByText(exercise.prompt.text)).toBeTruthy();
    await act(() => vi.advanceTimersByTimeAsync(1));
    if (index < 3) {
      expect(
        screen.getByText(question(index + 1, "romaji").prompt.text),
      ).toBeTruthy();
      expect(
        within(
          screen.getByRole("group", { name: "Answer options" }),
        ).getAllByRole("button")[0],
      ).toBe(document.activeElement);
    }
  }
  expect(screen.getByRole("heading", { name: "Perfect practice!" })).toBe(
    document.activeElement,
  );
  expect(screen.getByLabelText("Session results").textContent).toContain(
    "4 / 4",
  );
  vi.useRealTimers();
  await user.click(screen.getByRole("button", { name: "Change options" }));
  await screen.findByRole("heading", { name: "Set up your Kana quiz" });
  expect(
    screen
      .getByRole("switch", { name: "Fast mode" })
      .getAttribute("aria-checked"),
  ).toBe("true");
});

it("cancels queued advancement and disposes audio when leaving feedback", async () => {
  const user = userEvent.setup();
  await openQuiz({ direction: "character", fast: true });
  await user.click(screen.getByRole("button", { name: "Start quiz" }));
  await screen.findByRole("heading", { name: "Choose the correct answer" });
  vi.useFakeTimers();
  const exercise = question(0);
  fireEvent.click(
    screen.getByRole("button", {
      name: requireValue(exercise.options[0]).text,
    }),
  );
  expect(screen.getByRole("status")).toBeTruthy();
  await act(() =>
    router.navigate({
      to: "/practice",
      search: { script: "katakana", category: "small-tsu" },
    }),
  );
  const disposed = audioCacheMock.dispose.mock.calls.length;
  expect(disposed).toBeGreaterThan(0);
  await act(() => vi.advanceTimersByTimeAsync(1000));
  expect(
    screen.getByRole("heading", { name: "Practice", level: 1 }),
  ).toBeTruthy();
  expect(screen.queryByRole("status")).toBeNull();
  vi.useRealTimers();
  await router.navigate({
    to: "/practice/kana/quiz",
    search: {
      script: "katakana",
      category: "small-tsu",
      direction: "character",
      fast: true,
    },
  });
  await user.click(await screen.findByRole("button", { name: "Start quiz" }));
  await screen.findByText(exercise.prompt.text);
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
    "0",
  );
});

it("selects with shortcuts and arrows while ignoring modified and repeated keys", async () => {
  const user = userEvent.setup();
  await openQuiz({ direction: "character" });
  await user.click(screen.getByRole("button", { name: "Start quiz" }));
  await screen.findByRole("heading", { name: "Choose the correct answer" });
  const buttons = within(
    screen.getByRole("group", { name: "Answer options" }),
  ).getAllByRole("button");
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(buttons[1]);
  await user.keyboard("{ArrowDown}");
  expect(document.activeElement).toBe(buttons[3]);
  await user.keyboard("{ArrowLeft}{ArrowUp}");
  expect(document.activeElement).toBe(buttons[0]);
  fireEvent.keyDown(requireValue(buttons[0]), { key: "1", ctrlKey: true });
  fireEvent.keyDown(requireValue(buttons[0]), { key: "1", repeat: true });
  fireEvent.keyDown(requireValue(buttons[0]), { key: "1", isComposing: true });
  expect(
    buttons.every((button) => button.getAttribute("aria-pressed") === "false"),
  ).toBe(true);
  await user.keyboard("4");
  expect(document.activeElement).toBe(buttons[3]);
  expect(requireValue(buttons[3]).getAttribute("aria-pressed")).toBe("true");
  await user.keyboard("{Enter}");
  expect(screen.getByRole("status")).toBeTruthy();
  fireEvent.keyDown(window, { key: "1" });
  expect(requireValue(buttons[3]).getAttribute("aria-pressed")).toBe("true");
});

it("uses Enter and Space to choose focused options before checking them", async () => {
  const user = userEvent.setup();
  await openQuiz({ direction: "character" });
  await user.click(screen.getByRole("button", { name: "Start quiz" }));
  await screen.findByRole("heading", { name: "Choose the correct answer" });
  const buttons = within(
    screen.getByRole("group", { name: "Answer options" }),
  ).getAllByRole("button");
  await user.keyboard(" ");
  expect(requireValue(buttons[0]).getAttribute("aria-pressed")).toBe("true");
  await user.keyboard("{ArrowRight}{Enter}");
  expect(requireValue(buttons[1]).getAttribute("aria-pressed")).toBe("true");
  expect(screen.queryByRole("status")).toBeNull();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("status")).toBeTruthy();
});
