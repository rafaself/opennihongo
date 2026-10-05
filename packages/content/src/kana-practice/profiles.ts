import {
  randomWithoutReplacementSelectionStrategyId,
  type SessionProfile,
} from "@opennihongo/core";

/** Base profiles; configurable games adapt their lengths and difficulty. */
export const kanaPracticeSessionProfiles = {
  reading: {
    id: "kana.practice.reading",
    targetSessionSize: 5,
    exerciseMix: [{ type: "typed-answer", count: 5 }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  },
  quiz: {
    id: "kana.practice.quiz",
    targetSessionSize: 5,
    exerciseMix: [{ type: "multiple-choice", count: 5 }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  },
  matching: {
    id: "kana.practice.matching",
    targetSessionSize: 1,
    exerciseMix: [{ type: "matching", count: 1, config: { pairCount: 5 } }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  },
} as const satisfies Record<string, SessionProfile>;

export type KanaPracticeMode = keyof typeof kanaPracticeSessionProfiles;

export type KanaQuizDirection = "random" | "character" | "romaji";
