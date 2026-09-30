import { describe, expect, it } from "vitest";
import { ExerciseGenerationError } from "../../src";
import type {
  ExerciseGenerator,
  MatchingExercise,
  TypedAnswerExercise,
} from "../../src";

const typedAnswerExercise: TypedAnswerExercise = {
  id: "exercise.kana-a",
  type: "typed-answer",
  prompt: { text: "あ" },
  acceptedAnswers: ["a"],
  sourceItemIds: ["kana.hiragana.a"],
};

const matchingExercise: MatchingExercise = {
  id: "exercise.matching-a",
  type: "matching",
  sourceItemIds: ["kana.hiragana.a"],
  config: { pairCount: 1 },
  pairs: [
    {
      id: "pair.kana-a",
      sourceItemId: "kana.hiragana.a",
      left: "あ",
      right: "a",
    },
  ],
  leftOrder: ["pair.kana-a"],
  rightOrder: ["pair.kana-a"],
};

describe("ExerciseGenerator", () => {
  it("returns a concrete typed-answer exercise from selected items", () => {
    const generator: ExerciseGenerator<
      string,
      undefined,
      TypedAnswerExercise
    > = (sourceItems, config, random) => {
      expect(sourceItems).toEqual(["selected item"]);
      expect(config).toBeUndefined();
      expect(random.next()).toBe(0.5);

      return typedAnswerExercise;
    };

    expect(generator(["selected item"], undefined, { next: () => 0.5 })).toBe(
      typedAnswerExercise,
    );
  });

  it("returns a concrete matching exercise from selected items", () => {
    const generator: ExerciseGenerator<
      string,
      { pairCount: number },
      MatchingExercise
    > = (sourceItems, config, random) => {
      expect(sourceItems).toEqual(["selected item"]);
      expect(config).toEqual({ pairCount: 1 });
      expect(random.next()).toBe(0.5);

      return matchingExercise;
    };

    expect(
      generator(["selected item"], { pairCount: 1 }, { next: () => 0.5 }),
    ).toBe(matchingExercise);
  });
});

describe("ExerciseGenerationError", () => {
  it.each([
    ["invalid-configuration", "pairCount must be a positive integer."],
    ["insufficient-source-items", "Expected 3 unique items but received 2."],
  ] as const)("exposes the %s failure reason", (code, message) => {
    const error = new ExerciseGenerationError(code, message);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ExerciseGenerationError");
    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
  });
});
