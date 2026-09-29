import type { MatchingExercise, MatchingPairId } from "@opennihongo/core";
import { Button } from "@opennihongo/ui";
import { useEffect, useMemo, useRef, useState } from "react";

type WordMatchingRoundProps = Readonly<{
  exercise: MatchingExercise;
  matchedPairIds: readonly MatchingPairId[];
  rolling: boolean;
  onPairAttempt: (pairId: MatchingPairId | null) => void;
}>;

type ErrorPair = Readonly<{
  left: MatchingPairId;
  right: MatchingPairId;
}>;

export function WordMatchingRound({
  exercise,
  matchedPairIds,
  rolling,
  onPairAttempt,
}: WordMatchingRoundProps) {
  const [selectedLeftId, setSelectedLeftId] = useState<MatchingPairId | null>(
    null,
  );
  const [selectedRightId, setSelectedRightId] = useState<MatchingPairId | null>(
    null,
  );
  const [errorPair, setErrorPair] = useState<ErrorPair | null>(null);
  const [message, setMessage] = useState("");
  const [focusAfterMatchId, setFocusAfterMatchId] =
    useState<MatchingPairId | null>(null);
  const matchingRef = useRef<HTMLDivElement>(null);
  const pairById = useMemo(
    () => new Map(exercise.pairs.map((pair) => [pair.id, pair])),
    [exercise.pairs],
  );
  const visiblePairIds = useMemo(() => {
    const visibleCount = rolling
      ? Math.min(exercise.config.pairCount, 3 + matchedPairIds.length)
      : exercise.config.pairCount;
    return new Set(exercise.leftOrder.slice(0, visibleCount));
  }, [
    exercise.config.pairCount,
    exercise.leftOrder,
    matchedPairIds.length,
    rolling,
  ]);
  const leftPairIds = exercise.leftOrder.filter(
    (pairId) =>
      visiblePairIds.has(pairId) &&
      (!rolling || !matchedPairIds.includes(pairId)),
  );
  const rightPairIds = exercise.rightOrder.filter(
    (pairId) =>
      visiblePairIds.has(pairId) &&
      (!rolling || !matchedPairIds.includes(pairId)),
  );

  useEffect(() => {
    if (!errorPair) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setErrorPair(null);
      setMessage("");
    }, 1100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorPair]);

  useEffect(() => {
    if (focusAfterMatchId === null) {
      return;
    }
    if (!matchedPairIds.includes(focusAfterMatchId)) {
      setFocusAfterMatchId(null);
      return;
    }

    setFocusAfterMatchId(null);
    matchingRef.current
      ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
      ?.focus();
  }, [focusAfterMatchId, matchedPairIds]);

  function clearSelection() {
    setSelectedLeftId(null);
    setSelectedRightId(null);
  }

  function matchPair(left: MatchingPairId, right: MatchingPairId) {
    if (matchedPairIds.includes(left) || matchedPairIds.includes(right)) {
      clearSelection();
      return;
    }

    if (left === right) {
      const pair = pairById.get(left);
      setErrorPair(null);
      setFocusAfterMatchId(
        rolling && matchingRef.current?.contains(document.activeElement)
          ? left
          : null,
      );
      setMessage(
        pair ? `Matched ${pair.left} with ${pair.right}.` : "Matched.",
      );
      onPairAttempt(left);
    } else {
      setErrorPair({ left, right });
      setMessage("That pair doesn’t match. Try again.");
      onPairAttempt(null);
    }
    clearSelection();
  }

  function selectLeft(pairId: MatchingPairId) {
    if (selectedRightId !== null) {
      matchPair(pairId, selectedRightId);
    } else {
      setSelectedLeftId(pairId);
    }
  }

  function selectRight(pairId: MatchingPairId) {
    if (selectedLeftId !== null) {
      matchPair(selectedLeftId, pairId);
    } else {
      setSelectedRightId(pairId);
    }
  }

  return (
    <div className="words-practice__matching" ref={matchingRef}>
      <div
        aria-label="English meanings"
        className="words-practice__column"
        role="group"
      >
        {leftPairIds.map((pairId) => {
          const pair = pairById.get(pairId);
          if (!pair) return null;
          const matched = matchedPairIds.includes(pairId);
          return (
            <Button
              aria-pressed={selectedLeftId === pairId}
              className="words-practice__option"
              data-error={errorPair?.left === pairId}
              data-matched={matched}
              data-selected={selectedLeftId === pairId}
              disabled={matched}
              key={pairId}
              onClick={() => {
                selectLeft(pairId);
              }}
              variant="secondary"
            >
              <span>{pair.left}</span>
            </Button>
          );
        })}
      </div>
      <div
        aria-label="Japanese words"
        className="words-practice__column"
        role="group"
      >
        {rightPairIds.map((pairId) => {
          const pair = pairById.get(pairId);
          if (!pair) return null;
          const matched = matchedPairIds.includes(pairId);
          return (
            <Button
              aria-pressed={selectedRightId === pairId}
              className="words-practice__option words-practice__option--kana"
              data-error={errorPair?.right === pairId}
              data-matched={matched}
              data-selected={selectedRightId === pairId}
              disabled={matched}
              key={pairId}
              lang="ja"
              onClick={() => {
                selectRight(pairId);
              }}
              variant="secondary"
            >
              <span>{pair.right}</span>
            </Button>
          );
        })}
      </div>
      <p aria-live="polite" className="words-practice__feedback" role="status">
        {message}
      </p>
    </div>
  );
}
