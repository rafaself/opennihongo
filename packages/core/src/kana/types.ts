import type { LearningItemId } from "../ids";

type KanaSyllable =
  | "a"
  | "i"
  | "u"
  | "e"
  | "o"
  | "ka"
  | "ki"
  | "ku"
  | "ke"
  | "ko"
  | "sa"
  | "shi"
  | "su"
  | "se"
  | "so"
  | "ta"
  | "chi"
  | "tsu"
  | "te"
  | "to"
  | "na"
  | "ni"
  | "nu"
  | "ne"
  | "no"
  | "ha"
  | "hi"
  | "fu"
  | "he"
  | "ho"
  | "ma"
  | "mi"
  | "mu"
  | "me"
  | "mo"
  | "ya"
  | "yu"
  | "yo"
  | "ra"
  | "ri"
  | "ru"
  | "re"
  | "ro"
  | "wa"
  | "wo"
  | "n";

export type KanaId =
  `kana.hiragana.${KanaSyllable}` | `kana.katakana.${KanaSyllable}`;

export type KanaProgress = Readonly<{
  itemId: LearningItemId;
  correctCount: number;
  incorrectCount: number;
  lastAnsweredAt: string;
}>;

export type KanaWordId =
  | "kana.word.soto"
  | "kana.word.hato"
  | "kana.word.sato"
  | "kana.word.mimi"
  | "kana.word.neko";

export type KanaAudioId = KanaId | KanaWordId;
