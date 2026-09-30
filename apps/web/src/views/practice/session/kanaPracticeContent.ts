import {
  kanaCharacterCharts,
  kanaPracticeSessionProfiles,
  type KanaChartScript,
  type KanaChartSectionId,
  type KanaPracticeMode,
} from "@opennihongo/content";
import { normalizeKanaAnswer } from "@opennihongo/core";

export function getKanaPracticeTiles(
  script: KanaChartScript,
  category: KanaChartSectionId,
) {
  return kanaCharacterCharts[script].sections
    .filter(({ id }) => id === category)
    .flatMap(({ rows }) =>
      rows.flatMap((row) => row.filter((tile) => tile !== null)),
    );
}

export function getKanaPracticeItemCount(
  mode: KanaPracticeMode,
  script: KanaChartScript,
  category: KanaChartSectionId,
) {
  const tiles = getKanaPracticeTiles(script, category);
  const available =
    mode === "reading"
      ? tiles.length
      : new Set(
          tiles.map(({ romanization }) => normalizeKanaAnswer(romanization)),
        ).size;
  const maximum =
    mode !== "matching"
      ? kanaPracticeSessionProfiles[mode].targetSessionSize
      : kanaPracticeSessionProfiles.matching.exerciseMix[0].config.pairCount;
  return Math.min(maximum, available);
}
