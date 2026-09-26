export type KanaId =
  | "kana.hiragana.a"
  | "kana.hiragana.i"
  | "kana.hiragana.u"
  | "kana.hiragana.e"
  | "kana.hiragana.o";

export type KanaItem = Readonly<{
  id: KanaId;
  glyph: string;
  answer: string;
}>;

export type KanaProgress = Readonly<{
  itemId: KanaId;
  correctCount: number;
  incorrectCount: number;
  lastAnsweredAt: string;
}>;
