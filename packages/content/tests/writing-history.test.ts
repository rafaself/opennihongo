import { describe, expect, it } from "vitest";
import {
  assertWritingHistoryCatalog,
  getHistoricalCharacter,
  getWritingHistoryChapter,
  hiraganaSyllabary,
  katakanaSyllabary,
  writingHistoryCatalog,
} from "../src/index";

const [firstChapter] = writingHistoryCatalog.chapters;
const [firstCharacter] = writingHistoryCatalog.characters;
const [firstSource] = writingHistoryCatalog.sources;
if (!firstChapter || !firstCharacter || !firstSource)
  throw new Error("Writing history requires chapters, characters and sources");

describe("writing history catalog", () => {
  it("provides nine ordered short chapters with verifiable references", () => {
    expect(() => {
      assertWritingHistoryCatalog(writingHistoryCatalog);
    }).not.toThrow();
    expect(writingHistoryCatalog.chapters.map(({ id }) => id)).toEqual([
      "before-writing",
      "adopting-kanji",
      "adapting-writing",
      "manyogana",
      "hiragana",
      "katakana",
      "multiple-scripts",
      "variation",
      "modern-writing",
    ]);
    for (const chapter of writingHistoryCatalog.chapters) {
      expect(chapter.units.length).toBeGreaterThanOrEqual(3);
      expect(chapter.units.length).toBeLessThanOrEqual(5);
      expect(chapter.durationMinutes).toEqual({ min: 2, max: 4 });
      expect(getWritingHistoryChapter(chapter.id)).toBe(chapter);
    }
    expect(getWritingHistoryChapter("missing")).toBeUndefined();
    expect(getHistoricalCharacter("missing")).toBeUndefined();
  });

  it("links reusable character origins to the canonical kana material", () => {
    const kana = [...hiraganaSyllabary, ...katakanaSyllabary];
    const expected = {
      あ: "安",
      い: "以",
      う: "宇",
      え: "衣",
      お: "於",
      か: "加",
      さ: "左",
      と: "止",
      ア: "阿",
      カ: "加",
    };
    for (const [glyph, source] of Object.entries(expected)) {
      const character = writingHistoryCatalog.characters.find(
        (entry) => entry.glyph === glyph,
      );
      expect(character).toBeDefined();
      expect(
        kana.find(({ id }) => id === character?.learningItemId)?.glyph,
      ).toBe(glyph);
      expect(
        getHistoricalCharacter(character?.origins[0]?.sourceCharacterId ?? "")
          ?.glyph,
      ).toBe(source);
      expect(character?.origins[0]?.transformation).toBe(
        character?.script === "katakana" ? "abbreviation" : "cursive",
      );
      expect(character?.origins[0]?.pedagogicalSimplification).toBeTruthy();
    }
    const variants = writingHistoryCatalog.characters.filter(
      ({ form }) => form === "historical-variant",
    );
    expect(variants.map(({ glyph }) => glyph)).toEqual(["𛀂", "𛀃", "𛀄"]);
    expect(
      variants.every(
        ({ script, reading }) => script === "hiragana" && reading === "a",
      ),
    ).toBe(true);
  });

  it("offers eight sourced hiragana examples in the chapter comparison", () => {
    const comparison = getWritingHistoryChapter("hiragana")?.units.find(
      ({ kind }) => kind === "character-comparison",
    );
    if (comparison?.kind !== "character-comparison")
      throw new Error("Missing hiragana comparison");
    expect(
      comparison.characterIds.map((id) => getHistoricalCharacter(id)?.glyph),
    ).toEqual(["あ", "い", "う", "え", "お", "か", "さ", "と"]);
  });

  it("reconstructs the sentence from declared script tokens", () => {
    const unit = getWritingHistoryChapter("multiple-scripts")?.units.find(
      ({ kind }) => kind === "script-example",
    );
    expect(unit?.kind).toBe("script-example");
    if (unit?.kind !== "script-example")
      throw new Error("Missing sentence example");
    expect(unit.tokens.map(({ text }) => text).join("")).toBe(
      "私はコーヒーを飲みます。",
    );
    expect(
      unit.tokens
        .filter(({ script }) => script === "kanji")
        .map(({ text }) => text),
    ).toEqual(["私", "飲"]);
    expect(unit.tokens.find(({ text }) => text === "ー")?.script).toBe("mark");
  });

  it("rejects duplicate identities and dangling content references", () => {
    const catalog = writingHistoryCatalog;
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        chapters: [...catalog.chapters, firstChapter],
      });
    }).toThrow("Duplicate chapter");
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        characters: [...catalog.characters, firstCharacter],
      });
    }).toThrow("Duplicate character");
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        sources: [...catalog.sources, firstSource],
      });
    }).toThrow("Duplicate source");
    expect(() => {
      assertWritingHistoryCatalog({ ...catalog, sources: [] });
    }).toThrow("Unknown source");
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        characters: catalog.characters.slice(1),
      });
    }).toThrow("Unknown character");
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        characters: catalog.characters.map((entry, index) =>
          index === 0 ? { ...entry, learningItemId: "kana.missing" } : entry,
        ),
      });
    }).toThrow("Unknown learning item");
  });

  it("requires usable source provenance and valid visual definitions", () => {
    const catalog = writingHistoryCatalog;
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        sources: catalog.sources.map((source) => ({
          ...source,
          url: "javascript:bad",
        })),
      });
    }).toThrow("Invalid source");
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        sources: catalog.sources.map((source) => ({
          ...source,
          accessedOn: "bad",
        })),
      });
    }).toThrow("Invalid source");
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        chapters: [{ ...firstChapter, units: [] }],
      });
    }).toThrow("Chapter requires units");
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        chapters: [
          {
            ...firstChapter,
            units: [
              {
                kind: "diagram",
                title: "Broken",
                nodes: [{ id: "one", label: "One", detail: "A node" }],
                edges: [{ from: "one", to: "missing", label: "Broken" }],
                references: [{ sourceId: "rekihaku", locator: "Prologue" }],
              },
            ],
          },
        ],
      });
    }).toThrow("Unknown diagram node");
  });
});
