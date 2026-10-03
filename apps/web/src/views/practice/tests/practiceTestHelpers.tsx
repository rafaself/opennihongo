import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { afterEach, beforeEach, vi } from "vitest";
import type { MatchingExercise } from "@opennihongo/core";
import { router } from "../../../app/router";
import {
  createKanaPracticeSession,
  type KanaPracticeOptions,
} from "../session/createKanaPracticeSession";

const audioCacheMock = vi.hoisted(() => ({
  preload:
    vi.fn<(audioIds: readonly string[]) => Promise<ReadonlySet<string>>>(),
  play: vi.fn(),
  dispose: vi.fn(),
}));
const chartAudioMock = vi.hoisted(() =>
  vi.fn<(id: string) => string | undefined>(),
);
const pronunciationMock = vi.hoisted(() => vi.fn());
export { audioCacheMock, chartAudioMock, pronunciationMock };

vi.mock("@opennihongo/audio-assets", () => ({
  getAudioAsset: () => undefined,
  getKanaChartAudioAsset: chartAudioMock,
}));
vi.mock("../audio/audioCache", () => ({
  createExerciseAudioCache: () => audioCacheMock,
}));
vi.mock("../../../lib/pronunciation", () => ({
  playJapanesePronunciation: pronunciationMock,
}));

beforeEach(() => {
  audioCacheMock.preload
    .mockReset()
    .mockImplementation((ids) => Promise.resolve(new Set(ids)));
  chartAudioMock.mockReset().mockImplementation((id) => `/audio/${id}.opus`);
});
afterEach(async () => {
  vi.useRealTimers();
  await router.navigate({ to: "/" });
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

export const readingOptions = {
  mode: "reading",
  scripts: ["hiragana"],
  categories: ["basic"],
  difficulty: "standard",
  direction: "random",
  fast: false,
  revision: 0,
} as const;
export const matchingOptions = {
  ...readingOptions,
  mode: "matching",
  difficulty: "hard",
} as const;

export async function openPractice(
  options: KanaPracticeOptions = readingOptions,
) {
  render(<RouterProvider router={router} />);
  await router.navigate({
    to:
      options.mode === "reading"
        ? "/practice/kana/reading"
        : "/practice/kana/matching",
    search: options,
  });
}

export async function renderPractice(
  options: KanaPracticeOptions = readingOptions,
) {
  await openPractice(options);
  await screen.findByRole("heading", {
    name:
      options.mode === "reading"
        ? "What is the corresponding sound?"
        : "Match the pairs:",
  });
  return createKanaPracticeSession(options);
}

export async function matchEveryPair(
  user: ReturnType<typeof userEvent.setup>,
  exercise: MatchingExercise,
) {
  for (const pair of exercise.pairs) {
    await user.click(screen.getByRole("button", { name: pair.left }));
    await user.click(screen.getByRole("button", { name: pair.right }));
  }
}
