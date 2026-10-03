import type { ExerciseBase } from "../base";
import type { ExerciseId, LearningItemId } from "../../ids";

/** Content-neutral card faces allow characters, vocabulary, and other subjects. */
export type FlashcardFace = Readonly<{
  text: string;
  supportingText?: string;
  lang?: string;
}>;

export type FlashcardExercise = ExerciseBase<"flashcard"> &
  Readonly<{
    front: FlashcardFace;
    back: FlashcardFace;
  }>;

export type FlashcardSourceItem = Readonly<{
  id: LearningItemId;
  front: FlashcardFace;
  back: FlashcardFace;
}>;

export type FlashcardExerciseGenerationConfig = Readonly<{
  exerciseId: ExerciseId;
}>;
