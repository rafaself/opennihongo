import { expect, it } from "vitest";
import type { ExerciseBase, ExerciseType } from "../src";

type ExerciseUnion = ExerciseBase<"typed-answer"> | ExerciseBase<"matching">;

function readExerciseType(exercise: ExerciseUnion): ExerciseType {
  switch (exercise.type) {
    case "typed-answer":
      return exercise.type;
    case "matching":
      return exercise.type;
    default:
      return assertNever(exercise);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected exercise type: ${String(value)}`);
}

it("composes into an exhaustive exercise union with stable IDs", () => {
  const exercises: readonly ExerciseUnion[] = [
    {
      id: "exercise.hiragana-a",
      type: "typed-answer",
      sourceItemIds: ["kana.hiragana.a"],
    },
    {
      id: "exercise.kana-matching",
      type: "matching",
      sourceItemIds: ["kana.hiragana.a", "kana.hiragana.i"],
    },
  ];

  expect(exercises.map(readExerciseType)).toEqual(["typed-answer", "matching"]);
});
