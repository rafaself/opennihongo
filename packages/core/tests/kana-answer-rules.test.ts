import { describe, expect, it } from "vitest";
import {
  scoreKanaChoiceAnswer,
  scoreKanaMatchingAnswer,
  scoreKanaTypedAnswer,
  validateKanaChoiceAnswer,
  validateKanaMatchingAnswer,
  validateKanaTypedAnswer,
  type KanaChoiceExercise,
  type KanaTypedAnswerExercise,
} from "../src/index";

const hiraganaToRomajiExercise: KanaChoiceExercise = {
  id: "test.hiragana-to-romaji",
  kind: "multiple-choice",
  direction: "hiragana-to-romaji",
  wordId: "kana.word.soto",
  audioIds: ["kana.word.soto"],
  prompt: { script: "hiragana", text: "そと" },
  choices: ["soto", "hato", "sato"],
  answer: "soto",
};
const romajiToHiraganaExercise: KanaChoiceExercise = {
  id: "test.romaji-to-hiragana",
  kind: "multiple-choice",
  direction: "romaji-to-hiragana",
  wordId: "kana.word.soto",
  audioIds: [],
  prompt: { script: "romaji", text: "soto" },
  choices: ["そと", "はと", "さと"],
  answer: "そと",
};
const hiraganaToRomajiTypedExercise: KanaTypedAnswerExercise = {
  id: "test.hiragana-typed-answer",
  kind: "typed-answer",
  audioIds: [],
  prompt: { script: "hiragana", text: "しびゅら" },
  answer: "shibyura",
};

const matchingPairContent = [
  { hiragana: "かな甲", romaji: "kana-a" },
  { hiragana: "かな乙", romaji: "kana-b" },
  { hiragana: "かな丙", romaji: "kana-c" },
] as const;

describe("Kana typed-answer validation and scoring", () => {
  it("accepts normalized readings and awards no points for incorrect answers", () => {
    expect(
      validateKanaTypedAnswer(hiraganaToRomajiTypedExercise, " SHIBYURA "),
    ).toBe(true);
    expect(
      validateKanaTypedAnswer(hiraganaToRomajiTypedExercise, "wrong"),
    ).toBe(false);
    expect(
      scoreKanaTypedAnswer(hiraganaToRomajiTypedExercise, "shibyura"),
    ).toBe(1);
    expect(scoreKanaTypedAnswer(hiraganaToRomajiTypedExercise, "wrong")).toBe(
      0,
    );
  });
});

describe("Kana multiple-choice answer validation and scoring", () => {
  it("accepts a normalized available correct choice in either direction", () => {
    expect(validateKanaChoiceAnswer(hiraganaToRomajiExercise, " SOTO ")).toBe(
      true,
    );
    expect(validateKanaChoiceAnswer(romajiToHiraganaExercise, " そと ")).toBe(
      true,
    );
    expect(scoreKanaChoiceAnswer(hiraganaToRomajiExercise, "soto")).toBe(1);
  });

  it("rejects distractors, blank input, and a correct answer that is not offered", () => {
    expect(validateKanaChoiceAnswer(hiraganaToRomajiExercise, "hato")).toBe(
      false,
    );
    expect(validateKanaChoiceAnswer(hiraganaToRomajiExercise, " ")).toBe(false);
    expect(
      validateKanaChoiceAnswer(
        { ...hiraganaToRomajiExercise, choices: ["hato", "sato"] },
        "soto",
      ),
    ).toBe(false);
    expect(scoreKanaChoiceAnswer(hiraganaToRomajiExercise, "sato")).toBe(0);
  });
});

describe("Kana typed answer validation and scoring", () => {
  it("accepts normalized correct answers and rejects incorrect answers", () => {
    expect(
      validateKanaTypedAnswer(hiraganaToRomajiTypedExercise, " SHIBYURA "),
    ).toBe(true);
    expect(
      scoreKanaTypedAnswer(hiraganaToRomajiTypedExercise, "shibyura"),
    ).toBe(1);
    expect(
      validateKanaTypedAnswer(hiraganaToRomajiTypedExercise, "shibyuri"),
    ).toBe(false);
    expect(
      scoreKanaTypedAnswer(hiraganaToRomajiTypedExercise, "shibyuri"),
    ).toBe(0);
  });
});

describe("Kana pair-matching answer validation and scoring", () => {
  const completeAnswers = matchingPairContent.map(({ romaji, hiragana }) => ({
    romaji,
    hiragana,
  }));

  it("accepts all correct pairs in any order and scores each pair", () => {
    const reversedAnswers = [...completeAnswers].reverse();

    expect(
      validateKanaMatchingAnswer(matchingPairContent, reversedAnswers),
    ).toBe(true);
    expect(scoreKanaMatchingAnswer(matchingPairContent, reversedAnswers)).toBe(
      3,
    );
  });

  it("normalizes answer text and awards partial credit only once per word", () => {
    expect(
      scoreKanaMatchingAnswer(matchingPairContent, [
        { romaji: " KANA-A ", hiragana: "かな甲" },
        { romaji: "kana-a", hiragana: "かな甲" },
        { romaji: "kana-b", hiragana: "かな丙" },
      ]),
    ).toBe(1);
  });

  it("rejects wrong, unknown, duplicate, and incomplete pairings", () => {
    const wrongAnswers = [
      { romaji: "kana-a", hiragana: "かな乙" },
      { romaji: "kana-b", hiragana: "かな甲" },
      { romaji: "kana-c", hiragana: "かな丙" },
    ] as const;
    const duplicateAnswers = [
      { romaji: "kana-a", hiragana: "かな甲" },
      { romaji: "kana-a", hiragana: "かな甲" },
      { romaji: "kana-c", hiragana: "かな丙" },
    ] as const;

    expect(validateKanaMatchingAnswer(matchingPairContent, wrongAnswers)).toBe(
      false,
    );
    expect(
      validateKanaMatchingAnswer(matchingPairContent, duplicateAnswers),
    ).toBe(false);
    expect(
      validateKanaMatchingAnswer(
        matchingPairContent,
        completeAnswers.slice(0, 2),
      ),
    ).toBe(false);
    expect(
      scoreKanaMatchingAnswer(matchingPairContent, [
        { romaji: "unknown", hiragana: "かな甲" },
      ]),
    ).toBe(0);
  });
});
