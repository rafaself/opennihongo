import { describe, expect, it } from "vitest";
import {
  ExerciseGenerationError,
  generateTypedAnswerExercise,
} from "../../src";
import type { TypedAnswerSourceItem } from "../../src";

const kanaSourceItem: TypedAnswerSourceItem = {
  id: "kana.hiragana.a",
  prompt: { text: "あ" },
  acceptedAnswers: ["a", "ā"],
};

const noRandomnessRequired = {
  next: () => {
    throw new Error("Typed-answer generation must not draw randomness.");
  },
};

describe("generateTypedAnswerExercise", () => {
  it("copies selected Kana prompt, accepted answers, and stable source identity", () => {
    const exercise = generateTypedAnswerExercise(
      [kanaSourceItem],
      { exerciseId: "exercise.kana-hiragana-a" },
      noRandomnessRequired,
    );

    expect(exercise).toEqual({
      id: "exercise.kana-hiragana-a",
      type: "typed-answer",
      prompt: { text: "あ" },
      acceptedAnswers: ["a", "ā"],
      sourceItemIds: ["kana.hiragana.a"],
    });
    expect(exercise.prompt).not.toBe(kanaSourceItem.prompt);
    expect(exercise.acceptedAnswers).not.toBe(kanaSourceItem.acceptedAnswers);
  });

  it("is deterministic for equivalent source items and configuration", () => {
    const first = generateTypedAnswerExercise(
      [kanaSourceItem],
      { exerciseId: "exercise.kana-hiragana-a" },
      noRandomnessRequired,
    );
    const second = generateTypedAnswerExercise(
      [{ ...kanaSourceItem }],
      { exerciseId: "exercise.kana-hiragana-a" },
      noRandomnessRequired,
    );

    expect(second).toEqual(first);
  });

  it("rejects a missing source item with the generator contract error", () => {
    expect(() =>
      generateTypedAnswerExercise(
        [],
        { exerciseId: "exercise.kana-hiragana-a" },
        noRandomnessRequired,
      ),
    ).toThrow(
      expect.objectContaining({
        name: "ExerciseGenerationError",
        code: "insufficient-source-items",
      }),
    );
  });

  it("rejects multiple source items instead of making a selection", () => {
    expect(() =>
      generateTypedAnswerExercise(
        [kanaSourceItem, { ...kanaSourceItem, id: "kana.hiragana.i" }],
        { exerciseId: "exercise.kana-hiragana-a" },
        noRandomnessRequired,
      ),
    ).toThrow(
      expect.objectContaining({
        name: "ExerciseGenerationError",
        code: "invalid-configuration",
      }),
    );
  });

  it.each([
    ["an empty exercise ID", [kanaSourceItem], { exerciseId: " " }],
    [
      "an empty source item ID",
      [{ ...kanaSourceItem, id: " " }],
      { exerciseId: "exercise.kana-hiragana-a" },
    ],
    [
      "empty prompt text",
      [{ ...kanaSourceItem, prompt: { text: " " } }],
      { exerciseId: "exercise.kana-hiragana-a" },
    ],
    [
      "missing accepted answers",
      [{ ...kanaSourceItem, acceptedAnswers: [] }],
      { exerciseId: "exercise.kana-hiragana-a" },
    ],
    [
      "a blank accepted answer",
      [{ ...kanaSourceItem, acceptedAnswers: ["a", " "] }],
      { exerciseId: "exercise.kana-hiragana-a" },
    ],
  ] as const)("rejects %s", (_description, sourceItems, config) => {
    expect(() =>
      generateTypedAnswerExercise(sourceItems, config, noRandomnessRequired),
    ).toThrow(
      expect.objectContaining({
        name: "ExerciseGenerationError",
        code: "invalid-configuration",
      }),
    );
  });

  it("uses the shared domain error class", () => {
    expect(() =>
      generateTypedAnswerExercise(
        [],
        { exerciseId: "exercise.invalid" },
        noRandomnessRequired,
      ),
    ).toThrow(ExerciseGenerationError);
  });
});
