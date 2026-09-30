import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { kanaCharacterCharts } from "@opennihongo/content";
import * as exerciseResults from "../session/exerciseResults";
import {
  audioCacheMock,
  chartAudioMock,
  openPractice,
  pronunciationMock,
  readingOptions,
  renderPractice,
} from "./practiceTestHelpers";

it("completes five normalized reading answers with pronunciation and focused feedback", async () => {
  const user = userEvent.setup();
  const session = await renderPractice();
  for (const [index, exercise] of session.exercises.entries()) {
    if (exercise.type !== "typed-answer")
      throw new Error("Expected reading exercises");
    const input = await screen.findByRole("textbox", {
      name: `Type the romaji reading for ${exercise.prompt.text}`,
    });
    await user.click(
      screen.getByRole("button", {
        name: `Play pronunciation for ${exercise.prompt.text}`,
      }),
    );
    expect(audioCacheMock.play).toHaveBeenLastCalledWith(
      exercise.sourceItemIds[0],
    );
    await user.type(
      input,
      ` ${(exercise.acceptedAnswers[0] ?? "").toUpperCase()} `,
    );
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status").textContent).toContain(
      "Your reading is correct.",
    );
    const action = screen.getByRole("button", {
      name: index === session.exercises.length - 1 ? "See results" : "Continue",
    });
    expect(document.activeElement).toBe(action);
    await user.click(action);
  }
  const heading = await screen.findByRole("heading", {
    name: "Perfect practice!",
  });
  expect(document.activeElement).toBe(heading);
  expect(screen.getByText("5 / 5")).toBeTruthy();
  expect(screen.getByText("100%")).toBeTruthy();
  expect(audioCacheMock.dispose).toHaveBeenCalledTimes(5);
}, 10_000);

it("submits the latest typed answer when Enter is pressed on the page", async () => {
  const user = userEvent.setup();
  const session = await renderPractice();
  const exercise = session.exercises[0];
  if (exercise?.type !== "typed-answer")
    throw new Error("Expected a reading exercise");
  const record = vi.spyOn(exerciseResults, "createSingleAnswerResult");
  const input = screen.getByRole("textbox");
  await user.type(input, exercise.acceptedAnswers[0] ?? "");
  input.blur();
  await user.keyboard("{Enter}");
  expect(record).toHaveBeenCalledWith(exercise, true, 1);
  expect(screen.getByRole("status").textContent).toContain(
    "Your reading is correct.",
  );
});

it("reports an incorrect reading, records skipped prompts, and restarts cleanly", async () => {
  const user = userEvent.setup();
  const record = vi.spyOn(exerciseResults, "createSingleAnswerResult");
  await renderPractice();
  await user.type(screen.getByRole("textbox"), "wrong");
  await user.click(screen.getByRole("button", { name: "Check answer" }));
  expect(screen.getByRole("status").textContent).toContain(
    "The correct reading is",
  );
  await user.click(screen.getByRole("button", { name: "Continue" }));
  for (let index = 0; index < 4; index += 1) {
    await screen.findByRole("textbox");
    await user.click(screen.getByRole("button", { name: "Skip" }));
  }
  await screen.findByRole("heading", { name: "Practice complete!" });
  expect(screen.getByText("0 / 5")).toBeTruthy();
  expect(screen.getByText("0%")).toBeTruthy();
  expect(
    record.mock.calls.map(([, correct, attempts]) => [correct, attempts]),
  ).toEqual([
    [false, 1],
    [false, 0],
    [false, 0],
    [false, 0],
    [false, 0],
  ]);
  await user.click(screen.getByRole("button", { name: "Practice again" }));
  await screen.findByRole("textbox");
  expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe("");
  expect(document.activeElement).toBe(screen.getByRole("textbox"));
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
    "0",
  );
});

it("waits for chart audio before exposing the reading exercise", async () => {
  let finishPreload: (ids: ReadonlySet<string>) => void = () => {};
  audioCacheMock.preload.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishPreload = resolve;
      }),
  );
  await openPractice();
  expect(screen.getByRole("status").textContent).toContain(
    "Preparing pronunciation audio…",
  );
  expect(screen.queryByRole("textbox")).toBeNull();
  const ids = audioCacheMock.preload.mock.calls[0]?.[0] ?? [];
  expect(ids).toHaveLength(1);
  expect(chartAudioMock).toHaveBeenCalledWith(ids[0]);
  finishPreload(new Set(ids));
  const button = await screen.findByRole("button", {
    name: /Play pronunciation/,
  });
  await userEvent.setup().click(button);
  expect(audioCacheMock.play).toHaveBeenCalledWith(ids[0]);
});

it("speaks the authored pronunciation of a pattern when recorded audio is unavailable", async () => {
  chartAudioMock.mockReturnValue(undefined);
  const options = {
    ...readingOptions,
    script: "katakana",
    category: "small-tsu",
  } as const;
  const session = await renderPractice(options);
  const exercise = session.exercises[0];
  if (exercise?.type !== "typed-answer")
    throw new Error("Expected a reading exercise");
  const tile = kanaCharacterCharts.katakana.sections
    .flatMap(({ rows }) => rows.flat())
    .find((entry) => entry?.id === exercise.sourceItemIds[0]);
  expect(tile?.speechText).not.toBe(exercise.prompt.text);
  await userEvent.setup().click(
    screen.getByRole("button", {
      name: `Play pronunciation for ${exercise.prompt.text}`,
    }),
  );
  expect(pronunciationMock).toHaveBeenCalledWith(tile?.speechText);
  expect(audioCacheMock.preload).not.toHaveBeenCalled();
});

it("disposes pending pronunciation loading when leaving and starts a fresh session on return", async () => {
  const user = userEvent.setup();
  let finishPreload: (ids: ReadonlySet<string>) => void = () => {};
  audioCacheMock.preload.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finishPreload = resolve;
      }),
  );
  await openPractice();
  expect(screen.getByRole("status").textContent).toContain(
    "Preparing pronunciation audio…",
  );
  const ids = audioCacheMock.preload.mock.calls[0]?.[0] ?? [];
  await user.click(screen.getByRole("link", { name: "Leave practice" }));
  await screen.findByRole("heading", { name: "Practice", level: 1 });
  expect(audioCacheMock.dispose).toHaveBeenCalledOnce();
  await act(async () => {
    finishPreload(new Set(ids));
    await Promise.resolve();
  });
  expect(
    screen.getByRole("heading", { name: "Practice", level: 1 }),
  ).toBeTruthy();
  await user.click(screen.getByRole("link", { name: "Play Kana reading" }));
  await screen.findByRole("textbox");
  expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
    "0",
  );
  expect(screen.getByRole<HTMLInputElement>("textbox").value).toBe("");
});
