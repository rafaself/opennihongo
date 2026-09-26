import type { KanaWord } from "./types";

export const kanaBeginnerWords = [
  { id: "kana.word.soto", hiragana: "そと", romaji: "soto" },
  { id: "kana.word.hato", hiragana: "はと", romaji: "hato" },
  { id: "kana.word.sato", hiragana: "さと", romaji: "sato" },
] as const satisfies readonly KanaWord[];
