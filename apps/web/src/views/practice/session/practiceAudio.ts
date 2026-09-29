import { getAudioAsset } from "@opennihongo/audio-assets";
import type { Exercise, KanaAudioId } from "@opennihongo/core";

/** Resolves only typed-answer source IDs that have a generated pronunciation asset. */
export function getPracticeAudioIds(
  exercise: Exercise | undefined,
): readonly KanaAudioId[] {
  if (exercise?.type !== "typed-answer") {
    return [];
  }

  return exercise.sourceItemIds.filter(isKanaAudioId);
}

function isKanaAudioId(id: string): id is KanaAudioId {
  return getAudioAsset(id) !== undefined;
}
