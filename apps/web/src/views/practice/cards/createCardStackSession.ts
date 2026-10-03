import { cardStackSessionProfile } from "@opennihongo/content";
import {
  generateFlashcardExercise,
  SeededRandomSource,
  shuffle,
  type FlashcardSourceItem,
  type FlashcardExercise,
  type ExerciseSession,
} from "@opennihongo/core";

export type CardStackSession = Omit<ExerciseSession, "exercises"> &
  Readonly<{ exercises: readonly FlashcardExercise[] }>;

/** One seeded, non-repeating batch, independent of the subject being studied. */
export function createCardStackSession(
  items: readonly FlashcardSourceItem[],
  collectionId: string,
  revision: number,
  sessionId: string,
  length: number = cardStackSessionProfile.targetSessionSize,
): CardStackSession {
  if (!Number.isInteger(length) || length < 1)
    throw new Error("Card stack length must be a positive integer.");
  if (items.length === 0)
    throw new Error("Cannot start an empty card collection.");
  if (new Set(items.map(({ id }) => id)).size !== items.length)
    throw new Error("Card collections require distinct source identities.");
  const id = sessionId;
  const random = new SeededRandomSource(
    `cards:${collectionId}:${String(revision)}`,
  );
  const selected = shuffle(items, random).slice(0, length);
  const exercises = selected.map((item) => {
    const card = generateFlashcardExercise(
      [item],
      { exerciseId: `${id}:${item.id}` },
      random,
    );
    return Object.freeze({
      ...card,
      front: Object.freeze(card.front),
      back: Object.freeze(card.back),
      sourceItemIds: Object.freeze(card.sourceItemIds),
    });
  });
  return Object.freeze({
    id,
    profileId: cardStackSessionProfile.id,
    exercises: Object.freeze(exercises),
  });
}
