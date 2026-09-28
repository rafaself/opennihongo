import { expect, it } from "vitest";
import type { ExerciseResult } from "../src";

it("represents typed-answer outcomes against their stable source item IDs", () => {
  const result = {
    exerciseId: "exercise.hiragana-a",
    outcome: "correct",
    attempts: 2,
    sourceItemResults: [
      { sourceItemId: "kana.hiragana.a", outcome: "correct" },
    ],
  } as const satisfies ExerciseResult;

  expect(result.sourceItemResults).toEqual([
    { sourceItemId: "kana.hiragana.a", outcome: "correct" },
  ]);
  expect(result.attempts).toBe(2);
});

it("represents per-item outcomes for a partially correct matching exercise", () => {
  const result = {
    exerciseId: "exercise.vocabulary-matching",
    outcome: "partially-correct",
    attempts: 1,
    sourceItemResults: [
      { sourceItemId: "vocabulary.soto", outcome: "correct" },
      { sourceItemId: "vocabulary.hato", outcome: "incorrect" },
    ],
  } as const satisfies ExerciseResult;

  expect(result.outcome).toBe("partially-correct");
  expect(
    result.sourceItemResults.map(({ sourceItemId }) => sourceItemId),
  ).toEqual(["vocabulary.soto", "vocabulary.hato"]);
});
