import { describe, expect, it } from "vitest";
import { createKanaPracticeSession } from "./createKanaPracticeSession";
import {
  countExerciseItems,
  createMatchingResult,
  createTypedAnswerResult,
  scoreExerciseResults,
} from "./exerciseResults";

describe("practice exercise results", () => {
  it("records a typed-answer skip with no attempts or correct source items", () => {
    const session = createKanaPracticeSession(0);
    const exercise = session.exercises.find(
      (candidate) => candidate.type === "typed-answer",
    );
    if (!exercise) {
      throw new Error(
        "The initial profile must generate a typed-answer exercise.",
      );
    }

    expect(createTypedAnswerResult(exercise, false, 0)).toEqual({
      exerciseId: exercise.id,
      sourceItemResults: exercise.sourceItemIds.map((sourceItemId) => ({
        sourceItemId,
        outcome: "incorrect",
      })),
      outcome: "incorrect",
      attempts: 0,
    });
  });

  it("preserves partial matching outcomes per source item and attempt count", () => {
    const session = createKanaPracticeSession(0);
    const exercise = session.exercises.find(
      (candidate) => candidate.type === "matching",
    );
    if (!exercise) {
      throw new Error("The initial profile must generate a matching exercise.");
    }
    const matchedPair = exercise.pairs[0];
    if (!matchedPair) {
      throw new Error("The initial profile must generate matching pairs.");
    }

    const partialResult = createMatchingResult(exercise, [matchedPair.id], 3);
    expect(partialResult).toEqual({
      exerciseId: exercise.id,
      sourceItemResults: exercise.pairs.map((pair) => ({
        sourceItemId: pair.sourceItemId,
        outcome: pair.id === matchedPair.id ? "correct" : "incorrect",
      })),
      outcome: "partially-correct",
      attempts: 3,
    });
    expect(scoreExerciseResults([partialResult])).toBe(1);
    expect(countExerciseItems(session.exercises)).toBe(6);
  });
});
