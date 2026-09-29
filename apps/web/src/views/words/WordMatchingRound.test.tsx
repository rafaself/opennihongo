// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WordMatchingRound } from "./WordMatchingRound";
import { createWordsPracticeSession } from "./session/createWordsPracticeSession";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("WordMatchingRound feedback", () => {
  it("clears wrong-pair feedback after a short delay and leaves the pair retryable", async () => {
    vi.useFakeTimers();
    const attempt = vi.fn();
    const [exercise] = createWordsPracticeSession(12).rounds;
    const firstPair = exercise.pairs[0];
    const secondPair = exercise.pairs[1];
    if (!firstPair || !secondPair) {
      throw new Error("The word review round should contain five pairs.");
    }

    render(
      <WordMatchingRound
        exercise={exercise}
        matchedPairIds={[]}
        onPairAttempt={attempt}
        rolling={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: firstPair.left }));
    fireEvent.click(screen.getByRole("button", { name: secondPair.right }));
    expect(screen.getByRole("status").textContent).toBe(
      "That pair doesn’t match. Try again.",
    );
    expect(attempt).toHaveBeenCalledWith(null);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1100);
    });

    expect(screen.getByRole("status").textContent).toBe("");
    expect(
      screen
        .getByRole("button", { name: firstPair.left })
        .getAttribute("disabled"),
    ).toBeNull();
  });
});
