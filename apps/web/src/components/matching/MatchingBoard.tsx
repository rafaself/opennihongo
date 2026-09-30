import type { MatchingExercise, MatchingPairId } from "@opennihongo/core";
import { Button } from "@opennihongo/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardShortcut } from "../keyboard/KeyboardShortcut";
import "./MatchingBoard.css";

type MatchingBoardProps = Readonly<{
  exercise: MatchingExercise;
  matchedPairIds: readonly MatchingPairId[];
  onPairAttempt: (pairId: MatchingPairId | null) => void;
  leftLabel: string;
  rightLabel: string;
  disabled?: boolean;
  rolling?: boolean;
  announceFeedback?: boolean;
}>;

type ErrorPair = Readonly<{
  left: MatchingPairId;
  right: MatchingPairId;
}>;

const leftShortcuts = ["1", "2", "3", "4", "5"] as const;
const rightShortcuts = ["6", "7", "8", "9", "0"] as const;

export function MatchingBoard({
  exercise,
  matchedPairIds,
  onPairAttempt,
  leftLabel,
  rightLabel,
  disabled = false,
  rolling = false,
  announceFeedback = false,
}: MatchingBoardProps) {
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
  const boardRef = useRef<HTMLDivElement>(null);
  const pairById = useMemo(
    () => new Map(exercise.pairs.map((pair) => [pair.id, pair])),
    [exercise.pairs],
  );
  const visiblePairIds = useMemo(() => {
    const count = rolling
      ? Math.min(exercise.config.pairCount, 3 + matchedPairIds.length)
      : exercise.config.pairCount;
    return new Set(exercise.leftOrder.slice(0, count));
  }, [
    exercise.config.pairCount,
    exercise.leftOrder,
    matchedPairIds.length,
    rolling,
  ]);
  const leftPairs = useMemo(
    () =>
      resolvePairOrder(exercise.leftOrder, pairById).filter(
        (pair) =>
          visiblePairIds.has(pair.id) &&
          (!rolling || !matchedPairIds.includes(pair.id)),
      ),
    [exercise.leftOrder, matchedPairIds, pairById, rolling, visiblePairIds],
  );
  const rightPairs = useMemo(
    () =>
      resolvePairOrder(exercise.rightOrder, pairById).filter(
        (pair) =>
          visiblePairIds.has(pair.id) &&
          (!rolling || !matchedPairIds.includes(pair.id)),
      ),
    [exercise.rightOrder, matchedPairIds, pairById, rolling, visiblePairIds],
  );

  useEffect(() => {
    if (!errorPair) return;
    const timeoutId = window.setTimeout(() => {
      setErrorPair(null);
      setMessage("");
    }, 1000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [errorPair]);

  useEffect(() => {
    if (focusAfterMatchId === null) return;
    if (!matchedPairIds.includes(focusAfterMatchId)) {
      setFocusAfterMatchId(null);
      return;
    }
    setFocusAfterMatchId(null);
    boardRef.current
      ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
      ?.focus();
  }, [focusAfterMatchId, matchedPairIds]);

  const matchPair = useCallback(
    (leftId: MatchingPairId, rightId: MatchingPairId) => {
      if (matchedPairIds.includes(leftId) || matchedPairIds.includes(rightId)) {
        setSelectedLeftId(null);
        setSelectedRightId(null);
        return;
      }
      if (leftId === rightId) {
        const pair = pairById.get(leftId);
        setErrorPair(null);
        setFocusAfterMatchId(
          rolling && boardRef.current?.contains(document.activeElement)
            ? leftId
            : null,
        );
        setMessage(
          pair ? `Matched ${pair.left} with ${pair.right}.` : "Matched.",
        );
        onPairAttempt(leftId);
      } else {
        setErrorPair({ left: leftId, right: rightId });
        setMessage("That pair doesn’t match. Try again.");
        onPairAttempt(null);
      }
      setSelectedLeftId(null);
      setSelectedRightId(null);
    },
    [matchedPairIds, onPairAttempt, pairById, rolling],
  );

  const selectLeft = useCallback(
    (pairId: MatchingPairId) => {
      if (selectedRightId !== null) matchPair(pairId, selectedRightId);
      else setSelectedLeftId(pairId);
    },
    [matchPair, selectedRightId],
  );
  const selectRight = useCallback(
    (pairId: MatchingPairId) => {
      if (selectedLeftId !== null) matchPair(selectedLeftId, pairId);
      else setSelectedRightId(pairId);
    },
    [matchPair, selectedLeftId],
  );

  useEffect(() => {
    if (disabled) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.defaultPrevented
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, [contenteditable='true']"))
      )
        return;
      const leftIndex = leftShortcuts.findIndex((key) => key === event.key);
      if (leftIndex >= 0) {
        const pair = leftPairs[leftIndex];
        if (!pair || matchedPairIds.includes(pair.id)) return;
        event.preventDefault();
        selectLeft(pair.id);
        return;
      }
      const rightIndex = rightShortcuts.findIndex((key) => key === event.key);
      if (rightIndex >= 0) {
        const pair = rightPairs[rightIndex];
        if (!pair || matchedPairIds.includes(pair.id)) return;
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
    <div className="matching-board" ref={boardRef}>
      <div
        aria-label={leftLabel}
        className="matching-board__column"
        role="group"
      >
        {leftPairs.map((pair, index) => {
          const shortcut = leftShortcuts[index];
          const matched = matchedPairIds.includes(pair.id);
          return (
            <Button
              aria-keyshortcuts={shortcut}
              aria-pressed={selectedLeftId === pair.id}
              className="matching-board__option"
              data-error={errorPair?.left === pair.id}
              data-matched={matched}
              data-selected={selectedLeftId === pair.id}
              disabled={matched || disabled}
              key={pair.id}
              onClick={() => {
                selectLeft(pair.id);
              }}
              variant="secondary"
            >
              <KeyboardShortcut>{shortcut}</KeyboardShortcut>
              <span>{pair.left}</span>
              <span aria-hidden="true" />
            </Button>
          );
        })}
      </div>
      <div
        aria-label={rightLabel}
        className="matching-board__column"
        role="group"
      >
        {rightPairs.map((pair, index) => {
          const shortcut = rightShortcuts[index];
          const matched = matchedPairIds.includes(pair.id);
          return (
            <Button
              aria-keyshortcuts={shortcut}
              aria-pressed={selectedRightId === pair.id}
              className="matching-board__option matching-board__option--kana"
              data-error={errorPair?.right === pair.id}
              data-matched={matched}
              data-selected={selectedRightId === pair.id}
              disabled={matched || disabled}
              key={pair.id}
              lang="ja"
              onClick={() => {
                selectRight(pair.id);
              }}
              variant="secondary"
            >
              <KeyboardShortcut>{shortcut}</KeyboardShortcut>
              <span>{pair.right}</span>
              <span aria-hidden="true" />
            </Button>
          );
        })}
      </div>
      {announceFeedback && (
        <p
          aria-live="polite"
          className="matching-board__feedback"
          role="status"
        >
          {message}
        </p>
      )}
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
