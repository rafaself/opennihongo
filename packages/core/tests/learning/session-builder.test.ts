import { describe, expect, it, vi } from "vitest";
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

type EligibleItem = Readonly<{
  id: string;
  prompt: Readonly<{ text: string }>;
  acceptedAnswers: readonly string[];
  left: string;
  right: string;
}>;

const eligibleItems: readonly EligibleItem[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: `kana.item.${String(index + 1)}`,
    prompt: { text: `Prompt ${String(index + 1)}` },
    acceptedAnswers: [`answer.${String(index + 1)}`],
    left: `left.${String(index + 1)}`,
    right: `right.${String(index + 1)}`,
  }),
);

const adapters: ExerciseSessionSourceAdapters<EligibleItem> = {
  "typed-answer": (item) => ({
    id: item.id,
    prompt: item.prompt,
    acceptedAnswers: item.acceptedAnswers,
  }),
  matching: (item) => ({ id: item.id, left: item.left, right: item.right }),
};

const generators: ExerciseSessionGenerators = {
  "typed-answer": generateTypedAnswerExercise,
  matching: generateMatchingExercise,
};

const initialKanaProfile: SessionProfile = {
  id: "kana.practice.initial",
  targetSessionSize: 2,
  exerciseMix: [
    { type: "typed-answer", count: 1 },
    { type: "matching", count: 1, config: { pairCount: 5 } },
  ],
  selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
};

