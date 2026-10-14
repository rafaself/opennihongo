import {
  beginnerKanji,
  kanjiThemes,
  kanjiPracticeGames,
  kanaPracticeDifficulties,
  kanaPracticeLengths,
  type KanjiThemeId,
  type KanjiPracticeGame,
  type KanjiQuizFocus,
  type KanaPracticeDifficulty,
  type KanaPracticeLength,
} from "@opennihongo/content";
import { matchingBoardSizes } from "../../../components/matching/matchingBoardSizes";

export type KanjiPracticeSearch = Readonly<{
  themes: readonly KanjiThemeId[];
  ids?: readonly string[];
  difficulty: KanaPracticeDifficulty;
  length?: KanaPracticeLength;
  focus: KanjiQuizFocus;
  fast: boolean;
}>;

export function normalizeKanjiSearch(input: unknown): KanjiPracticeSearch {
  const value: Record<string, unknown> =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const allowedThemes = kanjiThemes.map(({ id }) => id);
  const validThemes = allowedThemes.filter(
    (id) => Array.isArray(value["themes"]) && value["themes"].includes(id),
  );
  const themes =
    Array.isArray(value["themes"]) &&
    (value["themes"].length === 0 || validThemes.length > 0)
      ? validThemes
      : allowedThemes;
  const rawIds = value["ids"];
  const ids = Array.isArray(rawIds)
    ? beginnerKanji
        .filter(
          (item) => themes.includes(item.theme) && rawIds.includes(item.id),
        )
        .map(({ id }) => id)
        .sort()
    : undefined;
  const length = kanaPracticeLengths.find((size) => size === value["length"]);
  return {
    themes,
    ...(ids === undefined ? {} : { ids }),
    ...(length === undefined ? {} : { length }),
    difficulty:
      value["difficulty"] === "easy" || value["difficulty"] === "hard"
        ? value["difficulty"]
        : "standard",
    focus:
      value["focus"] === "meanings" || value["focus"] === "readings"
        ? value["focus"]
        : "mixed",
    fast: value["fast"] === true,
  };
}

export function getKanjiItems(selection: KanjiPracticeSearch) {
  return beginnerKanji.filter(
    ({ id, theme }) =>
      selection.themes.includes(theme) &&
      (selection.ids === undefined || selection.ids.includes(id)),
  );
}

export function toggleKanji(
  selection: KanjiPracticeSearch,
  ids: readonly string[],
  checked: boolean,
): KanjiPracticeSearch {
  const selected = new Set(
    getKanjiItems(selection).map(({ id }) => id as string),
  );
  for (const id of ids) {
    if (checked) selected.add(id);
    else selected.delete(id);
  }
  return { ...selection, ids: [...selected].sort() };
}

export function updateKanjiThemes(
  previous: KanjiPracticeSearch,
  themes: readonly KanjiThemeId[],
): KanjiPracticeSearch {
  if (previous.ids === undefined) return { ...previous, themes };
  const oldPool = new Set(
    beginnerKanji
      .filter(({ theme }) => previous.themes.includes(theme))
      .map(({ id }) => id),
  );
  return {
    ...previous,
    themes,
    ids: beginnerKanji
      .filter(
        ({ id, theme }) =>
          themes.includes(theme) &&
          (previous.ids?.includes(id) || !oldPool.has(id)),
      )
      .map(({ id }) => id)
      .sort(),
  };
}

export function getKanjiSummary(
  game: KanjiPracticeGame,
  options: KanjiPracticeSearch,
) {
  const items = getKanjiItems(options);
  const requested = options.length ?? kanjiPracticeGames[game].defaultLength;
  const meanings = new Set(items.map(({ meaning }) => meaning)).size;
  const readings = new Set(items.map(({ example }) => example.reading)).size;
  const distinct =
    game === "matching" || options.focus === "meanings"
      ? meanings
      : options.focus === "readings"
        ? readings
        : Math.min(meanings, readings);
  const available =
    game === "quiz" || game === "matching" ? distinct : items.length;
  const count = Math.min(requested, available);
  const preset = kanaPracticeDifficulties[options.difficulty];
  const error =
    items.length === 0
      ? "Select at least one Kanji to start."
      : (game === "quiz" || game === "matching") && distinct < 2
        ? "Select Kanji with at least two distinct answers."
        : "";
  return {
    requested,
    available,
    count,
    choices: Math.min(preset.quizChoices, distinct),
    boards:
      game === "matching"
        ? matchingBoardSizes(count, preset.matchingPairs)
        : [],
    canStart: error === "",
    error,
  };
}

export function kanjiConfigurationId(options: KanjiPracticeSearch) {
  return JSON.stringify({
    themes: [...options.themes].sort(),
    ids: options.ids === undefined ? undefined : [...options.ids].sort(),
    difficulty: options.difficulty,
    length: options.length,
    focus: options.focus,
  });
}
