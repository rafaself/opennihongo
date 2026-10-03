import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { router } from "../../../app/router";
import {
  matchingOptions,
  matchEveryPair,
  renderPractice,
} from "./practiceTestHelpers";

it("advances between matching boards, scores all items, and preserves configuration in Change options", async () => {
  const user = userEvent.setup();
  const session = await renderPractice({
    ...matchingOptions,
    difficulty: "standard",
    length: 10,
  });
  expect(session.exercises).toHaveLength(3);
  for (const [index, exercise] of session.exercises.entries()) {
    if (exercise.type !== "matching") throw new Error("Expected matching");
    await matchEveryPair(user, exercise);
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      String(index === 0 ? 40 : index === 1 ? 80 : 100),
    );
    await user.click(
      screen.getByRole("button", {
        name: index === 2 ? "See results" : "Continue",
      }),
    );
  }
  expect(
    await screen.findByRole("heading", { name: "Perfect practice!" }),
  ).toBeTruthy();
  expect(screen.getByText("10 / 10")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Change options" }));
  await screen.findByRole("heading", { name: "Set up Kana matching" });
  expect(router.state.location.search).toMatchObject({
    difficulty: "standard",
    length: 10,
  });
});
