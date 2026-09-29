import { describe, expect, it } from "vitest";
import {
  hiraganaSyllabary,
  hiraganaVowels,
  kanaBeginnerWords,
  kanaCharacterCharts,
  katakanaSyllabary,
} from "../src/index";

const sectionIds = [
  "basic",
  "dakuten",
  "combinations",
  "small-tsu",
  "long-vowels",
] as const;

function chartTiles(script: "hiragana" | "katakana") {
  return kanaCharacterCharts[script].sections.flatMap(({ rows }) =>
    rows.flatMap((row) => row.filter((tile) => tile !== null)),
  );
}

function rowShapes(script: "hiragana" | "katakana") {
  return kanaCharacterCharts[script].sections.map(({ rows }) =>
    rows.map((row) => row.map((tile) => (tile === null ? "." : "#")).join("")),
  );
}

describe("authored Kana characters", () => {
  it("preserves both 46-character syllabaries and stable item identities", () => {
    expect(hiraganaSyllabary).toHaveLength(46);
    expect(katakanaSyllabary).toHaveLength(46);
    expect(hiraganaSyllabary.map(({ glyph }) => glyph).join("")).toBe(
      "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん",
    );
    expect(katakanaSyllabary.map(({ glyph }) => glyph).join("")).toBe(
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン",
    );

    for (const [script, characters] of [
      ["hiragana", hiraganaSyllabary],
      ["katakana", katakanaSyllabary],
    ] as const) {
      expect(new Set(characters.map(({ id }) => id)).size).toBe(46);
      expect(
        characters.map(({ id }) =>
          id.slice("kana.".length + script.length + 1),
        ),
      ).toEqual(characters.map(({ romanization }) => romanization));
      expect(characters.every(({ category }) => category === "basic")).toBe(
        true,
      );
    }

    expect(
      hiraganaVowels.map(({ id, glyph, romanization }) => [
        id,
        glyph,
        romanization,
      ]),
    ).toEqual([
      ["kana.hiragana.a", "あ", "a"],
      ["kana.hiragana.i", "い", "i"],
      ["kana.hiragana.u", "う", "u"],
      ["kana.hiragana.e", "え", "e"],
      ["kana.hiragana.o", "お", "o"],
    ]);
  });

  it("preserves beginner word identities, readings, and order", () => {
    expect(kanaBeginnerWords).toEqual([
      {
        id: "kana.word.soto",
        hiragana: "そと",
        romanization: "soto",
        pronunciation: { text: "そと" },
      },
      {
        id: "kana.word.hato",
        hiragana: "はと",
        romanization: "hato",
        pronunciation: { text: "はと" },
      },
      {
        id: "kana.word.sato",
        hiragana: "さと",
        romanization: "sato",
        pronunciation: { text: "さと" },
      },
      {
        id: "kana.word.mimi",
        hiragana: "みみ",
        romanization: "mimi",
        pronunciation: { text: "みみ" },
      },
      {
        id: "kana.word.neko",
        hiragana: "ねこ",
        romanization: "neko",
        pronunciation: { text: "ねこ" },
      },
    ]);
  });
});

describe("authored Kana character charts", () => {
  it("preserves section order, coverage, and row/null positions", () => {
    expect(kanaCharacterCharts.hiragana.sections.map(({ id }) => id)).toEqual(
      sectionIds,
    );
    expect(kanaCharacterCharts.katakana.sections.map(({ id }) => id)).toEqual(
      sectionIds,
    );
    expect(rowShapes("hiragana")).toEqual([
      [
        "#####",
        "#####",
        "#####",
        "#####",
        "#####",
        "#####",
        "#####",
        "#.#.#",
        "#####",
        "#...#",
        "#....",
      ],
      ["#####", "#####", "#####", "#####", "#####"],
      Array.from({ length: 11 }, () => "###"),
      ["####"],
      ["#####", "##"],
    ]);
    expect(rowShapes("katakana")).toEqual([
      [
        "#####",
        "#####",
        "#####",
        "#####",
        "#####",
        "#####",
        "#####",
        "#.#.#",
        "#####",
        "#...#",
        "#....",
      ],
      ["#####", "#####", "#####", "#####", "#####"],
      Array.from({ length: 11 }, () => "###"),
      ["####"],
      ["#####"],
    ]);
    expect(chartTiles("hiragana")).toHaveLength(115);
    expect(chartTiles("katakana")).toHaveLength(113);
    expect(
      kanaCharacterCharts.hiragana.sections.map(
        ({ rows }) =>
          rows.flatMap((row) => row.filter((tile) => tile !== null)).length,
      ),
    ).toEqual([46, 25, 33, 4, 7]);
    expect(
      kanaCharacterCharts.katakana.sections.map(
        ({ rows }) =>
          rows.flatMap((row) => row.filter((tile) => tile !== null)).length,
      ),
    ).toEqual([46, 25, 33, 4, 5]);
  });

  it("derives basic chart entries from the syllabaries and keeps audio keys", () => {
    const hiraganaBasic = kanaCharacterCharts.hiragana.sections[0];
    const katakanaBasic = kanaCharacterCharts.katakana.sections[0];
    const hiraganaTiles = hiraganaBasic?.rows.flatMap((row) =>
      row.filter((tile) => tile !== null),
    );
    const katakanaTiles = katakanaBasic?.rows.flatMap((row) =>
      row.filter((tile) => tile !== null),
    );

    expect(hiraganaTiles?.map(({ glyph }) => glyph)).toEqual(
      hiraganaSyllabary.map(({ glyph }) => glyph),
    );
    expect(katakanaTiles?.map(({ glyph }) => glyph)).toEqual(
      katakanaSyllabary.map(({ glyph }) => glyph),
    );
    expect(
      hiraganaTiles?.find(({ glyph }) => glyph === "を")?.romanization,
    ).toBe("o");
    expect(
      katakanaTiles?.find(({ glyph }) => glyph === "ヲ")?.romanization,
    ).toBe("wo");
    expect(hiraganaTiles?.[0]).toMatchObject({
      id: "hiragana.basic.あ",
      glyph: "あ",
      romanization: "a",
      speechText: "あ",
    });
    expect(
      chartTiles("hiragana").find(({ glyph }) => glyph === "っ+k"),
    ).toMatchObject({
      id: "hiragana.small-tsu.っ+k",
      speechText: "っか",
    });
    expect(
      chartTiles("katakana").find(({ glyph }) => glyph === "アー")?.id,
    ).toBe("katakana.long-vowels.アー");
  });

  it("keeps chart audio IDs unique and every tile playable", () => {
    for (const script of ["hiragana", "katakana"] as const) {
      const tiles = chartTiles(script);
      expect(new Set(tiles.map(({ id }) => id)).size).toBe(tiles.length);
      for (const tile of tiles) {
        expect(tile.id).toContain(`${script}.`);
        expect(tile.glyph).not.toBe("");
        expect(tile.romanization).not.toBe("");
        expect(tile.speechText).not.toBe("");
      }
    }
  });

  it("keeps exceptional chart readings and speech text", () => {
    expect(
      chartTiles("hiragana").find(({ glyph }) => glyph === "ぢ")?.romanization,
    ).toBe("ji");
    expect(
      chartTiles("hiragana").find(({ glyph }) => glyph === "づ")?.romanization,
    ).toBe("zu");
    expect(
      chartTiles("katakana").find(({ glyph }) => glyph === "アー")
        ?.romanization,
    ).toBe("aa");
  });
});
