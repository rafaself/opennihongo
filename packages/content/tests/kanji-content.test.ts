import { describe, expect, it } from "vitest";
import {
  beginnerKanji,
  kanjiCollections,
  kanjiThemes,
  kanjiPracticeGames,
  kanjiPracticeProfiles,
} from "../src/index";

describe("beginner Kanji content", () => {
  it("provides thirty distinct characters in three complete themed collections", () => {
    expect(beginnerKanji).toHaveLength(30);
    expect(new Set(beginnerKanji.map(({ id }) => id)).size).toBe(30);
    expect(new Set(beginnerKanji.map(({ glyph }) => glyph)).size).toBe(30);
    for (const theme of kanjiThemes) {
      expect(
        beginnerKanji.filter((item) => item.theme === theme.id),
      ).toHaveLength(10);
    }
    expect(Object.keys(kanjiCollections)).toEqual([
      "numbers",
      "nature",
      "people",
    ]);
    expect(kanjiCollections.numbers.map(({ glyph }) => glyph).join("")).toBe(
      "一二三四五六七八九十",
    );
    expect(kanjiCollections.nature.map(({ glyph }) => glyph).join("")).toBe(
      "日月火水木金土山川田",
    );
    expect(kanjiCollections.people.map(({ glyph }) => glyph).join("")).toBe(
      "人口目耳手足大小上下",
    );
  });
  it("authors contextual pronunciation and distinct answers for every character", () => {
    for (const item of beginnerKanji) {
      expect(item.example.text).toContain(item.glyph);
      expect(item.example.reading).toMatch(/^[\u3040-\u309f]+$/u);
      expect(item.example.romaji).not.toBe("");
      expect(item.example.meaning).not.toBe("");
      expect(item.example.pronunciation).toEqual({
        audioId: item.id,
        text: item.example.reading,
      });
      expect(item.meaning).not.toBe("");
      expect(item.onReadings.length + item.kunReadings.length).toBeGreaterThan(
        0,
      );
      expect(item.id).toMatch(/^kanji\.character\.u[0-9a-f]+$/u);
    }
    expect(new Set(beginnerKanji.map(({ meaning }) => meaning)).size).toBe(30);
    expect(
      new Set(beginnerKanji.map(({ example }) => example.reading)).size,
    ).toBe(30);
  });
  it("defines four games and graded session profiles", () => {
    expect(Object.keys(kanjiPracticeGames)).toEqual([
      "reading",
      "matching",
      "quiz",
      "cards",
    ]);
    expect(kanjiPracticeGames.cards.defaultLength).toBe(10);
    expect(kanjiPracticeProfiles.reading.exerciseMix[0].type).toBe(
      "typed-answer",
    );
    expect(kanjiPracticeProfiles.matching.exerciseMix[0].type).toBe("matching");
    expect(kanjiPracticeProfiles.quiz.exerciseMix[0].type).toBe(
      "multiple-choice",
    );
  });
});
