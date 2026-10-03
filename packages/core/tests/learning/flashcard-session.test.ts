import { expect, it } from "vitest";
import {
  buildExerciseSession,
  generateFlashcardExercise,
  SeededRandomSource,
  randomWithoutReplacementSelectionStrategy,
  randomWithoutReplacementSelectionStrategyId,
  ExerciseSessionBuildError,
  type ExerciseSessionGenerators,
  type ExerciseSessionSourceAdapters,
  type FlashcardSourceItem,
} from "../../src";

const item: FlashcardSourceItem = {
  id: "a",
  front: { text: "あ", lang: "ja" },
  back: { text: "a" },
};
function build(
  sourceAdapters: ExerciseSessionSourceAdapters<FlashcardSourceItem> = {
    flashcard: (source) => source,
  },
  generators: ExerciseSessionGenerators = {
    flashcard: generateFlashcardExercise,
  },
) {
  return buildExerciseSession<FlashcardSourceItem>({
    sessionId: "cards",
    profile: {
      id: "cards.profile",
      targetSessionSize: 1,
      selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
      exerciseMix: [{ type: "flashcard", count: 1 }],
    },
    eligibleItems: [item],
    selectionStrategy: randomWithoutReplacementSelectionStrategy,
    sourceAdapters,
    generators,
    random: new SeededRandomSource("cards"),
  });
}

it("builds a reproducible card session with deeply immutable faces", () => {
  const session = build();
  expect(session).toEqual(build());
  const card = session.exercises[0];
  if (card?.type !== "flashcard") throw new Error("Expected a flashcard");
  expect(card.front).toEqual(item.front);
  expect(card.back).toEqual(item.back);
  for (const value of [
    session,
    session.exercises,
    card,
    card.front,
    card.back,
    card.sourceItemIds,
  ])
    expect(Object.isFrozen(value)).toBe(true);
  expect(Object.isFrozen(item.front)).toBe(false);
});

it("requires the card adapter and generator", () => {
  expect(() => build({})).toThrow(ExerciseSessionBuildError);
  expect(() => build({ flashcard: (source) => source }, {})).toThrow(
    ExerciseSessionBuildError,
  );
});

it("rejects a generator that replaces the scored source identity", () => {
  expect(() =>
    build(undefined, {
      flashcard: (items, config, random) => ({
        ...generateFlashcardExercise(items, config, random),
        sourceItemIds: ["other"],
      }),
    }),
  ).toThrow(ExerciseSessionBuildError);
});
