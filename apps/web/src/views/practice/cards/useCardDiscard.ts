import type { FlashcardExercise } from "@opennihongo/core";
import { useEffect, useState } from "react";

export const cardDiscardDurationMs = 320;

type CardDiscard = {
  card: FlashcardExercise;
  revealed: boolean;
  direction: "left" | "right" | "down";
};

export function useCardDiscard() {
  const [discard, setDiscard] = useState<CardDiscard | null>(null);

  useEffect(() => {
    if (!discard) return;
    const timer = window.setTimeout(() => {
      setDiscard(null);
    }, cardDiscardDurationMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [discard]);

  function startDiscard(
    card: FlashcardExercise,
    revealed: boolean,
    direction: CardDiscard["direction"],
  ) {
    const reducedMotion =
      document.documentElement.dataset["motion"] === "reduced" ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setDiscard(reducedMotion ? null : { card, revealed, direction });
  }

  function resetDiscard() {
    setDiscard(null);
  }

  return { discard, startDiscard, resetDiscard };
}
