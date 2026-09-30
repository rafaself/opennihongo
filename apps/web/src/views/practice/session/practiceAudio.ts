import {
  getAudioAsset,
  getKanaChartAudioAsset,
} from "@opennihongo/audio-assets";
import { kanaCharacterCharts } from "@opennihongo/content";
import type {
  Exercise,
  LearningItemId,
  TypedAnswerExercise,
} from "@opennihongo/core";

const pronunciationById = new Map(
  Object.values(kanaCharacterCharts).flatMap(({ sections }) =>
    sections.flatMap(({ rows }) =>
      rows.flatMap((row) =>
        row.flatMap((tile) =>
          tile ? [[tile.id, tile.speechText] as const] : [],
        ),
      ),
    ),
  ),
);

export function getPracticeAudioAsset(id: LearningItemId): string | undefined {
  return getAudioAsset(id) ?? getKanaChartAudioAsset(id);
}

export function getPracticePronunciationText(
  exercise: TypedAnswerExercise,
): string {
  return (
    pronunciationById.get(exercise.sourceItemIds[0] ?? "") ??
    exercise.prompt.text
  );
}

/** Resolves only typed-answer source IDs that have a generated pronunciation asset. */
export function getPracticeAudioIds(
  exercise: Exercise | undefined,
): readonly LearningItemId[] {
  if (exercise?.type !== "typed-answer") {
    return [];
  }

  return exercise.sourceItemIds.filter(
    (id) => getPracticeAudioAsset(id) !== undefined,
  );
}
