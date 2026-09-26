import type { KanaWord } from "./types";

export const kanaBeginnerWords = [
  { id: "kana.word.soto", hiragana: "そと", romaji: "soto" },
  { id: "kana.word.hato", hiragana: "はと", romaji: "hato" },
  { id: "kana.word.sato", hiragana: "さと", romaji: "sato" },
  { id: "kana.word.mimi", hiragana: "みみ", romaji: "mimi" },
  { id: "kana.word.neko", hiragana: "ねこ", romaji: "neko" },
] as const satisfies readonly KanaWord[];
