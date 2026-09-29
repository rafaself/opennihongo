import type { RandomSource } from "./random-source";

/** Returns a Fisher–Yates shuffled copy of the supplied items. */
export function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const value = random.next();

    if (!Number.isFinite(value) || value < 0 || value >= 1) {
      throw new RangeError(
        "RandomSource.next() must return a finite value in [0, 1).",
      );
    }

    const swapIndex = Math.floor(value * (index + 1));
    const currentItem = shuffled[index] as T;
    const swapItem = shuffled[swapIndex] as T;

    shuffled[index] = swapItem;
    shuffled[swapIndex] = currentItem;
  }

  return shuffled;
}
