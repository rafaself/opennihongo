import { describe, expect, it } from "vitest";
import {
  normalizeKanaAnswer,
  recordKanaItemResult,
  evaluateTypedAnswer,
  type TypedAnswerExercise,
} from "../src/index";

const vowelA = { id: "kana.hiragana.a" } as const;
const vowelI = { id: "kana.hiragana.i" } as const;
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

describe("recordKanaItemResult", () => {
  it("starts immutable per-item progress with the explicit timestamp", () => {
    const item = vowelA;
    const result = recordKanaItemResult(
      undefined,
      { sourceItemId: item.id, outcome: "correct" },
      "2026-09-26T12:00:00.000Z",
    );

    expect(result).toEqual({
      itemId: item.id,
      correctCount: 1,
      incorrectCount: 0,
      lastAnsweredAt: "2026-09-26T12:00:00.000Z",
    });
  });

  it("increments the matching count without mutating existing progress", () => {
    const item = vowelA;
    const existing = {
      itemId: item.id,
      correctCount: 2,
      incorrectCount: 1,
      lastAnsweredAt: "2026-09-25T12:00:00.000Z",
    } as const;
    const result = recordKanaItemResult(
      existing,
      { sourceItemId: item.id, outcome: "incorrect" },
      "2026-09-26T12:00:00.000Z",
    );

    expect(result).toEqual({
      itemId: item.id,
      correctCount: 2,
      incorrectCount: 2,
      lastAnsweredAt: "2026-09-26T12:00:00.000Z",
    });
    expect(result).not.toBe(existing);
    expect(existing.incorrectCount).toBe(1);
    expect(existing.lastAnsweredAt).toBe("2026-09-25T12:00:00.000Z");
  });

  it("rejects progress that belongs to a different kana item", () => {
    const existing = {
      itemId: vowelI.id,
      correctCount: 0,
      incorrectCount: 1,
      lastAnsweredAt: "2026-09-25T12:00:00.000Z",
    } as const;

    expect(() =>
      recordKanaItemResult(
        existing,
        { sourceItemId: vowelA.id, outcome: "correct" },
        "2026-09-26T12:00:00.000Z",
      ),
    ).toThrow(
      "Cannot update progress for kana.hiragana.a with progress for kana.hiragana.i",
    );
  });
});
