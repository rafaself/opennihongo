import { expect, expectTypeOf, it } from "vitest";
import type {
  ExerciseMixEntry,
  ExerciseType,
  SessionProfile,
} from "@opennihongo/core";
import { randomWithoutReplacementSelectionStrategyId } from "@opennihongo/core";
import { kanaPracticeSessionProfiles } from "../src/index";

it("defines separate Kana reading, matching, and quiz game profiles", () => {
  const profile = kanaPracticeSessionProfiles.reading;

  expect(profile).toEqual({
    id: "kana.practice.reading",
    targetSessionSize: 5,
    exerciseMix: [{ type: "typed-answer", count: 5 }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  });
  expect(kanaPracticeSessionProfiles.matching).toEqual({
    id: "kana.practice.matching",
    targetSessionSize: 1,
    exerciseMix: [{ type: "matching", count: 1, config: { pairCount: 5 } }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  });
  expect(kanaPracticeSessionProfiles.quiz).toEqual({
    id: "kana.practice.quiz",
    targetSessionSize: 5,
    exerciseMix: [{ type: "multiple-choice", count: 5 }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  });
  expect(
    profile.exerciseMix.reduce((total, entry) => total + entry.count, 0),
  ).toBe(profile.targetSessionSize);
  expectTypeOf<typeof profile>().toExtend<SessionProfile>();
  expectTypeOf<ExerciseMixEntry["type"]>().toEqualTypeOf<ExerciseType>();
});
