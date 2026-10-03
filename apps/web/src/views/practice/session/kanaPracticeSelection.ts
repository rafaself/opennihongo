import {
  kanaCharacterCharts,
  type KanaChartScript,
  type KanaChartSectionId,
} from "@opennihongo/content";

export type KanaPracticeSelection = Readonly<{
  scripts: readonly KanaChartScript[];
  categories: readonly KanaChartSectionId[];
  characterIds?: readonly string[];
}>;

export function getKanaPracticeTiles(selection: KanaPracticeSelection) {
  return selection.scripts
    .flatMap((script) =>
      kanaCharacterCharts[script].sections
        .filter(({ id }) => selection.categories.includes(id))
        .flatMap(({ rows }) =>
          rows.flatMap((row) => row.filter((tile) => tile !== null)),
        ),
    )
    .filter(
      ({ id }) =>
        selection.characterIds === undefined ||
        selection.characterIds.includes(id),
    );
}

export function toggleKanaCharacters<T extends KanaPracticeSelection>(
  selection: T,
  ids: readonly string[],
  checked: boolean,
): T & KanaPracticeSelection {
  const selected = new Set(getKanaPracticeTiles(selection).map(({ id }) => id));
  for (const id of ids) {
    if (checked) selected.add(id);
    else selected.delete(id);
  }
  return { ...selection, characterIds: [...selected].sort() };
}

export function updateKanaSelection<T extends KanaPracticeSelection>(
  previous: T,
  next: Pick<KanaPracticeSelection, "scripts" | "categories">,
): T & KanaPracticeSelection {
  if (previous.characterIds === undefined) return { ...previous, ...next };
  const previousPool = new Set(
    getKanaPracticeTiles({
      scripts: previous.scripts,
      categories: previous.categories,
    }).map(({ id }) => id),
  );
  const ids = getKanaPracticeTiles(next)
    .filter(
      ({ id }) => previous.characterIds?.includes(id) || !previousPool.has(id),
    )
    .map(({ id }) => id)
    .sort();
  return { ...previous, ...next, characterIds: ids };
}
