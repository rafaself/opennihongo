import type { KanaItem } from "./types";

export const hiraganaVowels = [
  { id: "kana.hiragana.a", glyph: "あ", answer: "a" },
  { id: "kana.hiragana.i", glyph: "い", answer: "i" },
  { id: "kana.hiragana.u", glyph: "う", answer: "u" },
  { id: "kana.hiragana.e", glyph: "え", answer: "e" },
  { id: "kana.hiragana.o", glyph: "お", answer: "o" },
] as const satisfies readonly KanaItem[];
