import { kanaBeginnerWords } from "@opennihongo/content";
import type {
  ExerciseResult,
  MatchingExercise as MatchingExerciseModel,
  TypedAnswerExercise as TypedAnswerExerciseModel,
} from "@opennihongo/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { router } from "../../app/router";
import * as exerciseResults from "./session/exerciseResults";
import { createKanaPracticeSession } from "./session/createKanaPracticeSession";

const audioCacheMock = vi.hoisted(() => ({
  preload: vi.fn((audioIds: readonly string[]) =>
    Promise.resolve(new Set(audioIds)),
  ),
  play: vi.fn(),
  dispose: vi.fn(),
}));
const audioAssetMock = vi.hoisted(() => ({
  getAudioAsset: vi.fn((id: string): string | undefined => `/audio/${id}.opus`),
}));
const pronunciationMock = vi.hoisted(() => ({ play: vi.fn() }));

vi.mock("@opennihongo/audio-assets", () => audioAssetMock);
vi.mock("./audio/audioCache", () => ({
  createExerciseAudioCache: vi.fn(() => audioCacheMock),
}));
vi.mock("../../lib/pronunciation", () => ({
  playJapanesePronunciation: pronunciationMock.play,
}));

async function openPractice() {
  render(<RouterProvider router={router} />);
  await router.navigate({ to: "/practice" });
}

async function renderPractice() {
  await openPractice();
  await screen.findByRole("heading", {
    name: "What is the corresponding sound?",
  });
}

function getGeneratedExercises(revision = 0) {
  const session = createKanaPracticeSession(revision);
  const typedAnswer = session.exercises.find(
    (exercise): exercise is TypedAnswerExerciseModel =>
      exercise.type === "typed-answer",
  );
  const matching = session.exercises.find(
    (exercise): exercise is MatchingExerciseModel =>
      exercise.type === "matching",
  );

  if (!typedAnswer || !matching) {
    throw new Error(
      "The initial Kana practice session needs both exercise types.",
    );
  }

  return { session, typedAnswer, matching };
}

function contentForSourceItem(sourceItemId: string) {
  const word = kanaBeginnerWords.find(({ id }) => id === sourceItemId);
  if (!word) {
    throw new Error(`Missing test content for ${sourceItemId}.`);
  }
  return word;
}

