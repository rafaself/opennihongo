import type { ExerciseId } from "../ids";

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

export type KanaItem = Readonly<{
  id: KanaId;
  romanization: string;
}>;

export type KanaProgress = Readonly<{
  itemId: KanaId;
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

export type KanaWord = Readonly<{
  id: KanaWordId;
  hiragana: string;
  romaji: string;
}>;

export type KanaAudioId = KanaId | KanaWordId;

type KanaExerciseAudio = Readonly<{
  audioIds: readonly KanaAudioId[];
}>;

export type KanaChoiceExercise = Readonly<
  KanaExerciseAudio & {
    id: ExerciseId;
    kind: "multiple-choice";
    direction: "hiragana-to-romaji" | "romaji-to-hiragana";
    wordId: KanaWordId;
    prompt: Readonly<{ script: "hiragana" | "romaji"; text: string }>;
    choices: readonly string[];
    answer: string;
  }
>;

export type KanaTypedAnswerExercise = Readonly<
  KanaExerciseAudio & {
    id: ExerciseId;
    kind: "typed-answer";
    prompt: Readonly<{ script: "hiragana"; text: string }>;
    answer: string;
  }
>;

export type KanaMatchingExercise = Readonly<
  KanaExerciseAudio & {
    id: ExerciseId;
    kind: "matching-pairs";
    pairIds: readonly KanaWordId[];
  }
>;

export type KanaExercise =
  KanaChoiceExercise | KanaTypedAnswerExercise | KanaMatchingExercise;

export type KanaPairAnswer = Readonly<{
  romaji: string;
  hiragana: string;
}>;
