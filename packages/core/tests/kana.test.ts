import { describe, expect, it } from "vitest";
import {
  checkKanaAnswer,
  hiraganaSyllabary,
  hiraganaVowels,
  katakanaSyllabary,
  normalizeKanaAnswer,
  recordKanaAnswer,
} from "../src/index";

describe("hiragana vowels", () => {
  it("provides the five stable vowel items in gojūon order", () => {
    expect(hiraganaVowels).toEqual([
      { id: "kana.hiragana.a", glyph: "あ", answer: "a" },
      { id: "kana.hiragana.i", glyph: "い", answer: "i" },
      { id: "kana.hiragana.u", glyph: "う", answer: "u" },
      { id: "kana.hiragana.e", glyph: "え", answer: "e" },
      { id: "kana.hiragana.o", glyph: "お", answer: "o" },
    ]);
  });
});

describe("basic Kana syllabaries", () => {
  it("provides stable identifiers for all 46 basic sounds in each script", () => {
    expect(hiraganaSyllabary).toHaveLength(46);
    expect(katakanaSyllabary).toHaveLength(46);
    expect(hiraganaSyllabary.map(({ glyph }) => glyph).join("")).toBe(
      "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
    );
    expect(katakanaSyllabary.map(({ glyph }) => glyph).join("")).toBe(
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
    );

    const ids = [
      ...hiraganaSyllabary.map(({ id }) => id),
      ...katakanaSyllabary.map(({ id }) => id),
    ];

    expect(new Set(ids).size).toBe(92);
    expect(hiraganaVowels.every(({ id }) => ids.includes(id))).toBe(true);
  });
});

describe("kana answer normalization and checking", () => {
  it("trims, compatibility-normalizes, and lowercases input", () => {
    expect(normalizeKanaAnswer("  Ａ  ")).toBe("a");
    expect(normalizeKanaAnswer("\u3000Ｉ\u3000")).toBe("i");
  });

  it("accepts normalized matching answers and rejects other answers", () => {
    expect(checkKanaAnswer(hiraganaVowels[0], " A ")).toBe(true);
    expect(checkKanaAnswer(hiraganaVowels[0], "Ａ")).toBe(true);
    expect(checkKanaAnswer(hiraganaVowels[0], "i")).toBe(false);
    expect(checkKanaAnswer(hiraganaVowels[0], " ")).toBe(false);
  });
});

describe("recordKanaAnswer", () => {
  it("starts immutable per-item progress with the explicit timestamp", () => {
    const item = hiraganaVowels[0];
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
    const item = hiraganaVowels[0];
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
      itemId: hiraganaVowels[1].id,
      correctCount: 0,
      incorrectCount: 1,
      lastAnsweredAt: "2026-09-25T12:00:00.000Z",
    } as const;

    expect(() =>
      recordKanaAnswer(
        existing,
        hiraganaVowels[0],
        true,
        "2026-09-26T12:00:00.000Z",
      ),
    ).toThrow(
      "Cannot update progress for kana.hiragana.a with progress for kana.hiragana.i",
    );
  });
});
