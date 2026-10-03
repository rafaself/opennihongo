import { ExerciseGenerationError } from "../generation-error";
import type { ExerciseGenerator } from "../generator";
import type {
  FlashcardExercise,
  FlashcardExerciseGenerationConfig,
  FlashcardSourceItem,
} from "./flashcard";

/** Selection belongs to the caller; revealing and rating belong to presentation. */
export const generateFlashcardExercise: ExerciseGenerator<
  FlashcardSourceItem,
  FlashcardExerciseGenerationConfig,
  FlashcardExercise
> = (sourceItems, config) => {
  const item = sourceItems[0];
  if (sourceItems.length !== 1 || item === undefined) {
    throw new ExerciseGenerationError(
      "insufficient-source-items",
      "A flashcard requires exactly one source item.",
    );
  }
  if (
    config.exerciseId.trim().length === 0 ||
    item.id.trim().length === 0 ||
    item.front.text.trim().length === 0 ||
    item.back.text.trim().length === 0
  ) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "A flashcard requires stable IDs and non-empty faces.",
    );
  }
  return {
    id: config.exerciseId,
    type: "flashcard",
    sourceItemIds: [item.id],
    front: { ...item.front },
    back: { ...item.back },
  };
};
