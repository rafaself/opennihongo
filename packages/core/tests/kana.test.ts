import { describe, expect, it } from "vitest";
import {
  checkKanaAnswer,
  normalizeKanaAnswer,
  recordKanaAnswer,
  type KanaItem,
} from "../src/index";

const vowelA: KanaItem = { id: "kana.hiragana.a", romanization: "a" };
const vowelI: KanaItem = { id: "kana.hiragana.i", romanization: "i" };

describe("kana answer normalization and checking", () => {
  it("trims, compatibility-normalizes, and lowercases input", () => {
    expect(normalizeKanaAnswer("  Ａ  ")).toBe("a");
    expect(normalizeKanaAnswer("\u3000Ｉ\u3000")).toBe("i");
  });

  it("accepts normalized matching answers and rejects other answers", () => {
    expect(checkKanaAnswer(vowelA, " A ")).toBe(true);
    expect(checkKanaAnswer(vowelA, "Ａ")).toBe(true);
    expect(checkKanaAnswer(vowelA, "i")).toBe(false);
    expect(checkKanaAnswer(vowelA, " ")).toBe(false);
  });
});

describe("recordKanaAnswer", () => {
  it("starts immutable per-item progress with the explicit timestamp", () => {
    const item = vowelA;
    const result = recordKanaAnswer(
      undefined,
      item,
      true,
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
    const result = recordKanaAnswer(
      existing,
      item,
      false,
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
      recordKanaAnswer(existing, vowelA, true, "2026-09-26T12:00:00.000Z"),
    ).toThrow(
      "Cannot update progress for kana.hiragana.a with progress for kana.hiragana.i",
    );
  });
});
