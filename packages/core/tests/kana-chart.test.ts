import {
  kanaCharacterCharts,
  type KanaChartSectionId,
  type KanaChartScript,
} from "../src/index";
import { describe, expect, it } from "vitest";

const sectionIds: readonly KanaChartSectionId[] = [
  "basic",
  "dakuten",
  "combinations",
  "small-tsu",
  "long-vowels",
];

function allTiles(script: KanaChartScript) {
  return kanaCharacterCharts[script].sections.flatMap(({ rows }) =>
    rows.flatMap((row) => row.filter((tile) => tile !== null)),
  );
}

describe("kana character charts", () => {
  it("includes all five reference sections for both scripts", () => {
    for (const script of ["hiragana", "katakana"] as const) {
      expect(kanaCharacterCharts[script].sections.map(({ id }) => id)).toEqual(
        sectionIds,
      );
    }
  });

  it("contains every tile from the basic and extended sections", () => {
    expect(allTiles("hiragana")).toHaveLength(115);
    expect(allTiles("katakana")).toHaveLength(113);
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

  it("keeps stable unique tile identifiers and speech text", () => {
    for (const script of ["hiragana", "katakana"] as const) {
      const tiles = allTiles(script);
      expect(new Set(tiles.map(({ id }) => id)).size).toBe(tiles.length);
      for (const tile of tiles) {
        expect(tile.id).toContain(`${script}.`);
        expect(tile.glyph).not.toBe("");
        expect(tile.romanization).not.toBe("");
        expect(tile.speechText).not.toBe("");
      }
    }
  });

  it("uses the reference romanizations and sound forms for exceptions", () => {
    const hiragana = allTiles("hiragana");
    const katakana = allTiles("katakana");
    expect(hiragana.find(({ glyph }) => glyph === "を")?.romanization).toBe(
      "o",
    );
    expect(katakana.find(({ glyph }) => glyph === "ヲ")?.romanization).toBe(
      "wo",
    );
    expect(hiragana.find(({ glyph }) => glyph === "ぢ")?.romanization).toBe(
      "ji",
    );
    expect(hiragana.find(({ glyph }) => glyph === "づ")?.romanization).toBe(
      "zu",
    );
    expect(hiragana.find(({ glyph }) => glyph === "っ+k")?.speechText).toBe(
      "っか",
    );
    expect(katakana.find(({ glyph }) => glyph === "アー")?.romanization).toBe(
      "aa",
    );
  });
});
