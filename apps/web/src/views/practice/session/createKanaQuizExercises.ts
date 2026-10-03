import type { KanaChartTile, KanaQuizDirection } from "@opennihongo/content";
import {
  generateMultipleChoiceExercise,
  shuffle,
  type RandomSource,
} from "@opennihongo/core";

/** The caller supplies a category pool with distinct normalized readings. */
export function createKanaQuizExercises(
  targets: readonly KanaChartTile[],
  pool: readonly KanaChartTile[],
  direction: KanaQuizDirection,
  sessionId: string,
  random: RandomSource,
  choiceCount: number,
) {
  const firstCharacter = random.next() < 0.5;
  const directions = shuffle(
    targets.map((_, index) =>
      direction === "random"
        ? (index % 2 === 0) === firstCharacter
        : direction === "character",
    ),
    random,
  );
  return targets.map((tile, index) => {
    const character = directions[index];
    const choices = [
      tile,
      ...shuffle(
        pool.filter(({ id }) => id !== tile.id),
        random,
      ).slice(0, choiceCount - 1),
    ];
    const exercise = generateMultipleChoiceExercise(
      [
        {
          id: tile.id,
          prompt: { text: character ? tile.glyph : tile.romanization },
          correctOptionId: tile.id,
          options: choices.map((option) => ({
            id: option.id,
            text: character ? option.romanization : option.glyph,
          })),
        },
      ],
      { exerciseId: `${sessionId}:${tile.id}` },
      random,
    );
    return Object.freeze({
      ...exercise,
      prompt: Object.freeze(exercise.prompt),
      options: Object.freeze(
        exercise.options.map((option) => Object.freeze(option)),
      ),
      sourceItemIds: Object.freeze(exercise.sourceItemIds),
    });
  });
}
