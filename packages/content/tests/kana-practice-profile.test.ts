import { expect, expectTypeOf, it } from "vitest";
import type {
  ExerciseMixEntry,
  ExerciseType,
  SessionProfile,
} from "@opennihongo/core";
import { randomWithoutReplacementSelectionStrategyId } from "@opennihongo/core";
import { initialKanaPracticeSessionProfile } from "../src/index";

it("defines the initial Kana practice exercise mix", () => {
  const profile = initialKanaPracticeSessionProfile;

  expect(profile).toEqual({
    id: "kana.practice.initial",
    targetSessionSize: 2,
    exerciseMix: [
      { type: "typed-answer", count: 1 },
      { type: "matching", count: 1, config: { pairCount: 5 } },
    ],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  });
  expect(profile.exerciseMix.map(({ type }) => type)).toEqual([
    "typed-answer",
    "matching",
  ]);
  expect(
    profile.exerciseMix.reduce((total, entry) => total + entry.count, 0),
  ).toBe(profile.targetSessionSize);
  expectTypeOf<typeof profile>().toExtend<SessionProfile>();
  expectTypeOf<ExerciseMixEntry["type"]>().toEqualTypeOf<ExerciseType>();
});
