import type {
  MatchingExercise as MatchingExerciseModel,
  MatchingPairId,
} from "@opennihongo/core";
import { Button } from "@opennihongo/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

type MatchingExerciseProps = Readonly<{
  exercise: MatchingExerciseModel;
  disabled: boolean;
  matchedPairIds: readonly MatchingPairId[];
  onPairAttempt: (matchedPairId: MatchingPairId | null) => void;
}>;

type ErrorPair = Readonly<{
  leftPairId: MatchingPairId;
  rightPairId: MatchingPairId;
}>;

const leftShortcuts = ["1", "2", "3", "4", "5"] as const;
const rightShortcuts = ["6", "7", "8", "9", "0"] as const;

export function MatchingExercise({
  exercise,
  disabled,
  matchedPairIds,
  onPairAttempt,
}: MatchingExerciseProps) {
  const [selectedLeftId, setSelectedLeftId] = useState<MatchingPairId | null>(
    null,
  );
  const [selectedRightId, setSelectedRightId] = useState<MatchingPairId | null>(
    null,
  );
  const [errorPair, setErrorPair] = useState<ErrorPair | null>(null);
  const pairById = useMemo(
    () => new Map(exercise.pairs.map((pair) => [pair.id, pair])),
    [exercise.pairs],
  );
  const leftPairs = useMemo(
    () => resolvePairOrder(exercise.leftOrder, pairById),
    [exercise.leftOrder, pairById],
  );
  const rightPairs = useMemo(
    () => resolvePairOrder(exercise.rightOrder, pairById),
    [exercise.rightOrder, pairById],
  );

  useEffect(() => {
    if (!errorPair) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setErrorPair(null);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorPair]);

  const matchPair = useCallback(
    (leftPairId: MatchingPairId, rightPairId: MatchingPairId) => {
      if (
        matchedPairIds.includes(leftPairId) ||
        matchedPairIds.includes(rightPairId)
      ) {
        setSelectedLeftId(null);
        setSelectedRightId(null);
        return;
      }

      if (leftPairId === rightPairId) {
        setErrorPair(null);
        onPairAttempt(leftPairId);
      } else {
        setErrorPair({ leftPairId, rightPairId });
        onPairAttempt(null);
      }
      setSelectedLeftId(null);
      setSelectedRightId(null);
    },
    [matchedPairIds, onPairAttempt],
  );

  const selectLeft = useCallback(
    (pairId: MatchingPairId) => {
      if (selectedRightId) {
        matchPair(pairId, selectedRightId);
      } else {
        setSelectedLeftId(pairId);
      }
    },
    [matchPair, selectedRightId],
  );

  const selectRight = useCallback(
    (pairId: MatchingPairId) => {
      if (selectedLeftId) {
        matchPair(selectedLeftId, pairId);
      } else {
        setSelectedRightId(pairId);
      }
    },
    [matchPair, selectedLeftId],
  );

  useEffect(() => {
    if (disabled) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.defaultPrevented
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, [contenteditable='true']"))
      ) {
        return;
      }

      const leftIndex = leftShortcuts.findIndex(
        (shortcut) => shortcut === event.key,
      );
      if (leftIndex >= 0) {
        const pair = leftPairs[leftIndex];
        if (!pair || matchedPairIds.includes(pair.id)) {
          return;
        }
        event.preventDefault();
        selectLeft(pair.id);
        return;
      }

      const rightIndex = rightShortcuts.findIndex(
        (shortcut) => shortcut === event.key,
      );
      if (rightIndex >= 0) {
        const pair = rightPairs[rightIndex];
        if (!pair || matchedPairIds.includes(pair.id)) {
          return;
        }
        event.preventDefault();
        selectRight(pair.id);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    disabled,
    leftPairs,
    matchedPairIds,
    rightPairs,
    selectLeft,
    selectRight,
  ]);

  return (
    <div className="practice-session__matching">
      <div
        aria-label="Romaji readings"
        className="practice-session__match-column"
        role="group"
      >
        {leftPairs.map((pair, index) => {
          const shortcut = leftShortcuts[index];
          const matched = matchedPairIds.includes(pair.id);
          return (
            <Button
              aria-keyshortcuts={shortcut}
              aria-pressed={selectedLeftId === pair.id}
              className="practice-session__match-option"
              data-error={errorPair?.leftPairId === pair.id}
              data-matched={matched}
              data-selected={selectedLeftId === pair.id}
              disabled={matched || disabled}
              key={pair.id}
              onClick={() => {
                selectLeft(pair.id);
              }}
              variant="secondary"
            >
              <span
                aria-hidden="true"
                className="practice-session__choice-number"
              >
                {shortcut}
              </span>
              <span>{pair.left}</span>
              <span aria-hidden="true" />
            </Button>
          );
        })}
      </div>
      <div
        aria-label="Hiragana words"
        className="practice-session__match-column"
        role="group"
      >
        {rightPairs.map((pair, index) => {
          const shortcut = rightShortcuts[index];
          const matched = matchedPairIds.includes(pair.id);
          return (
            <Button
              aria-keyshortcuts={shortcut}
              aria-pressed={selectedRightId === pair.id}
              className="practice-session__match-option practice-session__match-option--kana"
              data-error={errorPair?.rightPairId === pair.id}
              data-matched={matched}
              data-selected={selectedRightId === pair.id}
              disabled={matched || disabled}
              key={pair.id}
              onClick={() => {
                selectRight(pair.id);
              }}
              variant="secondary"
            >
              <span
                aria-hidden="true"
                className="practice-session__choice-number"
              >
                {shortcut}
              </span>
              <span>{pair.right}</span>
              <span aria-hidden="true" />
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function resolvePairOrder<TPair extends { id: MatchingPairId }>(
  pairIds: readonly MatchingPairId[],
  pairById: ReadonlyMap<MatchingPairId, TPair>,
): readonly TPair[] {
  return pairIds.flatMap((pairId) => {
    const pair = pairById.get(pairId);
    return pair ? [pair] : [];
  });
}
