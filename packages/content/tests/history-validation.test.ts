import { describe, expect, it } from "vitest";
import {
  assertWritingHistoryCatalog,
  writingHistoryCatalog as catalog,
  type HistoryChapter,
  type HistoricalCharacter,
  type HistorySource,
} from "../src/index";

function validateChapter(change: (chapter: HistoryChapter) => HistoryChapter) {
  assertWritingHistoryCatalog({
    ...catalog,
    chapters: catalog.chapters.map(change),
  });
}
function validateCharacter(
  change: (character: HistoricalCharacter) => HistoricalCharacter,
) {
  assertWritingHistoryCatalog({
    ...catalog,
    characters: catalog.characters.map(change),
  });
}

describe("history authoring safeguards", () => {
  it.each<Partial<HistorySource>>([
    { title: "" },
    { institution: "" },
    { accessedOn: "2026-99-99" },
  ])("requires maintainable source metadata: %j", (patch) => {
    expect(() => {
      assertWritingHistoryCatalog({
        ...catalog,
        sources: catalog.sources.map((source) => ({ ...source, ...patch })),
      });
    }).toThrow("Invalid source");
  });

  it("rejects blank identities, missing citations and citations without locators", () => {
    expect(() => {
      validateChapter((chapter) => ({ ...chapter, id: " " }));
    }).toThrow("empty identity");
    expect(() => {
      validateCharacter((character) => ({ ...character, references: [] }));
    }).toThrow("requires source references");
    expect(() => {
      validateCharacter((character) => ({
        ...character,
        references: [{ sourceId: "rekihaku", locator: " " }],
      }));
    }).toThrow("requires a locator");
  });

  it("requires phonetic context and a caveat for simplified origin relationships", () => {
    expect(() => {
      validateCharacter((character) => ({
        ...character,
        origins: character.origins.map((origin) => ({
          ...origin,
          phoneticContext: " ",
        })),
      }));
    }).toThrow("Origin requires historical context");
    expect(() => {
      validateCharacter((character) => ({
        ...character,
        origins: character.origins.map((origin) => ({
          ...origin,
          pedagogicalSimplification: true,
          caveat: " ",
        })),
      }));
    }).toThrow("simplification caveat");
  });

  it.each([
    { min: 0, max: 4 },
    { min: 4, max: 2 },
  ])("rejects misleading duration estimates: %j", (durationMinutes) => {
    expect(() => {
      validateChapter((chapter) => ({ ...chapter, durationMinutes }));
    }).toThrow("Invalid chapter duration");
  });

  it("rejects script tokens that would change the authored sentence", () => {
    expect(() => {
      validateChapter((chapter) => ({
        ...chapter,
        units: chapter.units.map((unit) =>
          unit.kind === "script-example"
            ? { ...unit, tokens: unit.tokens.slice(1) }
            : unit,
        ),
      }));
    }).toThrow("must reconstruct the sentence");
  });
});
