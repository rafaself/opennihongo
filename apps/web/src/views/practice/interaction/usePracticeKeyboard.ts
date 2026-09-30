import { useEffect } from "react";
import type { Exercise } from "@opennihongo/core";
export function usePracticeKeyboard({
  exercise,
  hasFeedback,
  readyToCheck,
  checkAnswer,
}: {
  exercise: Exercise | undefined;
  hasFeedback: boolean;
  readyToCheck: boolean;
  checkAnswer: () => void;
}) {
  useEffect(() => {
    if (!exercise || hasFeedback) {
      return;
    }

    function handlePrimaryActionKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing ||
        event.defaultPrevented
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (
        target.isContentEditable ||
        target.closest(
          "input, textarea, select, a[href], [contenteditable='true']",
        )
      ) {
        return;
      }

      const focusedButton = target.closest("button");
      const isAnswerOption = Boolean(
        focusedButton?.closest(".matching-board, .kana-quiz__options"),
      );
      if (focusedButton && !isAnswerOption) {
        return;
      }

      if (!readyToCheck) {
        return;
      }

      event.preventDefault();
      checkAnswer();
    }

    window.addEventListener("keydown", handlePrimaryActionKeyDown);
    return () => {
      window.removeEventListener("keydown", handlePrimaryActionKeyDown);
    };
  }, [checkAnswer, exercise, hasFeedback, readyToCheck]);
}
