import { expect, it } from "vitest";
import {
  getKanaPracticeTiles,
  updateKanaSelection,
  toggleKanaCharacters,
} from "./kanaPracticeSelection";

const selection = {
  scripts: ["hiragana"],
  categories: ["basic"],
  difficulty: "easy",
} as const;

it("combines selected scripts and groups, retaining distinct characters with equivalent readings", () => {
  const tiles = getKanaPracticeTiles({
    scripts: ["hiragana", "katakana"],
    categories: ["basic", "dakuten"],
  });
  expect(tiles.some(({ glyph }) => glyph === "あ")).toBe(true);
  expect(tiles.some(({ glyph }) => glyph === "ア")).toBe(true);
  expect(
    tiles.filter(({ romanization }) => romanization === "ji"),
  ).toHaveLength(4);
  expect(new Set(tiles.map(({ id }) => id)).size).toBe(tiles.length);
  expect(getKanaPracticeTiles({ ...selection, characterIds: [] })).toEqual([]);
  expect(
    getKanaPracticeTiles({
      ...selection,
      characterIds: ["hiragana.basic.あ"],
    }).map(({ glyph }) => glyph),
  ).toEqual(["あ"]);
});

it("adds new groups without losing individual choices and prunes removed groups", () => {
  const narrowed = { ...selection, characterIds: ["hiragana.basic.あ"] };
  const added = updateKanaSelection(narrowed, {
    scripts: ["hiragana", "katakana"],
    categories: ["basic", "small-tsu"],
  });
  expect(added.difficulty).toBe("easy");
  expect(added.characterIds).toContain("hiragana.basic.あ");
  expect(added.characterIds).not.toContain("hiragana.basic.い");
  expect(added.characterIds).toContain("katakana.basic.ア");
  expect(added.characterIds).toContain("hiragana.small-tsu.っ+k");
  const removed = updateKanaSelection(added, {
    scripts: ["hiragana"],
    categories: ["basic"],
  });
  expect(removed.characterIds).toEqual(["hiragana.basic.あ"]);
  expect(
    updateKanaSelection(selection, {
      scripts: ["katakana"],
      categories: ["basic"],
    }).characterIds,
  ).toBeUndefined();
});

it("toggles rows and individual characters without widening an empty selection", () => {
  const empty = { ...selection, characterIds: [] };
  const vowels = ["あ", "い", "う", "え", "お"].map(
    (glyph) => `hiragana.basic.${glyph}`,
  );
  expect(toggleKanaCharacters(empty, vowels, true).characterIds).toEqual(
    vowels.slice().sort(),
  );
  expect(
    toggleKanaCharacters(
      { ...empty, characterIds: vowels },
      ["hiragana.basic.あ"],
      false,
    ).characterIds,
  ).not.toContain(vowels[0]);
  expect(
    toggleKanaCharacters(selection, vowels, false).characterIds,
  ).toHaveLength(41);
});
