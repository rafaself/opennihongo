import { expect, expectTypeOf, it } from "vitest";
import type {
  ExerciseMixEntry,
  ExerciseType,
  ItemSelectionStrategyId,
  SessionProfile,
  SessionProfileId,
} from "../src";

it("describes supported exercise mix and matching configuration", () => {
  const profile = {
    id: "kana.practice.initial",
    targetSessionSize: 2,
    exerciseMix: [
      { type: "typed-answer", count: 1 },
      { type: "matching", count: 1, config: { pairCount: 5 } },
    ],
    selectionStrategyId: "random-without-replacement.v1",
  } as const satisfies SessionProfile;

  const matchingEntry = profile.exerciseMix[1];

  expect(profile.targetSessionSize).toBe(2);
  expect(matchingEntry).toMatchObject({
    type: "matching",
    count: 1,
    config: { pairCount: 5 },
  });
  expectTypeOf(profile.id).toExtend<SessionProfileId>();
  expectTypeOf(profile.selectionStrategyId).toExtend<ItemSelectionStrategyId>();
  expectTypeOf(matchingEntry.config.pairCount).toExtend<number>();
  expectTypeOf<ExerciseMixEntry["type"]>().toEqualTypeOf<ExerciseType>();
});
