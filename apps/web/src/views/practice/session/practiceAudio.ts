import {
  getAudioAsset,
  getKanaChartAudioAsset,
} from "@opennihongo/audio-assets";
import { beginnerKanji, kanaCharacterCharts } from "@opennihongo/content";
import type {
  Exercise,
  LearningItemId,
  TypedAnswerExercise,
  MultipleChoiceExercise,
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
for (const item of beginnerKanji)
  pronunciationById.set(item.id, item.example.pronunciation.text);

export function getPracticeAudioAsset(id: LearningItemId): string | undefined {
  return getAudioAsset(id) ?? getKanaChartAudioAsset(id);
}

export function getPracticePronunciationText(
  exercise: TypedAnswerExercise | MultipleChoiceExercise,
): string {
  return (
    pronunciationById.get(exercise.sourceItemIds[0] ?? "") ??
    exercise.prompt.text
  );
}

/** Resolves prompt source IDs that have a generated pronunciation asset. */
export function getPracticeAudioIds(
  exercise: Exercise | undefined,
): readonly LearningItemId[] {
  if (
    exercise?.type !== "typed-answer" &&
    exercise?.type !== "multiple-choice"
  ) {
    return [];
  }

  return exercise.sourceItemIds.filter(
    (id) => getPracticeAudioAsset(id) !== undefined,
  );
}
