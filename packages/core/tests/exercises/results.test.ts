import { describe, expect, it } from "vitest";
import {
  countExerciseItems,
  createMatchingResult,
  createSingleAnswerResult,
  evaluateTypedAnswer,
  scoreExerciseResults,
  type MatchingExercise,
  type TypedAnswerExercise,
} from "../../src";

const typed: TypedAnswerExercise = {
  id: "exercise.reading",
  type: "typed-answer",
  prompt: { text: "hello" },
  acceptedAnswers: ["hello", "hi"],
  sourceItemIds: ["vocabulary.hello"],
};
const matching: MatchingExercise = {
  id: "exercise.matching",
  type: "matching",
  config: { pairCount: 2 },
  pairs: [
    {
      id: "pair.hello",
      sourceItemId: "vocabulary.hello",
      left: "hello",
      right: "こんにちは",
    },
    {
      id: "pair.goodbye",
      sourceItemId: "vocabulary.goodbye",
      left: "goodbye",
      right: "さようなら",
    },
  ],
  sourceItemIds: ["vocabulary.hello", "vocabulary.goodbye"],
  leftOrder: ["pair.hello", "pair.goodbye"],
  rightOrder: ["pair.goodbye", "pair.hello"],
};

describe("exercise evaluation and results", () => {
  it("evaluates all accepted answers using the caller's normalization policy", () => {
    const normalize = (value: string) => value.trim().toLowerCase();
    expect(evaluateTypedAnswer(typed, " HI ", normalize)).toEqual({
      exerciseId: typed.id,
      sourceItemResults: [
        { sourceItemId: "vocabulary.hello", outcome: "correct" },
      ],
      outcome: "correct",
      attempts: 1,
    });
    expect(evaluateTypedAnswer(typed, " HI ", (value) => value).outcome).toBe(
      "incorrect",
    );
    expect(evaluateTypedAnswer(typed, "wrong", normalize).outcome).toBe(
      "incorrect",
    );
  });

  it("records skips with no attempts or correct source items", () => {
    expect(createSingleAnswerResult(typed, false, 0)).toEqual({
      exerciseId: typed.id,
      sourceItemResults: [
        { sourceItemId: "vocabulary.hello", outcome: "incorrect" },
      ],
      outcome: "incorrect",
      attempts: 0,
    });
    expect(scoreExerciseResults([])).toBe(0);
    expect(countExerciseItems([])).toBe(0);
  });

  it("retains item-level partial matching outcomes and counts each matched pair once", () => {
    const partial = createMatchingResult(
      matching,
      ["pair.hello", "pair.hello", "unknown"],
      3,
    );
    expect(partial).toEqual({
      exerciseId: matching.id,
      sourceItemResults: [
        { sourceItemId: "vocabulary.hello", outcome: "correct" },
        { sourceItemId: "vocabulary.goodbye", outcome: "incorrect" },
      ],
      outcome: "partially-correct",
      attempts: 3,
    });
    expect(
      scoreExerciseResults([partial, createSingleAnswerResult(typed, true, 1)]),
    ).toBe(2);
    expect(countExerciseItems([typed, matching])).toBe(3);
  });

  it("represents unmatched and fully matched boards", () => {
    expect(createMatchingResult(matching, [], 0).outcome).toBe("incorrect");
    const complete = createMatchingResult(matching, matching.rightOrder, 4);
    expect(complete.outcome).toBe("correct");
    expect(scoreExerciseResults([complete])).toBe(2);
  });
});
