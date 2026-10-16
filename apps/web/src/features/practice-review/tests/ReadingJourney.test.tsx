import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import {
  renderPractice,
  readingOptions,
} from "../../../views/practice/tests/practiceTestHelpers";
import type { LearningRecord } from "@opennihongo/core";
const save = vi.hoisted(() =>
  vi.fn<(record: LearningRecord) => Promise<void>>(),
);
vi.mock("@opennihongo/persistence", () => ({ appendLearningRecord: save }));

it("explains a reading, separates skips and help, and retries only selected items", async () => {
  save.mockResolvedValue();
  const user = userEvent.setup();
  const session = await renderPractice({
    ...readingOptions,
    difficulty: "easy",
    characterIds: ["hiragana.basic.あ", "hiragana.basic.い"],
  });
  const first = session.exercises[0];
  if (first?.type !== "typed-answer") throw new Error("Expected reading");
  await user.click(screen.getByRole("button", { name: "Show hint" }));
  await user.click(screen.getByRole("button", { name: /Play pronunciation/ }));
  await user.type(screen.getByRole("textbox"), "wrong");
  await user.keyboard("{Enter}");
  expect(screen.getByText(/Reading to remember/)).toBeTruthy();
  expect(
    screen.getByText(/The main characters in this writing system/),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Continue" }));
  await screen.findByRole("textbox");
  await user.click(screen.getByRole("button", { name: "Skip" }));
  const results = await screen.findByRole("region", {
    name: "Your reading results",
  });
  expect(
    within(results).getByText("Incorrect · hint and audio requested"),
  ).toBeTruthy();
  expect(within(results).getByText("Skipped · no help requested")).toBeTruthy();
  expect(save.mock.calls[0]?.[0].evidence?.items[0]).toMatchObject({
    response: "answered",
    assistance: "hint-and-audio",
  });
  expect(save.mock.calls[1]?.[0].evidence?.items[0]).toMatchObject({
    response: "skipped",
    assistance: "none",
  });
  const boxes = within(results).getAllByRole("checkbox");
  const second = boxes[1];
  if (!second) throw new Error("Expected second result");
  await user.click(second);
  await user.click(
    within(results).getByRole("button", { name: "Retry selected (1)" }),
  );
  expect(await screen.findByRole("textbox")).toHaveProperty("value", "");
  expect(screen.getByRole("textbox").getAttribute("aria-label")).toContain(
    first.prompt.text,
  );
  expect(screen.getByText("1/1")).toBeTruthy();
  await user.type(screen.getByRole("textbox"), first.acceptedAnswers[0] ?? "");
  await user.keyboard("{Enter}");
  await user.click(screen.getByRole("button", { name: "See results" }));
  expect(await screen.findByText("Correct · no help requested")).toBeTruthy();
  expect(save.mock.calls[2]?.[0].sessionId).not.toBe(
    save.mock.calls[0]?.[0].sessionId,
  );
}, 10_000);

it("keeps selected retry available after a failed save and opens saved review after recovery", async () => {
  save
    .mockReset()
    .mockRejectedValueOnce(new Error("Storage unavailable"))
    .mockResolvedValue(undefined);
  const user = userEvent.setup();
  await renderPractice({
    ...readingOptions,
    characterIds: ["hiragana.basic.あ"],
  });
  await user.type(screen.getByRole("textbox"), "wrong");
  await user.keyboard("{Enter}");
  await screen.findByRole("alert");
  await user.click(screen.getByRole("button", { name: "See results" }));
  expect(
    screen.getByRole("button", { name: "Retry selected (1)" }),
  ).toHaveProperty("disabled", false);
  expect(
    screen.getByText(/Save your answers before opening saved review/),
  ).toBeTruthy();
  expect(
    screen.queryByRole("link", { name: "Review saved readings" }),
  ).toBeNull();
  await user.click(screen.getByRole("button", { name: "Retry saving" }));
  expect(
    await screen.findByRole("link", { name: "Review saved readings" }),
  ).toBeTruthy();
  expect(save.mock.calls.at(-1)?.[0]).toBe(save.mock.calls.at(-2)?.[0]);
});
