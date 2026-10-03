import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import * as exerciseResults from "@opennihongo/core";
import {
  matchingOptions,
  matchEveryPair,
  renderPractice,
} from "./practiceTestHelpers";

it("completes a matching game with shortcuts, mistake feedback, scoring, and focus", async () => {
  const user = userEvent.setup();
  const session = await renderPractice(matchingOptions);
  const exercise = session.exercises[0];
  if (exercise?.type !== "matching")
    throw new Error("Expected a matching exercise");
  await user.keyboard("1");
  expect(
    within(screen.getByRole("group", { name: "Romaji readings" }))
      .getAllByRole("button")
      .some((button) => button.getAttribute("aria-pressed") === "true"),
  ).toBe(true);
  const first = exercise.pairs[0];
  const second = exercise.pairs[1];
  if (!first || !second) throw new Error("Expected five matching pairs");
  await user.click(screen.getByRole("button", { name: first.left }));
  await user.click(screen.getByRole("button", { name: second.right }));
  expect(
    screen
      .getAllByRole("button")
      .some((button) => button.getAttribute("data-error") === "true"),
  ).toBe(true);
  await matchEveryPair(user, exercise);
  await user.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByRole("status").textContent).toContain(
    "All pairs matched.",
  );
  await user.click(screen.getByRole("button", { name: "See results" }));
  const heading = await screen.findByRole("heading", {
    name: "Perfect practice!",
  });
  expect(document.activeElement).toBe(heading);
  expect(screen.getByText("5 / 5")).toBeTruthy();
  expect(screen.getByText("100%")).toBeTruthy();
  await user.click(screen.getByRole("link", { name: "Back to Practice" }));
  await screen.findByRole("heading", { name: "Practice", level: 1 });
}, 10_000);

it("preserves partially matched skips and attempts, then resets the game on replay", async () => {
  const user = userEvent.setup();
  const record = vi.spyOn(exerciseResults, "createMatchingResult");
  const session = await renderPractice(matchingOptions);
  const exercise = session.exercises[0];
  if (exercise?.type !== "matching")
    throw new Error("Expected a matching exercise");
  const pair = exercise.pairs[0];
  if (!pair) throw new Error("Expected a pair");
  await user.click(screen.getByRole("button", { name: pair.left }));
  await user.click(screen.getByRole("button", { name: pair.right }));
  await user.click(screen.getByRole("button", { name: "Skip" }));
  await screen.findByRole("heading", { name: "Practice complete!" });
  expect(record).toHaveBeenCalledWith(exercise, [pair.id], 1);
  expect(screen.getByText("1 / 5")).toBeTruthy();
  expect(screen.getByText("20%")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Practice again" }));
  await screen.findByRole("heading", { name: "Match the pairs:" });
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
    "0",
  );
  expect(
    within(screen.getByRole("group", { name: "Romaji readings" }))
      .getAllByRole("button")
      .every((button) => !(button as HTMLButtonElement).disabled),
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "Skip" }));
  await screen.findByRole("heading", { name: "Practice complete!" });
  expect(screen.getByText("0 / 5")).toBeTruthy();
  expect(screen.getByText("0%")).toBeTruthy();
});

it("checks with Enter only when ready and leaves typing, links, and other controls alone", async () => {
  const record = vi.spyOn(exerciseResults, "createMatchingResult");
  const session = await renderPractice(matchingOptions);
  const exercise = session.exercises[0];
  if (exercise?.type !== "matching")
    throw new Error("Expected a matching exercise");
  fireEvent.keyDown(screen.getByRole("main"), { key: "Enter" });
  expect(record).not.toHaveBeenCalled();
  for (const pair of exercise.pairs) {
    fireEvent.click(screen.getByRole("button", { name: pair.left }));
    fireEvent.click(screen.getByRole("button", { name: pair.right }));
  }
  render(
    <>
      <textarea aria-label="Notes" />
      <div aria-label="Editable notes" contentEditable role="textbox" />
    </>,
  );
  for (const target of [
    screen.getByRole("textbox", { name: "Notes" }),
    screen.getByRole("textbox", { name: "Editable notes" }),
    screen.getByRole("link", { name: "Leave practice" }),
    screen.getByRole("button", { name: "Skip" }),
  ]) {
    fireEvent.keyDown(target, { key: "Enter" });
  }
  for (const options of [
    { key: "Escape" },
    { key: "Enter", repeat: true },
    { key: "Enter", altKey: true },
    { key: "Enter", ctrlKey: true },
    { key: "Enter", metaKey: true },
    { key: "Enter", isComposing: true },
  ]) {
    fireEvent.keyDown(screen.getByRole("main"), options);
  }
  const canceled = new KeyboardEvent("keydown", {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });
  canceled.preventDefault();
  fireEvent(screen.getByRole("main"), canceled);
  expect(record).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole("main"), { key: "Enter" });
  expect(record).toHaveBeenCalledWith(
    exercise,
    exercise.pairs.map(({ id }) => id),
    5,
  );
  expect(screen.getByRole("status").textContent).toContain(
    "All pairs matched.",
  );
});

it("supports either matching direction and ignores unavailable or already matched shortcut positions", async () => {
  const options = { ...matchingOptions, categories: ["small-tsu"] } as const;
  const session = await renderPractice(options);
  const exercise = session.exercises[0];
  if (exercise?.type !== "matching")
    throw new Error("Expected a matching exercise");
  const pairId = exercise.rightOrder[0];
  const pair = exercise.pairs.find(({ id }) => id === pairId);
  if (!pair) throw new Error("Expected the first right-side pair");
  const leftKey = String(exercise.leftOrder.indexOf(pair.id) + 1);
  for (const key of ["5", "0"])
    fireEvent.keyDown(screen.getByRole("main"), { key });
  expect(
    screen
      .getAllByRole("button")
      .every((button) => button.getAttribute("aria-pressed") !== "true"),
  ).toBe(true);
  fireEvent.keyDown(screen.getByRole("main"), { key: "6" });
  fireEvent.keyDown(screen.getByRole("main"), { key: leftKey });
  const left = screen.getByRole("button", { name: pair.left });
  const right = screen.getByRole("button", { name: pair.right });
  expect(left.hasAttribute("disabled")).toBe(true);
  expect(right.hasAttribute("disabled")).toBe(true);
  fireEvent.keyDown(screen.getByRole("main"), { key: leftKey });
  fireEvent.keyDown(screen.getByRole("main"), { key: "6" });
  expect(left.getAttribute("aria-pressed")).toBe("false");
  expect(right.getAttribute("aria-pressed")).toBe("false");
});
