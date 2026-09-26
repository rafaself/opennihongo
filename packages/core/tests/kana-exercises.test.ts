import { describe, expect, it } from "vitest";
import {
  beginnerWordMatchingExercise,
  hiraganaToRomajiExercise,
  hiraganaToRomajiTypedExercise,
  kanaBeginnerWords,
  kanaExercises,
  romajiToHiraganaExercise,
  scoreKanaChoiceAnswer,
  scoreKanaMatchingAnswer,
  validateKanaChoiceAnswer,
  validateKanaMatchingAnswer,
} from "../src/index";

describe("curated beginner Kana exercises", () => {
  it("defines a truthful beginner word set and stable exercise prompts", () => {
    expect(kanaBeginnerWords).toEqual([
      { id: "kana.word.soto", hiragana: "そと", romaji: "soto" },
      { id: "kana.word.hato", hiragana: "はと", romaji: "hato" },
      { id: "kana.word.sato", hiragana: "さと", romaji: "sato" },
      { id: "kana.word.mimi", hiragana: "みみ", romaji: "mimi" },
      { id: "kana.word.neko", hiragana: "ねこ", romaji: "neko" },
    ]);
    expect(hiraganaToRomajiExercise).toEqual({
      id: "kana.exercise.soto-to-romaji",
      kind: "multiple-choice",
      direction: "hiragana-to-romaji",
      wordId: "kana.word.soto",
      prompt: { script: "hiragana", text: "そと" },
      choices: ["soto", "hato", "sato"],
      answer: "soto",
    });
    expect(romajiToHiraganaExercise).toEqual({
      id: "kana.exercise.soto-to-hiragana",
      kind: "multiple-choice",
      direction: "romaji-to-hiragana",
      wordId: "kana.word.soto",
      prompt: { script: "romaji", text: "soto" },
      choices: ["そと", "はと", "さと"],
      answer: "そと",
    });
    expect(hiraganaToRomajiTypedExercise).toEqual({
      id: "kana.exercise.shibyura-to-romaji-typed",
      kind: "typed-answer",
      prompt: { script: "hiragana", text: "しびゅら" },
      answer: "shibyura",
    });
    expect(beginnerWordMatchingExercise).toEqual({
      id: "kana.exercise.beginner-word-matching",
      kind: "matching-pairs",
      pairs: kanaBeginnerWords,
    });
    expect(kanaExercises).toEqual([
      hiraganaToRomajiExercise,
      romajiToHiraganaExercise,
      hiraganaToRomajiTypedExercise,
      beginnerWordMatchingExercise,
    ]);
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

describe("Kana pair-matching answer validation and scoring", () => {
  const completeAnswers = [
    { romaji: "soto", hiragana: "そと" },
    { romaji: "hato", hiragana: "はと" },
    { romaji: "sato", hiragana: "さと" },
    { romaji: "mimi", hiragana: "みみ" },
    { romaji: "neko", hiragana: "ねこ" },
  ] as const;

  it("accepts all correct pairs in any order and scores each pair", () => {
    const reversedAnswers = [...completeAnswers].reverse();

    expect(
      validateKanaMatchingAnswer(beginnerWordMatchingExercise, reversedAnswers),
    ).toBe(true);
    expect(
      scoreKanaMatchingAnswer(beginnerWordMatchingExercise, reversedAnswers),
    ).toBe(5);
  });

  it("normalizes answer text and awards partial credit only once per word", () => {
    expect(
      scoreKanaMatchingAnswer(beginnerWordMatchingExercise, [
        { romaji: " SOTO ", hiragana: "そと" },
        { romaji: "soto", hiragana: "そと" },
        { romaji: "hato", hiragana: "さと" },
      ]),
    ).toBe(1);
  });

  it("rejects wrong, unknown, duplicate, and incomplete pairings", () => {
    const wrongAnswers = [
      { romaji: "soto", hiragana: "はと" },
      { romaji: "hato", hiragana: "そと" },
      { romaji: "sato", hiragana: "さと" },
    ] as const;
    const duplicateAnswers = [
      { romaji: "soto", hiragana: "そと" },
      { romaji: "soto", hiragana: "そと" },
      { romaji: "sato", hiragana: "さと" },
    ] as const;

    expect(
      validateKanaMatchingAnswer(beginnerWordMatchingExercise, wrongAnswers),
    ).toBe(false);
    expect(
      validateKanaMatchingAnswer(
        beginnerWordMatchingExercise,
        duplicateAnswers,
      ),
    ).toBe(false);
    expect(
      validateKanaMatchingAnswer(
        beginnerWordMatchingExercise,
        completeAnswers.slice(0, 2),
      ),
    ).toBe(false);
    expect(
      scoreKanaMatchingAnswer(beginnerWordMatchingExercise, [
        { romaji: "unknown", hiragana: "そと" },
      ]),
    ).toBe(0);
  });
});
