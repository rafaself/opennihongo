import { kanaBeginnerWords } from "./words";
import type {
  KanaChoiceExercise,
  KanaExercise,
  KanaMatchingExercise,
  KanaTypedAnswerExercise,
} from "./types";

export const hiraganaToRomajiExercise = {
  id: "kana.exercise.soto-to-romaji",
  kind: "multiple-choice",
  direction: "hiragana-to-romaji",
  wordId: "kana.word.soto",
  prompt: { script: "hiragana", text: "そと" },
  choices: ["soto", "hato", "sato"],
  answer: "soto",
} as const satisfies KanaChoiceExercise;

export const romajiToHiraganaExercise = {
  id: "kana.exercise.soto-to-hiragana",
  kind: "multiple-choice",
  direction: "romaji-to-hiragana",
  wordId: "kana.word.soto",
  prompt: { script: "romaji", text: "soto" },
  choices: ["そと", "はと", "さと"],
  answer: "そと",
} as const satisfies KanaChoiceExercise;

export const hiraganaToRomajiTypedExercise = {
  id: "kana.exercise.shibyura-to-romaji-typed",
  kind: "typed-answer",
  prompt: { script: "hiragana", text: "しびゅら" },
  answer: "shibyura",
} as const satisfies KanaTypedAnswerExercise;

export const beginnerWordMatchingExercise = {
  id: "kana.exercise.beginner-word-matching",
  kind: "matching-pairs",
  pairs: kanaBeginnerWords,
} as const satisfies KanaMatchingExercise;

export const kanaExercises = [
  hiraganaToRomajiExercise,
  romajiToHiraganaExercise,
  hiraganaToRomajiTypedExercise,
  beginnerWordMatchingExercise,
] as const satisfies readonly KanaExercise[];
