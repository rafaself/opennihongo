import { expect, it } from "vitest";
import {
  buildExerciseSession,
  generateMultipleChoiceExercise,
  SeededRandomSource,
  randomWithoutReplacementSelectionStrategy,
  randomWithoutReplacementSelectionStrategyId,
  ExerciseSessionBuildError,
  type ExerciseSessionGenerators,
  type ExerciseSessionSourceAdapters,
  type MultipleChoiceSourceItem,
} from "../../src";

const item: MultipleChoiceSourceItem = {
  id: "target",
  prompt: { text: "あ" },
  correctOptionId: "a",
  options: ["a", "i", "u", "e"].map((text) => ({ id: text, text })),
};
function build(
  sourceAdapters: ExerciseSessionSourceAdapters<MultipleChoiceSourceItem> = {
    "multiple-choice": (source) => source,
  },
  generators: ExerciseSessionGenerators = {
    "multiple-choice": generateMultipleChoiceExercise,
  },
) {
  return buildExerciseSession<MultipleChoiceSourceItem>({
    sessionId: "quiz",
    profile: {
      id: "quiz.profile",
      targetSessionSize: 1,
      selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
      exerciseMix: [{ type: "multiple-choice", count: 1 }],
    },
    eligibleItems: [item],
    selectionStrategy: randomWithoutReplacementSelectionStrategy,
    sourceAdapters,
    generators,
    random: new SeededRandomSource("quiz"),
  });
}

it("builds a reproducible, deeply immutable multiple-choice session", () => {
  const session = build();
  expect(session).toEqual(build());
  const exercise = session.exercises[0];
  expect(exercise?.type).toBe("multiple-choice");
  if (exercise?.type !== "multiple-choice") throw new Error("Expected a quiz");
  expect(exercise.sourceItemIds).toEqual(["target"]);
  expect(exercise.correctOptionId).toBe("a");
  expect(exercise.options.map(({ text }) => text).sort()).toEqual([
    "a",
    "e",
    "i",
    "u",
  ]);
  for (const value of [
    session,
    session.exercises,
    exercise,
    exercise.prompt,
    exercise.options,
    ...exercise.options,
    exercise.sourceItemIds,
  ])
    expect(Object.isFrozen(value)).toBe(true);
  expect(Object.isFrozen(item.options)).toBe(false);
});

it("requires the quiz adapter and generator", () => {
  expect(() => build({})).toThrow(ExerciseSessionBuildError);
  expect(() => build({ "multiple-choice": (source) => source }, {})).toThrow(
    ExerciseSessionBuildError,
  );
});

it("rejects a quiz generator that replaces the target identity", () => {
  expect(() =>
    build(undefined, {
      "multiple-choice": (items, config, random) => ({
        ...generateMultipleChoiceExercise(items, config, random),
        sourceItemIds: ["other"],
      }),
    }),
  ).toThrow(ExerciseSessionBuildError);
});
