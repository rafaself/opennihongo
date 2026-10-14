import {
  randomWithoutReplacementSelectionStrategyId,
  type SessionProfile,
} from "@opennihongo/core";

export type KanjiPracticeGame = "reading" | "matching" | "quiz" | "cards";
export type KanjiQuizFocus = "meanings" | "readings" | "mixed";
export const kanjiPracticeGames = {
  reading: {
    title: "Kanji reading",
    description: "Type each example word’s reading in Kana or romaji.",
    illustration: "山 → やま",
    defaultLength: 5,
  },
  matching: {
    title: "Kanji matching",
    description: "Connect Kanji with their English meanings.",
    illustration: "山 ↔ mountain",
    defaultLength: 5,
  },
  quiz: {
    title: "Kanji quiz",
    description: "Choose meanings, word readings, or a mix of both.",
    illustration: "日 · 月",
    defaultLength: 5,
  },
  cards: {
    title: "Kanji cards",
    description: "Recall meanings and readings, reveal, and rate your memory.",
    illustration: "山 / mountain",
    defaultLength: 10,
  },
} as const;

export const kanjiPracticeProfiles = {
  reading: {
    id: "kanji.practice.reading",
    targetSessionSize: 5,
    exerciseMix: [{ type: "typed-answer", count: 5 }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  },
  matching: {
    id: "kanji.practice.matching",
    targetSessionSize: 1,
    exerciseMix: [{ type: "matching", count: 1, config: { pairCount: 5 } }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  },
  quiz: {
    id: "kanji.practice.quiz",
    targetSessionSize: 5,
    exerciseMix: [{ type: "multiple-choice", count: 5 }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  },
} as const satisfies Record<string, SessionProfile>;
