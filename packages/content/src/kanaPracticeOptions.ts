import type { KanaPracticeMode } from "./kanaPracticeProfile";

export type KanaPracticeGame = KanaPracticeMode | "cards";
export type KanaPracticeDifficulty = "easy" | "standard" | "hard";
export type KanaPracticeLength = 5 | 10 | 20;

export const kanaPracticeLengths = [5, 10, 20] as const;
export const kanaPracticeDifficulties = {
  easy: { label: "Easy", quizChoices: 2, matchingPairs: 3 },
  standard: { label: "Standard", quizChoices: 4, matchingPairs: 4 },
  hard: { label: "Hard", quizChoices: 6, matchingPairs: 5 },
} as const;

export const kanaPracticeGames = {
  reading: {
    title: "Kana reading",
    description: "Type the romaji reading for each character.",
    illustration: "あ → a",
    defaultLength: 5,
  },
  matching: {
    title: "Kana matching",
    description: "Connect characters with their matching sounds.",
    illustration: "あ ↔ a",
    defaultLength: 5,
  },
  quiz: {
    title: "Kana quiz",
    description: "Choose the right character or reading.",
    illustration: "あ · ア",
    defaultLength: 5,
  },
  cards: {
    title: "Kana cards",
    description: "Recall, reveal, and rate what you remember.",
    illustration: "あ / a",
    defaultLength: 10,
  },
} as const satisfies Record<
  KanaPracticeGame,
  {
    title: string;
    description: string;
    illustration: string;
    defaultLength: KanaPracticeLength;
  }
>;
