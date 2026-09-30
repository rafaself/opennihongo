import { expect } from "vitest";
import {
  ExerciseSessionBuildError,
  SeededRandomSource,
  buildExerciseSession,
  generateMatchingExercise,
  generateTypedAnswerExercise,
  randomWithoutReplacementSelectionStrategy,
  randomWithoutReplacementSelectionStrategyId,
  type ExerciseSessionGenerators,
  type ExerciseSessionBuildErrorCode,
  type ExerciseSessionSourceAdapters,
  type ItemSelectionStrategy,
  type RandomizedItemSelectionRequest,
  type SessionProfile,
} from "../../src";
export type EligibleItem = Readonly<{
  id: string;
  prompt: Readonly<{ text: string }>;
  acceptedAnswers: readonly string[];
  left: string;
  right: string;
}>;

export const eligibleItems: readonly EligibleItem[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: `kana.item.${String(index + 1)}`,
    prompt: { text: `Prompt ${String(index + 1)}` },
    acceptedAnswers: [`answer.${String(index + 1)}`],
    left: `left.${String(index + 1)}`,
    right: `right.${String(index + 1)}`,
  }),
);

export const adapters: ExerciseSessionSourceAdapters<EligibleItem> = {
  "typed-answer": (item) => ({
    id: item.id,
    prompt: item.prompt,
    acceptedAnswers: item.acceptedAnswers,
  }),
  matching: (item) => ({ id: item.id, left: item.left, right: item.right }),
};

export const generators: ExerciseSessionGenerators = {
  "typed-answer": generateTypedAnswerExercise,
  matching: generateMatchingExercise,
};

export const initialKanaProfile: SessionProfile = {
  id: "kana.practice.initial",
  targetSessionSize: 2,
  exerciseMix: [
    { type: "typed-answer", count: 1 },
    { type: "matching", count: 1, config: { pairCount: 5 } },
  ],
  selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
};

export function makeSelectionStrategy(
  select: (
    items: readonly EligibleItem[],
    count: number,
  ) => readonly EligibleItem[],
  id = initialKanaProfile.selectionStrategyId,
): ItemSelectionStrategy<
  EligibleItem,
  RandomizedItemSelectionRequest<EligibleItem>
> {
  return {
    id,
    select: ({ eligibleItems: items, count }) => select(items, count),
  };
}

export function build(
  overrides: Partial<
    Parameters<typeof buildExerciseSession<EligibleItem>>[0]
  > = {},
) {
  return buildExerciseSession<EligibleItem>({
    sessionId: "session.2026-09-28.a",
    profile: initialKanaProfile,
    eligibleItems,
    selectionStrategy: randomWithoutReplacementSelectionStrategy,
    sourceAdapters: adapters,
    generators,
    random: new SeededRandomSource("session.seed"),
    ...overrides,
  });
}

export function expectBuildError(
  action: () => unknown,
  code: ExerciseSessionBuildErrorCode,
): void {
  let thrown: unknown;
  try {
    action();
  } catch (error) {
    thrown = error;
  }

  expect(thrown).toBeInstanceOf(ExerciseSessionBuildError);
  expect((thrown as ExerciseSessionBuildError).code).toBe(code);
}
