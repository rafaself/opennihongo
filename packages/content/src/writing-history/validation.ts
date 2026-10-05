import { hiraganaSyllabary, katakanaSyllabary } from "../kanaSyllabary";
import type { KanaCharacterContent } from "../kana";
import type { HistoryReference, WritingHistoryCatalog } from "./types";

function identities(
  entries: readonly Readonly<{ id: string }>[],
  kind: string,
) {
  const ids = new Set<string>();
  for (const { id } of entries) {
    if (!id.trim() || ids.has(id))
      throw new Error(`Duplicate ${kind} or empty identity: ${id}`);
    ids.add(id);
  }
  return ids;
}

/** Validate authored references and visual relationships before publishing content. */
export function assertWritingHistoryCatalog(
  catalog: WritingHistoryCatalog,
): void {
  identities(catalog.chapters, "chapter");
  const characters = identities(catalog.characters, "character");
  const sources = identities(catalog.sources, "source");
  const learningItems = new Map<string, KanaCharacterContent>(
    [...hiraganaSyllabary, ...katakanaSyllabary].map((item) => [item.id, item]),
  );
  const references = (entries: readonly HistoryReference[]) => {
    if (!entries.length) throw new Error("Content requires source references");
    for (const { sourceId, locator } of entries) {
      if (!sources.has(sourceId))
        throw new Error(`Unknown source: ${sourceId}`);
      if (!locator.trim())
        throw new Error("Source reference requires a locator");
    }
  };
  const characterReference = (id: string) => {
    if (!characters.has(id)) throw new Error(`Unknown character: ${id}`);
  };
  for (const source of catalog.sources) {
    if (
      !source.title.trim() ||
      !source.institution.trim() ||
      !source.url.startsWith("https://") ||
      !/^\d{4}-\d{2}-\d{2}$/.test(source.accessedOn) ||
      Number.isNaN(Date.parse(source.accessedOn))
    )
      throw new Error(`Invalid source: ${source.id}`);
  }
  for (const character of catalog.characters) {
    references(character.references);
    if (character.learningItemId !== undefined) {
      const item = learningItems.get(character.learningItemId);
      if (
        !item ||
        item.glyph !== character.glyph ||
        item.script !== character.script
      )
        throw new Error(
          `Unknown learning item or mismatched glyph: ${character.learningItemId}`,
        );
    }
    character.relatedIds.forEach(characterReference);
    for (const origin of character.origins) {
      characterReference(origin.sourceCharacterId);
      references(origin.references);
      if (
        !origin.phoneticContext.trim() ||
        (origin.pedagogicalSimplification && !origin.caveat.trim())
      )
        throw new Error(
          "Origin requires historical context and a simplification caveat",
        );
    }
  }
  for (const chapter of catalog.chapters) {
    if (!chapter.units.length) throw new Error("Chapter requires units");
    if (
      chapter.durationMinutes.min <= 0 ||
      chapter.durationMinutes.max < chapter.durationMinutes.min
    )
      throw new Error("Invalid chapter duration");
    for (const unit of chapter.units) {
      references(unit.references);
      if (unit.kind === "character-comparison")
        unit.characterIds.forEach(characterReference);
      if (
        unit.kind === "script-example" &&
        unit.tokens.map(({ text }) => text).join("") !== unit.sentence
      )
        throw new Error("Script tokens must reconstruct the sentence");
      if (unit.kind === "diagram") {
        const nodes = identities(unit.nodes, "diagram node");
        for (const edge of unit.edges) {
          if (!nodes.has(edge.from) || !nodes.has(edge.to))
            throw new Error("Unknown diagram node");
        }
      }
    }
  }
}
