import {
  kanaCharacterCharts,
  kanaPracticeLengths,
  type KanaChartScript,
  type KanaChartSectionId,
  type KanaQuizDirection,
  type KanaPracticeDifficulty,
  type KanaPracticeLength,
} from "@opennihongo/content";
import type { SearchSchemaInput } from "@tanstack/react-router";
import {
  normalizeKanjiSearch,
  type KanjiPracticeSearch,
} from "../features/kanji/session/options";
import {
  getKanaPracticeTiles,
  type KanaPracticeSelection,
} from "../views/practice/session/kanaPracticeSelection";

export type PracticeSearch = KanaPracticeSelection &
  Readonly<{
    difficulty: KanaPracticeDifficulty;
    length?: KanaPracticeLength;
    direction: KanaQuizDirection;
    fast: boolean;
    reviewIds?: readonly string[];
    kanji?: KanjiPracticeSearch;
  }>;

type PracticeSearchInput = {
  scripts?: unknown;
  categories?: unknown;
  characterIds?: unknown;
  difficulty?: unknown;
  length?: unknown;
  direction?: unknown;
  fast?: unknown;
  reviewIds?: unknown;
  kanji?: unknown;
};

function choices<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: readonly T[],
): readonly T[] {
  if (!Array.isArray(value)) return fallback;
  if (value.length === 0) return [];
  const selected = allowed.filter((item) => value.includes(item));
  return selected.length > 0 ? selected : fallback;
}

export function validatePracticeSearch(
  search: SearchSchemaInput & PracticeSearchInput,
): PracticeSearch {
  return normalizePracticeSearch(search);
}

export function normalizePracticeSearch(
  search: PracticeSearchInput,
): PracticeSearch {
  const scripts = choices<KanaChartScript>(
    search.scripts,
    ["hiragana", "katakana"],
    ["hiragana"],
  );
  const categories = choices<KanaChartSectionId>(
    search.categories,
    kanaCharacterCharts.hiragana.sections.map(({ id }) => id),
    ["basic"],
  );
  const pool = getKanaPracticeTiles({ scripts, categories });
  const characterIds = Array.isArray(search.characterIds)
    ? pool
        .filter(
          ({ id }) =>
            search.characterIds instanceof Array &&
            search.characterIds.includes(id),
        )
        .map(({ id }) => id)
        .sort()
    : undefined;
  const length = kanaPracticeLengths.find((size) => size === search.length);
  return {
    scripts,
    categories,
    ...(characterIds === undefined ? {} : { characterIds }),
    ...(length === undefined ? {} : { length }),
    difficulty:
      search.difficulty === "easy" || search.difficulty === "hard"
        ? search.difficulty
        : "standard",
    direction:
      search.direction === "character" || search.direction === "romaji"
        ? search.direction
        : "random",
    fast: search.fast === true,
    ...(Array.isArray(search.reviewIds)
      ? {
          reviewIds: [
            ...new Set(
              search.reviewIds.filter(
                (id): id is string => typeof id === "string",
              ),
            ),
          ],
        }
      : {}),
    ...(search.kanji === undefined
      ? {}
      : { kanji: normalizeKanjiSearch(search.kanji) }),
  };
}
