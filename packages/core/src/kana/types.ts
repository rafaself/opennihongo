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

export type KanaWordId = "kana.word.soto" | "kana.word.hato" | "kana.word.sato";

export type KanaWord = Readonly<{
  id: KanaWordId;
  hiragana: string;
  romaji: string;
}>;

export type KanaChoiceExercise = Readonly<{
  id: string;
  kind: "multiple-choice";
  direction: "hiragana-to-romaji" | "romaji-to-hiragana";
  wordId: KanaWordId;
  prompt: Readonly<{ script: "hiragana" | "romaji"; text: string }>;
  choices: readonly string[];
  answer: string;
}>;

export type KanaMatchingExercise = Readonly<{
  id: string;
  kind: "matching-pairs";
  pairs: readonly KanaWord[];
}>;

export type KanaExercise = KanaChoiceExercise | KanaMatchingExercise;

export type KanaPairAnswer = Readonly<{
  romaji: string;
  hiragana: string;
}>;
