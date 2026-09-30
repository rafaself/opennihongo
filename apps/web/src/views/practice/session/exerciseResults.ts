import type {
  Exercise,
  ExerciseOutcome,
  ExerciseResult,
  ItemExerciseOutcome,
  MatchingExercise,
  MatchingPairId,
  TypedAnswerExercise,
  MultipleChoiceExercise,
} from "@opennihongo/core";

export function createSingleAnswerResult(
  exercise: TypedAnswerExercise | MultipleChoiceExercise,
  correct: boolean,
  attempts: number,
): ExerciseResult {
  const itemOutcome = correct ? "correct" : "incorrect";
  return {
    exerciseId: exercise.id,
    sourceItemResults: exercise.sourceItemIds.map((sourceItemId) => ({
      sourceItemId,
      outcome: itemOutcome,
    })),
    outcome: itemOutcome,
    attempts,
  };
}

export function createMatchingResult(
  exercise: MatchingExercise,
  matchedPairIds: readonly MatchingPairId[],
  attempts: number,
): ExerciseResult {
  const matchedIds = new Set(matchedPairIds);
  const sourceItemResults = exercise.pairs.map((pair) => {
    const outcome: ItemExerciseOutcome = matchedIds.has(pair.id)
      ? "correct"
      : "incorrect";
    return { sourceItemId: pair.sourceItemId, outcome };
  });
  const correctCount = sourceItemResults.filter(
    ({ outcome }) => outcome === "correct",
  ).length;

  return {
    exerciseId: exercise.id,
    sourceItemResults,
    outcome: getExerciseOutcome(correctCount, sourceItemResults.length),
    attempts,
  };
}

export function scoreExerciseResults(
  results: readonly ExerciseResult[],
): number {
  return results.reduce(
    (score, result) =>
      score +
      result.sourceItemResults.filter(({ outcome }) => outcome === "correct")
        .length,
    0,
  );
}

export function countExerciseItems(exercises: readonly Exercise[]): number {
  return exercises.reduce(
    (count, exercise) => count + exercise.sourceItemIds.length,
    0,
  );
}

function getExerciseOutcome(
  correctCount: number,
  totalCount: number,
): ExerciseOutcome {
  if (correctCount === 0) {
    return "incorrect";
  }
  if (correctCount === totalCount) {
    return "correct";
  }
  return "partially-correct";
}
