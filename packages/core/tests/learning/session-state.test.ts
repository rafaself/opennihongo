import { describe, expect, it } from "vitest";
import {
  advanceExerciseSession,
  createExerciseSessionState,
  getCurrentExercise,
  recordExerciseSessionResult,
  createSingleAnswerResult,
  createMatchingResult,
  generateMatchingExercise,
  SeededRandomSource,
  type ExerciseSession,
  type TypedAnswerExercise,
} from "../../src";

const first: TypedAnswerExercise = {
  id: "exercise.first",
  type: "typed-answer",
  prompt: { text: "あ" },
  acceptedAnswers: ["a"],
  sourceItemIds: ["kana.hiragana.a"],
};
const second: TypedAnswerExercise = {
  ...first,
  id: "exercise.second",
  prompt: { text: "い" },
  acceptedAnswers: ["i"],
  sourceItemIds: ["kana.hiragana.i"],
};
const session: ExerciseSession = {
  id: "lesson",
  profileId: "lesson.profile",
  exercises: [first, second],
};

describe("exercise session state", () => {
  it("validates matching results by stable item identity regardless of result order", () => {
    const exercise = generateMatchingExercise(
      [
        { id: "item.a", left: "a", right: "あ" },
        { id: "item.i", left: "i", right: "い" },
      ],
      { exerciseId: "exercise.matching", pairCount: 2 },
      new SeededRandomSource("matching"),
    );
    const initial = createExerciseSessionState({
      ...session,
      exercises: [exercise],
    });
    const result = createMatchingResult(
      exercise,
      [exercise.pairs[0]?.id ?? ""],
      2,
    );
    const reversed = {
      ...result,
      sourceItemResults: [...result.sourceItemResults].reverse(),
    };
    expect(recordExerciseSessionResult(initial, reversed).results).toEqual([
      reversed,
    ]);
    const repeated = { sourceItemId: "item.a", outcome: "correct" } as const;
    const duplicate = { ...result, sourceItemResults: [repeated, repeated] };
    expect(() => recordExerciseSessionResult(initial, duplicate)).toThrow(
      /source items/i,
    );
  });

  it("records results before advancing and completes without mutating previous state", () => {
    const initial = createExerciseSessionState(session);
    expect(getCurrentExercise(initial)).toBe(first);
    const answered = recordExerciseSessionResult(
      initial,
      createSingleAnswerResult(first, true, 1),
    );
    expect(getCurrentExercise(answered)).toBe(first);
    expect(initial.results).toEqual([]);
    const next = advanceExerciseSession(answered);
    expect(getCurrentExercise(next)).toBe(second);
    expect(answered.index).toBe(0);
    const complete = advanceExerciseSession(
      recordExerciseSessionResult(
        next,
        createSingleAnswerResult(second, false, 1),
      ),
    );
    expect(getCurrentExercise(complete)).toBeUndefined();
    expect(complete.results.map(({ outcome }) => outcome)).toEqual([
      "correct",
      "incorrect",
    ]);
    expect(createExerciseSessionState(session).results).toEqual([]);
  });

  it("requires a result before advancing", () => {
    expect(() =>
      advanceExerciseSession(createExerciseSessionState(session)),
    ).toThrow(/result/i);
  });

  it("rejects duplicate, out-of-order, and completed-session submissions", () => {
    const initial = createExerciseSessionState(session);
    expect(() =>
      recordExerciseSessionResult(
        initial,
        createSingleAnswerResult(second, true, 1),
      ),
    ).toThrow(/current exercise/i);
    const answered = recordExerciseSessionResult(
      initial,
      createSingleAnswerResult(first, true, 1),
    );
    expect(() =>
      recordExerciseSessionResult(
        answered,
        createSingleAnswerResult(first, false, 1),
      ),
    ).toThrow(/already/i);
    const complete = createExerciseSessionState({ ...session, exercises: [] });
    expect(getCurrentExercise(complete)).toBeUndefined();
    expect(() =>
      recordExerciseSessionResult(
        complete,
        createSingleAnswerResult(first, true, 1),
      ),
    ).toThrow(/current exercise/i);
    expect(() => advanceExerciseSession(complete)).toThrow(/result/i);
  });

  it("rejects results whose source items do not match the generated exercise", () => {
    const initial = createExerciseSessionState(session);
    const result = createSingleAnswerResult(first, true, 1);
    for (const sourceItemResults of [
      [],
      [{ sourceItemId: "other", outcome: "correct" as const }],
    ]) {
      expect(() =>
        recordExerciseSessionResult(initial, { ...result, sourceItemResults }),
      ).toThrow(/source items/i);
    }
  });
});
