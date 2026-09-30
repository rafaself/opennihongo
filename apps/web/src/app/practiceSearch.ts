import {
  kanaCharacterCharts,
  type KanaChartScript,
  type KanaChartSectionId,
} from "@opennihongo/content";
import type { SearchSchemaInput } from "@tanstack/react-router";

export type PracticeSearch = Readonly<{
  script: KanaChartScript;
  category: KanaChartSectionId;
}>;

export function validatePracticeSearch(
  search: SearchSchemaInput & { script?: unknown; category?: unknown },
): PracticeSearch {
  const script = search.script === "katakana" ? "katakana" : "hiragana";
  const category =
    kanaCharacterCharts[script].sections.find(
      ({ id }) => id === search.category,
    )?.id ?? "basic";
  return { script, category };
}
