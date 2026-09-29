// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { MatchingExercise, MatchingPairId } from "@opennihongo/core";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MatchingBoard } from "../../components/matching/MatchingBoard";
import { createWordsPracticeSession } from "./session/createWordsPracticeSession";

function StatefulRollingRound({ exercise }: { exercise: MatchingExercise }) {
  const [matchedPairIds, setMatchedPairIds] = useState<MatchingPairId[]>([]);

  return (
    <MatchingBoard
      exercise={exercise}
      leftLabel="English meanings"
      matchedPairIds={matchedPairIds}
      onPairAttempt={(pairId) => {
        if (pairId !== null) {
          setMatchedPairIds((current) => [...current, pairId]);
        }
      }}
      rightLabel="Japanese words"
      rolling
    />
  );
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("Words matching board", () => {
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
      <MatchingBoard
        announceFeedback
        exercise={exercise}
        leftLabel="English meanings"
        matchedPairIds={[]}
        onPairAttempt={attempt}
        rightLabel="Japanese words"
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

  it("moves keyboard focus to a visible match after a rolling match", async () => {
    const user = userEvent.setup();
    const exercise = createWordsPracticeSession(12).rounds[1];
    const firstVisiblePairId = exercise.leftOrder[0];
    const newlyVisiblePairId = exercise.leftOrder[3];
    if (firstVisiblePairId === undefined || newlyVisiblePairId === undefined) {
      throw new Error(
        "The rolling round should start with three visible pairs.",
      );
    }
    const firstPair = exercise.pairs.find(
      (pair) => pair.id === firstVisiblePairId,
    );
    const newlyVisiblePair = exercise.pairs.find(
      (pair) => pair.id === newlyVisiblePairId,
    );
    const rightVisibleOrder = exercise.rightOrder.filter((pairId) =>
      exercise.leftOrder.slice(0, 3).includes(pairId),
    );
    const rightIndex = rightVisibleOrder.indexOf(firstVisiblePairId);
    if (!firstPair || !newlyVisiblePair || rightIndex < 0) {
      throw new Error("The rolling round should expose its first three pairs.");
    }

    render(<StatefulRollingRound exercise={exercise} />);
    const englishGroup = screen.getByRole("group", {
      name: "English meanings",
    });
    const japaneseGroup = screen.getByRole("group", {
      name: "Japanese words",
    });

    await user.tab();
    expect(document.activeElement).toBe(
      within(englishGroup).getAllByRole("button")[0],
    );
    await user.keyboard("{Enter}");
    for (let index = 0; index < 3 + rightIndex; index += 1) {
      await user.tab();
    }
    expect(document.activeElement).toBe(
      within(japaneseGroup).getByRole("button", { name: firstPair.right }),
    );
    await user.keyboard("{Enter}");

    expect(
      within(englishGroup).getByRole("button", {
        name: newlyVisiblePair.left,
      }),
    ).toBeTruthy();
    expect(
      within(japaneseGroup).getByRole("button", {
        name: newlyVisiblePair.right,
      }),
    ).toBeTruthy();
    expect([
      ...within(englishGroup).getAllByRole("button"),
      ...within(japaneseGroup).getAllByRole("button"),
    ]).toContain(document.activeElement);
  });
});
