import {
  kanaCharacterCharts,
  type KanaChartScript,
  type KanaChartSectionId,
  type KanaQuizDirection,
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

export type KanaQuizSearch = PracticeSearch &
  Readonly<{ direction: KanaQuizDirection; fast: boolean }>;
export function validateKanaQuizSearch(
  search: SearchSchemaInput & {
    script?: unknown;
    category?: unknown;
    direction?: unknown;
    fast?: unknown;
  },
): KanaQuizSearch {
  return {
    ...validatePracticeSearch(search),
    direction:
      search.direction === "character" || search.direction === "romaji"
        ? search.direction
        : "random",
    fast: search.fast === true,
  };
}
