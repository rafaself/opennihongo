import { expect, it } from "vitest";
import { normalizePracticeSearch } from "./practiceSearch";

it("defaults missing or malformed configuration and preserves explicit empty selections", () => {
  expect(normalizePracticeSearch({})).toEqual({
    scripts: ["hiragana"],
    categories: ["basic"],
    difficulty: "standard",
    direction: "random",
    fast: false,
  });
  expect(
    normalizePracticeSearch({
      scripts: "bad",
      categories: ["bad"],
      difficulty: "bad",
      length: 7,
      direction: "bad",
      fast: "true",
    }),
  ).toEqual(normalizePracticeSearch({}));
  expect(
    normalizePracticeSearch({ scripts: [], categories: [], characterIds: [] }),
  ).toMatchObject({ scripts: [], categories: [], characterIds: [] });
});

it("canonicalizes choices and prunes character identities outside the selected pool", () => {
  const parsed = normalizePracticeSearch({
    scripts: ["katakana", "hiragana", "katakana", "bad"],
    categories: ["small-tsu", "basic", "bad"],
    characterIds: [
      "katakana.basic.ア",
      "katakana.basic.ア",
      "hiragana.dakuten.が",
      "unknown",
    ],
    difficulty: "hard",
    length: 20,
    direction: "romaji",
    fast: true,
  });
  expect(parsed).toEqual({
    scripts: ["hiragana", "katakana"],
    categories: ["basic", "small-tsu"],
    characterIds: ["katakana.basic.ア"],
    difficulty: "hard",
    length: 20,
    direction: "romaji",
    fast: true,
  });
  expect(
    normalizePracticeSearch({ characterIds: ["unknown"] }).characterIds,
  ).toEqual([]);
});

it("preserves an explicit empty review selection and normalizes reloadable item IDs", () => {
  expect(normalizePracticeSearch({ reviewIds: [] }).reviewIds).toEqual([]);
  expect(
    normalizePracticeSearch({
      reviewIds: [
        "hiragana.basic.あ",
        1,
        "hiragana.basic.あ",
        "kanji.character.u4e00",
      ],
    }).reviewIds,
  ).toEqual(["hiragana.basic.あ", "kanji.character.u4e00"]);
  expect(
    normalizePracticeSearch({ reviewIds: "bad" }).reviewIds,
  ).toBeUndefined();
});
