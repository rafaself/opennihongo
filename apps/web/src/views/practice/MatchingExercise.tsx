import type { KanaMatchingExercise, KanaPairAnswer } from "@opennihongo/core";
import { Button, Text } from "@opennihongo/ui";
import { useCallback, useEffect, useMemo, useState } from "react";

type MatchingExerciseProps = {
  disabled: boolean;
  exercise: KanaMatchingExercise;
  matchedPairs: readonly KanaPairAnswer[];
  onPairMatched: (pair: KanaPairAnswer) => void;
};

const leftShortcuts = ["1", "2", "3", "4", "5"] as const;
const rightShortcuts = ["6", "7", "8", "9", "0"] as const;

export function MatchingExercise({
  disabled,
  exercise,
  matchedPairs,
  onPairMatched,
}: MatchingExerciseProps) {
  const [selectedRomaji, setSelectedRomaji] = useState<string | null>(null);
  const [selectedHiragana, setSelectedHiragana] = useState<string | null>(null);
  const [selectionMessage, setSelectionMessage] = useState("");
  const rightPairs = useMemo(
    () => [...exercise.pairs].reverse(),
    [exercise.pairs],
  );

  const matchPair = useCallback(
    (romaji: string, hiragana: string) => {
      const alreadyMatched = matchedPairs.some(
        (pair) => pair.romaji === romaji || pair.hiragana === hiragana,
      );
      if (alreadyMatched) {
        setSelectedRomaji(null);
        setSelectedHiragana(null);
        return;
      }

      const isCorrectPair = exercise.pairs.some(
        (pair) => pair.romaji === romaji && pair.hiragana === hiragana,
      );
      if (isCorrectPair) {
        onPairMatched({ romaji, hiragana });
        setSelectionMessage(`${romaji} matched with ${hiragana}.`);
      } else {
        setSelectionMessage("Those words do not match. Try a different pair.");
      }
      setSelectedRomaji(null);
      setSelectedHiragana(null);
    },
    [exercise.pairs, matchedPairs, onPairMatched],
  );

  const selectRomaji = useCallback(
    (romaji: string) => {
      if (selectedHiragana) {
        matchPair(romaji, selectedHiragana);
      } else {
        setSelectedRomaji(romaji);
        setSelectionMessage("");
      }
    },
    [matchPair, selectedHiragana],
  );

  const selectHiragana = useCallback(
    (hiragana: string) => {
      if (selectedRomaji) {
        matchPair(selectedRomaji, hiragana);
      } else {
        setSelectedHiragana(hiragana);
        setSelectionMessage("");
      }
    },
    [matchPair, selectedRomaji],
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
        const pair = exercise.pairs[leftIndex];
        if (
          !pair ||
          matchedPairs.some((matched) => matched.romaji === pair.romaji)
        ) {
          return;
        }
        event.preventDefault();
        selectRomaji(pair.romaji);
        return;
      }

      const rightIndex = rightShortcuts.findIndex(
        (shortcut) => shortcut === event.key,
      );
      if (rightIndex >= 0) {
        const pair = rightPairs[rightIndex];
        if (
          !pair ||
          matchedPairs.some((matched) => matched.hiragana === pair.hiragana)
        ) {
          return;
        }
        event.preventDefault();
        selectHiragana(pair.hiragana);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    disabled,
    exercise.pairs,
    matchedPairs,
    rightPairs,
    selectHiragana,
    selectRomaji,
  ]);

  return (
    <>
      <div className="practice-session__matching">
        <div
          aria-label="Romaji readings"
          className="practice-session__match-column"
        >
          <Text as="h2" variant="label">
            Romaji
          </Text>
          {exercise.pairs.map(({ id, romaji }, index) => {
            const matched = matchedPairs.some((pair) => pair.romaji === romaji);
            const shortcut = leftShortcuts[index];
            return (
              <Button
                aria-keyshortcuts={shortcut}
                aria-pressed={selectedRomaji === romaji}
                className="practice-session__match-option"
                data-matched={matched}
                data-selected={selectedRomaji === romaji}
                disabled={matched || disabled}
                key={id}
                onClick={() => {
                  selectRomaji(romaji);
                }}
                variant="secondary"
              >
                <span
                  aria-hidden="true"
                  className="practice-session__choice-number"
                >
                  {shortcut}
                </span>
                <span>{romaji}</span>
                <span aria-hidden="true" />
              </Button>
            );
          })}
        </div>
        <div
          aria-label="Hiragana words"
          className="practice-session__match-column"
        >
          <Text as="h2" variant="label">
            Hiragana
          </Text>
          {rightPairs.map(({ id, hiragana }, index) => {
            const matched = matchedPairs.some(
              (pair) => pair.hiragana === hiragana,
            );
            const shortcut = rightShortcuts[index];
            return (
              <Button
                aria-keyshortcuts={shortcut}
                aria-pressed={selectedHiragana === hiragana}
                className="practice-session__match-option practice-session__match-option--kana"
                data-matched={matched}
                data-selected={selectedHiragana === hiragana}
                disabled={matched || disabled}
                key={id}
                onClick={() => {
                  selectHiragana(hiragana);
                }}
                variant="secondary"
              >
                <span
                  aria-hidden="true"
                  className="practice-session__choice-number"
                >
                  {shortcut}
                </span>
                <span>{hiragana}</span>
                <span aria-hidden="true" />
              </Button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className="practice-session__match-status">
        {selectionMessage ||
          `${String(matchedPairs.length)} of ${String(exercise.pairs.length)} pairs matched`}
      </p>
    </>
  );
}
