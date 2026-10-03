import { describe, expect, it } from "vitest";
import {
  normalizeKanaAnswer,
  evaluateTypedAnswer,
  type TypedAnswerExercise,
} from "../src/index";

const vowelA = { id: "kana.hiragana.a" } as const;
const exercise: TypedAnswerExercise = {
  id: "exercise.a",
  type: "typed-answer",
  prompt: { text: "あ" },
  acceptedAnswers: ["a"],
  sourceItemIds: [vowelA.id],
};

describe("kana answer normalization and checking", () => {
  it("trims, compatibility-normalizes, and lowercases input", () => {
    expect(normalizeKanaAnswer("  Ａ  ")).toBe("a");
    expect(normalizeKanaAnswer("\u3000Ｉ\u3000")).toBe("i");
  });

  it("accepts normalized matching answers and rejects other answers", () => {
    expect(
      evaluateTypedAnswer(exercise, " A ", normalizeKanaAnswer).outcome,
    ).toBe("correct");
    expect(
      evaluateTypedAnswer(exercise, "Ａ", normalizeKanaAnswer).outcome,
    ).toBe("correct");
    expect(
      evaluateTypedAnswer(exercise, "i", normalizeKanaAnswer).outcome,
    ).toBe("incorrect");
    expect(
      evaluateTypedAnswer(exercise, " ", normalizeKanaAnswer).outcome,
    ).toBe("incorrect");
  });
});
