import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { renderPractice, readingOptions } from "./practiceTestHelpers";
import { openQuiz } from "./quizTestHelpers";

it("shows a reading hint once per item and reports hint use without changing correctness", async () => {
  const user = userEvent.setup();
  const session = await renderPractice({
    ...readingOptions,
    difficulty: "easy",
  });
  for (const [index, exercise] of session.exercises.entries()) {
    if (exercise.type !== "typed-answer") throw new Error("Expected reading");
    if (index === 0) {
      await user.click(screen.getByRole("button", { name: "Show hint" }));
      expect(screen.getByRole("status").textContent).toContain(
        `Hint: ${exercise.acceptedAnswers[0]?.[0] ?? ""}`,
      );
      expect(screen.queryByRole("button", { name: "Show hint" })).toBeNull();
    }
    await user.type(
      screen.getByRole("textbox"),
      exercise.acceptedAnswers[0] ?? "",
    );
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    await user.click(
      screen.getByRole("button", {
        name:
          index === session.exercises.length - 1 ? "See results" : "Continue",
      }),
    );
  }
  expect(screen.getByLabelText("Session results").textContent).toContain(
    "5 / 5",
  );
  expect(screen.getByText("Hints used: 1")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Practice again" }));
  expect(await screen.findByRole("button", { name: "Show hint" })).toBeTruthy();
});

it("delays hard-mode audio until after checking a reading", async () => {
  const user = userEvent.setup();
  await renderPractice({ ...readingOptions, difficulty: "hard" });
  expect(
    screen.queryByRole("button", { name: /Play pronunciation/ }),
  ).toBeNull();
  expect(screen.queryByRole("button", { name: "Show hint" })).toBeNull();
  await user.type(screen.getByRole("textbox"), "wrong");
  await user.click(screen.getByRole("button", { name: "Check answer" }));
  expect(
    screen.getByRole("button", { name: /Play pronunciation/ }),
  ).toBeTruthy();
});

it("supports six quiz choices and their fifth and sixth keyboard shortcuts", async () => {
  const user = userEvent.setup();
  await openQuiz({
    categories: ["basic"],
    difficulty: "hard",
    direction: "character",
  });
  await user.click(screen.getByRole("button", { name: "Start Kana quiz" }));
  const group = within(
    await screen.findByRole("group", { name: "Answer options" }),
  );
  const buttons = group.getAllByRole("button");
  expect(buttons).toHaveLength(6);
  expect(
    screen.queryByRole("button", { name: /Play pronunciation/ }),
  ).toBeNull();
  await user.keyboard("5");
  expect(buttons[4]?.getAttribute("aria-pressed")).toBe("true");
  await user.keyboard("6");
  expect(buttons[5]?.getAttribute("aria-pressed")).toBe("true");
  await user.keyboard("{Enter}");
  expect(
    screen.getByRole("button", { name: /Play pronunciation/ }),
  ).toBeTruthy();
});

it("shows a single-letter reading hint for a selected vowel and reports assistance", async () => {
  const user = userEvent.setup();
  await renderPractice({
    ...readingOptions,
    difficulty: "easy",
    characterIds: ["hiragana.basic.あ"],
  });
  await user.click(screen.getByRole("button", { name: "Show hint" }));
  expect(screen.getByRole("status").textContent).toContain(
    "Hint: a (1 letter)",
  );
  await user.click(screen.getByRole("button", { name: "Skip" }));
  expect(await screen.findByText("Hints used: 1")).toBeTruthy();
  expect(screen.getByText("0 / 1")).toBeTruthy();
});