async function matchEveryPair(
  user: ReturnType<typeof userEvent.setup>,
  exercise: MatchingExerciseModel,
) {
  for (const pair of exercise.pairs) {
    await user.click(screen.getByRole("button", { name: pair.left }));
    await user.click(screen.getByRole("button", { name: pair.right }));
  }
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("PracticeView", () => {
  it("renders and completes a deterministic generated session", async () => {
    const user = userEvent.setup();
    const { session, typedAnswer, matching } = getGeneratedExercises();
    expect(session.exercises.map(({ type }) => type)).toEqual([
      "typed-answer",
      "matching",
    ]);

    await renderPractice();
    const input = await screen.findByRole("textbox", {
      name: `Type the romaji reading for ${typedAnswer.prompt.text}`,
    });
    const typedWord = contentForSourceItem(typedAnswer.sourceItemIds[0] ?? "");
    await user.click(
      screen.getByRole("button", {
        name: `Play pronunciation for ${typedAnswer.prompt.text}`,
      }),
    );
    expect(audioCacheMock.play).toHaveBeenCalledWith(typedWord.id);

    await user.type(input, typedAnswer.acceptedAnswers[0]?.toUpperCase() ?? "");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("status").textContent).toContain(
      "Your reading is correct.",
    );
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Continue" }),
    );
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await screen.findByRole("heading", { name: "Match the pairs:" });
    expect(audioCacheMock.dispose).toHaveBeenCalledOnce();

    const leftGroup = within(
      screen.getByRole("group", { name: "Romaji readings" }),
    );
    await user.keyboard("1");
    expect(
      leftGroup
        .getAllByRole("button")
        .some((button) => button.getAttribute("aria-pressed") === "true"),
    ).toBe(true);

    const firstPair = matching.pairs[0];
    const secondPair = matching.pairs[1];
    if (!firstPair || !secondPair) {
      throw new Error("The matching profile should create five pairs.");
    }
    await user.click(screen.getByRole("button", { name: firstPair.left }));
    await user.click(screen.getByRole("button", { name: secondPair.right }));
    expect(
      screen
        .getAllByRole("button")
        .some((button) => button.getAttribute("data-error") === "true"),
    ).toBe(true);

    await matchEveryPair(user, matching);
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status").textContent).toContain(
      "All pairs matched.",
    );
    await user.click(screen.getByRole("button", { name: "See results" }));

    const resultsHeading = await screen.findByRole("heading", {
      name: "Perfect practice!",
    });
    expect(document.activeElement).toBe(resultsHeading);
    expect(screen.getByText("6 / 6")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  }, 10_000);

  it("submits the latest typed answer when Enter is pressed on the page", async () => {
    const user = userEvent.setup();
    const { typedAnswer } = getGeneratedExercises();
    const createResult = vi.spyOn(exerciseResults, "createTypedAnswerResult");
    const answer = typedAnswer.acceptedAnswers[0] ?? "";

    await renderPractice();
    const input = await screen.findByRole("textbox", {
      name: `Type the romaji reading for ${typedAnswer.prompt.text}`,
    });
    expect(answer.length).toBeGreaterThan(1);
    await user.type(input, answer);
    input.blur();
    expect(document.activeElement).not.toBe(input);

    await user.keyboard("{Enter}");

    expect(createResult).toHaveBeenCalledWith(typedAnswer, true, 1);
    expect(screen.getByRole("status").textContent).toContain(
      "Your reading is correct.",
    );
  });

  it("records typed and partially matched skips, then restarts", async () => {
    const user = userEvent.setup();
    const { session, typedAnswer, matching } = getGeneratedExercises();
    const typedSkip = vi.spyOn(exerciseResults, "createTypedAnswerResult");
    const matchingSkip = vi.spyOn(exerciseResults, "createMatchingResult");
    const scoreResults = vi.spyOn(exerciseResults, "scoreExerciseResults");
    await renderPractice();

    await user.click(screen.getByRole("button", { name: "Skip" }));
    await screen.findByRole("heading", { name: "Match the pairs:" });
    const firstPair = matching.pairs[0];
    if (!firstPair) {
      throw new Error("The matching profile should create five pairs.");
    }
    await user.click(screen.getByRole("button", { name: firstPair.left }));
    await user.click(screen.getByRole("button", { name: firstPair.right }));
    await user.click(screen.getByRole("button", { name: "Skip" }));

    await screen.findByRole("heading", { name: "Practice complete!" });
    const typedResult = {
      exerciseId: typedAnswer.id,
      sourceItemResults: typedAnswer.sourceItemIds.map((sourceItemId) => ({
        sourceItemId,
        outcome: "incorrect" as const,
      })),
      outcome: "incorrect",
      attempts: 0,
    } satisfies ExerciseResult;
    const matchingResult = {
      exerciseId: matching.id,
      sourceItemResults: matching.pairs.map((pair) => ({
        sourceItemId: pair.sourceItemId,
        outcome: pair.id === firstPair.id ? ("correct" as const) : "incorrect",
      })),
      outcome: "partially-correct",
      attempts: 1,
    } satisfies ExerciseResult;
    expect(typedSkip).toHaveBeenCalledWith(typedAnswer, false, 0);
    expect(typedResult).toEqual({
      exerciseId: typedAnswer.id,
      sourceItemResults: typedAnswer.sourceItemIds.map((sourceItemId) => ({
        sourceItemId,
        outcome: "incorrect",
      })),
      outcome: "incorrect",
      attempts: 0,
    });
    expect(matchingSkip).toHaveBeenCalledWith(matching, [firstPair.id], 1);
    expect(matchingResult).toEqual({
      exerciseId: matching.id,
      sourceItemResults: matching.pairs.map((pair) => ({
        sourceItemId: pair.sourceItemId,
        outcome: pair.id === firstPair.id ? "correct" : "incorrect",
      })),
      outcome: "partially-correct",
      attempts: 1,
    });
    expect(scoreResults).toHaveBeenLastCalledWith([
      typedResult,
      matchingResult,
    ]);
    expect(session.exercises).toHaveLength(2);
    expect(screen.getByText("1 / 6")).toBeTruthy();
    expect(screen.getByText("17%")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Practice again" }));
    await screen.findByRole("heading", {
      name: "What is the corresponding sound?",
    });
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "0",
    );
  });

  it("shows zero credit when both generated exercises are skipped", async () => {
    const user = userEvent.setup();
    await renderPractice();
    await user.click(screen.getByRole("button", { name: "Skip" }));
    await screen.findByRole("heading", { name: "Match the pairs:" });
    await user.click(screen.getByRole("button", { name: "Skip" }));

    await screen.findByRole("heading", { name: "Practice complete!" });
    expect(screen.getByText("0 / 6")).toBeTruthy();
    expect(screen.getByText("0%")).toBeTruthy();
  });

  it("waits for generated source audio before exposing the exercise", async () => {
    const { typedAnswer } = getGeneratedExercises();
    const audioId = typedAnswer.sourceItemIds[0];
    if (!audioId) {
      throw new Error("The typed-answer exercise needs one source item.");
    }
    const user = userEvent.setup();
    let finishPreload: (audioIds: ReadonlySet<string>) => void = () => {};
    audioCacheMock.preload.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishPreload = (audioIds) => {
            resolve(new Set(audioIds));
          };
        }),
    );

    await openPractice();
    expect(screen.getByRole("status").textContent).toContain(
      "Preparing pronunciation audio…",
    );
    expect(audioCacheMock.preload).toHaveBeenCalledWith([audioId]);
    expect(
      screen.queryByRole("button", {
        name: `Play pronunciation for ${getGeneratedExercises().typedAnswer.prompt.text}`,
      }),
    ).toBeNull();

    finishPreload(new Set([audioId]));
    await user.click(
      await screen.findByRole("button", {
        name: `Play pronunciation for ${typedAnswer.prompt.text}`,
      }),
    );
    expect(audioCacheMock.play).toHaveBeenCalledWith(audioId);
  });

  it("uses speech synthesis when a generated source has no audio asset", async () => {
    const { typedAnswer } = getGeneratedExercises();
    const user = userEvent.setup();
    audioAssetMock.getAudioAsset.mockReturnValue(undefined);

    await renderPractice();
    expect(audioCacheMock.preload).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", {
        name: `Play pronunciation for ${typedAnswer.prompt.text}`,
      }),
    );
    expect(pronunciationMock.play).toHaveBeenCalledWith(
      typedAnswer.prompt.text,
    );
  });
});
