import type { Exercise, ExerciseResult } from "../exercises/index";
import type { ExerciseSession } from "./session-builder-contracts";

/** Transient domain state; persistence of active sessions is not required. */
export type ExerciseSessionState = Readonly<{
  session: ExerciseSession;
  index: number;
  results: readonly ExerciseResult[];
}>;

export function createExerciseSessionState(
  session: ExerciseSession,
): ExerciseSessionState {
  return { session, index: 0, results: [] };
}

export function getCurrentExercise(
  state: ExerciseSessionState,
): Exercise | undefined {
  return state.session.exercises[state.index];
}

/** Records one result, retaining the current prompt until the learner continues. */
export function recordExerciseSessionResult(
  state: ExerciseSessionState,
  result: ExerciseResult,
): ExerciseSessionState {
  const exercise = getCurrentExercise(state);
  if (!exercise || result.exerciseId !== exercise.id) {
    throw new Error("A result must belong to the current exercise.");
  }
  if (state.results.length !== state.index) {
    throw new Error("The current exercise already has a result.");
  }
  const resultItemIds = new Set(
    result.sourceItemResults.map(({ sourceItemId }) => sourceItemId),
  );
  if (
    result.sourceItemResults.length !== exercise.sourceItemIds.length ||
    resultItemIds.size !== exercise.sourceItemIds.length ||
    exercise.sourceItemIds.some((id) => !resultItemIds.has(id))
  ) {
    throw new Error("Result source items must match the generated exercise.");
  }
  return { ...state, results: [...state.results, result] };
}

export function advanceExerciseSession(
  state: ExerciseSessionState,
): ExerciseSessionState {
  if (!getCurrentExercise(state) || state.results.length !== state.index + 1) {
    throw new Error("An exercise result is required before advancing.");
  }
  return { ...state, index: state.index + 1 };
}