function makeSelectionStrategy(
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

function build(
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

function expectBuildError(
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

describe("deterministic exercise session builder", () => {
  it("builds equivalent full sessions from equivalent inputs and seeds", () => {
    const first = build();
    const second = build();

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      id: "session.2026-09-28.a",
      profileId: initialKanaProfile.id,
      exercises: [
        { type: "typed-answer" },
        { type: "matching", config: { pairCount: 5 } },
      ],
    });
    expect(first.exercises[1]?.type).toBe("matching");
    if (first.exercises[1]?.type === "matching") {
      expect(first.exercises[1].pairs).toHaveLength(5);
    }
    expect(first.exercises[1]?.sourceItemIds).toContain(
      first.exercises[0]?.sourceItemIds[0],
    );
    expect(new Set(first.exercises.map(({ id }) => id)).size).toBe(2);
  });

  it("selects per exercise and routes exact adapted inputs in profile order", () => {
    const selected = eligibleItems.slice(0, 3);
    let selectionCall = 0;
    const strategy: ItemSelectionStrategy<
      EligibleItem,
      RandomizedItemSelectionRequest<EligibleItem>
    > = {
      id: "ordered.selection.v1",
      select: vi.fn(
        ({
          eligibleItems: items,
          count,
        }: RandomizedItemSelectionRequest<EligibleItem>) => {
          const result = items.slice(selectionCall, selectionCall + count);
          selectionCall += count;
          return result;
        },
      ),
    };
    const profile: SessionProfile = {
      id: "practice.order",
      targetSessionSize: 3,
      exerciseMix: [
        { type: "matching", count: 2, config: { pairCount: 1 } },
        { type: "typed-answer", count: 1 },
      ],
      selectionStrategyId: strategy.id,
    };
    const typedCalls: unknown[][] = [];
    const matchingCalls: unknown[][] = [];
    const callOrder: string[] = [];
    const spies: ExerciseSessionGenerators = {
      "typed-answer": (items, config, random) => {
        callOrder.push("typed-answer");
        typedCalls.push([items, config, random]);
        return generateTypedAnswerExercise(items, config, random);
      },
      matching: (items, config, random) => {
        callOrder.push("matching");
        matchingCalls.push([items, config, random]);
        return generateMatchingExercise(items, config, random);
      },
    };
    const random = new SeededRandomSource("boundary.seed");

    const session = buildExerciseSession({
      sessionId: "session.order",
      profile,
      eligibleItems,
      selectionStrategy: strategy,
      sourceAdapters: adapters,
      generators: spies,
      random,
    });

    expect(strategy.select).toHaveBeenNthCalledWith(1, {
      eligibleItems,
      count: 1,
      random,
    });
    expect(strategy.select).toHaveBeenNthCalledWith(2, {
      eligibleItems,
      count: 1,
      random,
    });
    expect(strategy.select).toHaveBeenNthCalledWith(3, {
      eligibleItems,
      count: 1,
      random,
    });
    expect(strategy.select).toHaveBeenCalledTimes(3);
    expect(callOrder).toEqual(["matching", "matching", "typed-answer"]);
    expect(session.exercises.map(({ type }) => type)).toEqual([
      "matching",
      "matching",
      "typed-answer",
    ]);
    expect(matchingCalls.map(([items]) => items)).toEqual([
      [
        {
          id: selected[0]?.id,
          left: selected[0]?.left,
          right: selected[0]?.right,
        },
      ],
      [
        {
          id: selected[1]?.id,
          left: selected[1]?.left,
          right: selected[1]?.right,
        },
      ],
    ]);
    expect(matchingCalls.map(([, config]) => config)).toEqual([
      { exerciseId: session.exercises[0]?.id, pairCount: 1 },
      { exerciseId: session.exercises[1]?.id, pairCount: 1 },
    ]);
    expect(typedCalls[0]?.[0]).toEqual([
      {
        id: selected[2]?.id,
        prompt: selected[2]?.prompt,
        acceptedAnswers: selected[2]?.acceptedAnswers,
      },
    ]);
    expect(typedCalls[0]?.[1]).toEqual({
      exerciseId: session.exercises[2]?.id,
    });
    expect(typedCalls[0]?.[2]).toBe(random);
    expect(
      matchingCalls.every(
        ([, config, passedRandom]) =>
          config !== undefined && passedRandom === random,
      ),
    ).toBe(true);
  });

  it("derives exercise identities from stable source identities, not selection order", () => {
    const profile: SessionProfile = {
      id: "practice.identity",
      targetSessionSize: 1,
      exerciseMix: [{ type: "matching", count: 1, config: { pairCount: 2 } }],
      selectionStrategyId: "ordered.selection.v1",
    };
    const first = buildExerciseSession({
      sessionId: "session.identity",
      profile,
      eligibleItems: eligibleItems.slice(0, 2),
      selectionStrategy: makeSelectionStrategy(
        (items) => items,
        profile.selectionStrategyId,
      ),
      sourceAdapters: adapters,
      generators,
      random: new SeededRandomSource("identity.seed"),
    });
    const second = buildExerciseSession({
      sessionId: "session.identity",
      profile,
      eligibleItems: eligibleItems.slice(0, 2),
      selectionStrategy: makeSelectionStrategy(
        (items) => [...items].reverse(),
        profile.selectionStrategyId,
      ),
      sourceAdapters: adapters,
      generators,
      random: new SeededRandomSource("identity.seed"),
    });

    expect(first.exercises[0]?.id).toBe(second.exercises[0]?.id);
    expect(first.exercises[0]?.sourceItemIds).not.toEqual(
      second.exercises[0]?.sourceItemIds,
    );
  });

  it("freezes the session and its generated exercise data", () => {
    const session = build();
    const firstExercise = session.exercises[0];
    const matchingExercise = session.exercises[1];

    expect(Object.isFrozen(session)).toBe(true);
    expect(Object.isFrozen(session.exercises)).toBe(true);
    expect(Object.isFrozen(firstExercise)).toBe(true);
    if (firstExercise?.type === "typed-answer") {
      expect(Object.isFrozen(firstExercise.prompt)).toBe(true);
      expect(Object.isFrozen(firstExercise.acceptedAnswers)).toBe(true);
      expect(Object.isFrozen(firstExercise.sourceItemIds)).toBe(true);
    }
    if (matchingExercise?.type === "matching") {
      expect(Object.isFrozen(matchingExercise.config)).toBe(true);
      expect(Object.isFrozen(matchingExercise.pairs)).toBe(true);
      expect(Object.isFrozen(matchingExercise.pairs[0])).toBe(true);
      expect(Object.isFrozen(matchingExercise.leftOrder)).toBe(true);
      expect(Object.isFrozen(matchingExercise.rightOrder)).toBe(true);
    }
  });

  it("rejects malformed profiles before selection", () => {
    const strategy = makeSelectionStrategy((items, count) =>
      items.slice(0, count),
    );
    const malformedProfile = {
      ...initialKanaProfile,
      targetSessionSize: 9,
    } as SessionProfile;

    expectBuildError(
      () => build({ profile: malformedProfile, selectionStrategy: strategy }),
      "invalid-profile",
    );
  });

  it("rejects a profile whose required strategy is unavailable", () => {
    const strategy = makeSelectionStrategy(
      (items, count) => items.slice(0, count),
      "other.selection.v1",
    );

    expectBuildError(
      () => build({ selectionStrategy: strategy }),
      "selection-strategy-mismatch",
    );
  });

  it("fails when the eligible pool cannot satisfy one exercise's demand", () => {
    const strategy = makeSelectionStrategy((items, count) =>
      items.slice(0, count),
    );
    const select = vi.spyOn(strategy, "select");

    expectBuildError(
      () =>
        build({
          eligibleItems: eligibleItems.slice(0, 3),
          selectionStrategy: strategy,
        }),
      "insufficient-source-items",
    );
    expect(select).not.toHaveBeenCalled();
  });

  it("rejects a matching selection with fewer unique source IDs than its pair count", () => {
    const previous = eligibleItems[3];
    const duplicate = eligibleItems[4];
    if (previous === undefined || duplicate === undefined) {
      throw new Error("The fixture needs five eligible items.");
    }
    const duplicateIdItems = [
      ...eligibleItems.slice(0, 4),
      { ...duplicate, id: previous.id },
    ];

    expectBuildError(
      () => build({ eligibleItems: duplicateIdItems }),
      "duplicate-source-item-id",
    );
  });

  it("fails explicitly if a strategy returns fewer items than requested", () => {
    const strategy = makeSelectionStrategy(() => []);

    expectBuildError(
      () => build({ selectionStrategy: strategy }),
      "incomplete-selection",
    );
  });

  it("rejects an invalid matching pair count", () => {
    const profile = {
      ...initialKanaProfile,
      exerciseMix: [{ type: "matching", count: 1, config: { pairCount: 0 } }],
    } as SessionProfile;

    expectBuildError(() => build({ profile }), "invalid-profile");
  });

  it("requires the generator and adapter for each declared exercise type", () => {
    expectBuildError(
      () =>
        build({
          generators: { "typed-answer": generateTypedAnswerExercise },
        }),
      "missing-generator",
    );
  });
});
