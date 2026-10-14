import { audioCacheMock } from "../../../views/practice/tests/practiceTestHelpers";
import {
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { beforeEach, expect, it, vi } from "vitest";
import { beginnerKanji } from "@opennihongo/content";
import type { LearningRecord } from "@opennihongo/core";
import { router } from "../../../app/router";
import * as sessions from "../session/createKanjiSession";

const save = vi.hoisted(() =>
  vi.fn<(record: LearningRecord) => Promise<void>>(),
);
vi.mock("@opennihongo/persistence", () => ({ appendLearningRecord: save }));
beforeEach(() => save.mockReset().mockResolvedValue());
async function open(
  game: "reading" | "matching" | "quiz" | "cards",
  kanji: Record<string, unknown> = {},
) {
  const generation = vi.spyOn(sessions, "createKanjiSession");
  render(<RouterProvider router={router} />);
  const to =
    game === "reading"
      ? "/practice/kanji/reading"
      : game === "matching"
        ? "/practice/kanji/matching"
        : game === "quiz"
          ? "/practice/kanji/quiz"
          : "/practice/kanji/cards";
  await router.navigate({ to, search: { kanji } });
  await screen.findByRole("heading", {
    name:
      game === "reading"
        ? "Read this word"
        : game === "matching"
          ? "Match the pairs:"
          : game === "cards"
            ? "Kanji cards"
            : /Choose the/,
  });
  return generation;
}

it("checks contextual Kana and romaji answers, protects IME composition, and resets on replay", async () => {
  const user = userEvent.setup();
  const generation = await open("reading", { difficulty: "easy" });
  const session = generation.mock.results.at(-1)?.value as ReturnType<
    typeof sessions.createKanjiSession
  >;
  for (const [index, exercise] of session.exercises.entries()) {
    if (exercise.type !== "typed-answer") throw new Error("Expected reading");
    const input = await screen.findByRole("textbox");
    if (index === 0) {
      await user.click(screen.getByRole("button", { name: "Show hint" }));
      await user.click(
        screen.getByRole("button", { name: /Play pronunciation/ }),
      );
      expect(audioCacheMock.play).toHaveBeenLastCalledWith(
        exercise.sourceItemIds[0],
      );
      fireEvent.keyDown(input, { key: "Enter", isComposing: true });
      expect(save).not.toHaveBeenCalled();
    }
    const item = beginnerKanji.find(
      ({ id }) => id === exercise.sourceItemIds[0],
    );
    if (!item) throw new Error("Expected source item");
    await user.type(
      input,
      index % 2 === 0 ? item.example.reading : item.example.romaji,
    );
    await user.keyboard("{Enter}");
    expect(screen.getByText("Your reading is correct.")).toBeTruthy();
    await user.click(
      screen.getByRole("button", {
        name: index === 4 ? "See results" : "Continue",
      }),
    );
  }
  expect(await screen.findByText("5 / 5")).toBeTruthy();
  expect(screen.getByText("Hints used: 1")).toBeTruthy();
  expect(save).toHaveBeenCalledTimes(5);
  await user.click(screen.getByRole("button", { name: "Practice again" }));
  expect(await screen.findByRole("button", { name: "Show hint" })).toBeTruthy();
  const restarted = generation.mock.results.at(-1);
  if (restarted?.type !== "return") throw new Error("Expected replay");
  expect(restarted.value.exercises).not.toEqual(session.exercises);
  await user.click(screen.getByRole("button", { name: "Skip" }));
  expect(save.mock.calls.at(-1)?.[0].result.attempts).toBe(0);
}, 10_000);

it("keeps a hard reading playable after a save failure and retries the same record", async () => {
  const user = userEvent.setup();
  save.mockRejectedValueOnce(new Error("Storage unavailable"));
  await open("reading", { difficulty: "hard", ids: [beginnerKanji[0]?.id] });
  expect(
    screen.queryByRole("button", { name: /Play pronunciation/ }),
  ).toBeNull();
  await user.type(screen.getByRole("textbox"), "wrong");
  await user.click(screen.getByRole("button", { name: "Check answer" }));
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    "Your answer could not be saved. You can still finish this session.",
  );
  expect(screen.getByText(/The correct reading is/)).toBeTruthy();
  expect(
    screen.getByRole("button", { name: /Play pronunciation/ }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Retry saving" }));
  await waitFor(() => {
    expect(screen.queryByRole("alert")).toBeNull();
  });
  expect(save.mock.calls[1]?.[0]).toEqual(save.mock.calls[0]?.[0]);
  await user.click(screen.getByRole("button", { name: "See results" }));
  await user.click(screen.getByRole("button", { name: "Change options" }));
  expect(router.state.location.pathname).toBe("/practice/kanji/reading/setup");
});

it("completes matching boards and records each target Kanji", async () => {
  const user = userEvent.setup();
  const generation = await open("matching", { difficulty: "easy" });
  const session = generation.mock.results.at(-1)?.value as ReturnType<
    typeof sessions.createKanjiSession
  >;
  for (const [index, exercise] of session.exercises.entries()) {
    if (exercise.type !== "matching") throw new Error("Expected matching");
    const left = within(
      await screen.findByRole("group", { name: "English meanings" }),
    );
    const right = within(
      screen.getByRole("group", { name: "Kanji characters" }),
    );
    for (const pair of exercise.pairs) {
      await user.click(left.getByRole("button", { name: pair.left }));
      await user.click(right.getByRole("button", { name: pair.right }));
    }
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(
      screen.getByRole("button", {
        name:
          index === session.exercises.length - 1 ? "See results" : "Continue",
      }),
    );
  }
  expect(await screen.findByText("5 / 5")).toBeTruthy();
  expect(
    save.mock.calls.flatMap(([record]) => record.result.sourceItemResults),
  ).toHaveLength(5);
});

it("uses quiz focus, keyboard choices, hard audio rules, and fast completion", async () => {
  const generation = await open("quiz", {
    focus: "meanings",
    difficulty: "hard",
    fast: true,
    ids: beginnerKanji.slice(0, 2).map(({ id }) => id),
  });
  const session = generation.mock.results.at(-1)?.value as ReturnType<
    typeof sessions.createKanjiSession
  >;
  vi.useFakeTimers();
  for (const exercise of session.exercises) {
    if (exercise.type !== "multiple-choice") throw new Error("Expected quiz");
    expect(
      screen.getByRole("heading", { name: "Choose the Kanji meaning" }),
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", { name: /Play pronunciation/ }),
    ).toBeNull();
    const choice = exercise.options.findIndex(
      ({ id }) => id === exercise.correctOptionId,
    );
    fireEvent.keyDown(document.body, { key: String(choice + 1) });
    expect(screen.getByText("Your answer is correct.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Play pronunciation/ }),
    ).toBeTruthy();
    await act(() => vi.advanceTimersByTimeAsync(1000));
  }
  vi.useRealTimers();
  expect(await screen.findByText("2 / 2")).toBeTruthy();
}, 10_000);

it("presents contextual quiz readings with the word meaning", async () => {
  const user = userEvent.setup();
  await open("quiz", { focus: "readings", difficulty: "easy" });
  expect(
    screen.getByRole("heading", { name: "Choose the word reading" }),
  ).toBeTruthy();
  const buttons = within(
    screen.getByRole("group", { name: "Answer options" }),
  ).getAllByRole("button");
  expect(buttons).toHaveLength(2);
  const firstOption = buttons[0];
  if (!firstOption) throw new Error("Expected an answer option");
  await user.click(firstOption);
  await user.click(screen.getByRole("button", { name: "Check answer" }));
  await user.click(screen.getByRole("button", { name: "Continue" }));
});

it("reveals Kanji recall details and saves ratings and skips through the shared card renderer", async () => {
  const user = userEvent.setup();
  await open("cards", {
    difficulty: "hard",
    ids: beginnerKanji.slice(0, 2).map(({ id }) => id),
  });
  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Reveal answer" }),
    ).toHaveProperty("disabled", false);
  });
  expect(
    screen.queryByRole("button", { name: /Play pronunciation/ }),
  ).toBeNull();
  await user.keyboard("{Enter}");
  expect(screen.getByText(/On:/)).toBeTruthy();
  expect(
    screen.getByRole("button", { name: /Play pronunciation/ }),
  ).toBeTruthy();
  await user.keyboard("2");
  await user.click(screen.getByRole("button", { name: "Skip" }));
  await screen.findByRole("heading", { name: "Practice complete!" });
  expect(save).toHaveBeenCalledTimes(2);
  expect(screen.getByText("Remembered")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Change options" }));
  expect(router.state.location.pathname).toBe("/practice/kanji/cards/setup");
});
