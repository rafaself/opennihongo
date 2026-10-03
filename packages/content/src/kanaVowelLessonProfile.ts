import {
  orderedSelectionStrategyId,
  type SessionProfile,
} from "@opennihongo/core";

/** The saved first lesson practices each authored vowel once in its original order. */
export const kanaVowelLessonProfile = {
  id: "kana.lesson.vowels",
  targetSessionSize: 5,
  exerciseMix: [{ type: "typed-answer", count: 5 }],
  selectionStrategyId: orderedSelectionStrategyId,
} as const satisfies SessionProfile;
