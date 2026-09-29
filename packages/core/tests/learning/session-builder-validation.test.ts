import { describe, expect, it } from "vitest";
import {
  ExerciseSessionBuildError,
  SeededRandomSource,
  buildExerciseSession,
  generateMatchingExercise,
  generateTypedAnswerExercise,
  randomWithoutReplacementSelectionStrategy,
  randomWithoutReplacementSelectionStrategyId,
  type BuildExerciseSessionRequest,
  type ExerciseSessionBuildErrorCode,
  type ExerciseSessionGenerators,
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

const items: readonly EligibleItem[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: `item.${String(index + 1)}`,
    prompt: { text: `Prompt ${String(index + 1)}` },
    acceptedAnswers: [`answer.${String(index + 1)}`],
    left: `left.${String(index + 1)}`,
    right: `right.${String(index + 1)}`,
  }),
);

const profile: SessionProfile = {
  id: "kana.practice.initial",
  targetSessionSize: 2,
  exerciseMix: [
    { type: "typed-answer", count: 1 },
    { type: "matching", count: 1, config: { pairCount: 5 } },
  ],
  selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
};

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

function build(
  overrides: Partial<BuildExerciseSessionRequest<EligibleItem>> = {},
) {
  return buildExerciseSession<EligibleItem>({
    sessionId: "session.validation",
    profile,
    eligibleItems: items,
    selectionStrategy: randomWithoutReplacementSelectionStrategy,
    sourceAdapters: adapters,
    generators,
    random: new SeededRandomSource("validation.seed"),
    ...overrides,
  });
}

function expectCode(
  action: () => unknown,
  code: ExerciseSessionBuildErrorCode,
) {
  let thrown: unknown;
  try {
    action();
  } catch (error) {
    thrown = error;
  }
  expect(thrown).toBeInstanceOf(ExerciseSessionBuildError);
  expect((thrown as ExerciseSessionBuildError).code).toBe(code);
}

function profileWith(overrides: Record<string, unknown>): unknown {
  return { ...profile, ...overrides };
}

const malformedProfiles: readonly Readonly<{
  label: string;
  profile: unknown;
}>[] = [
  { label: "null profile", profile: null },
  { label: "non-object profile", profile: 1 },
  { label: "non-string profile ID", profile: profileWith({ id: null }) },
  { label: "empty profile ID", profile: profileWith({ id: " " }) },
  {
    label: "non-string strategy ID",
    profile: profileWith({ selectionStrategyId: null }),
  },
  {
    label: "empty strategy ID",
    profile: profileWith({ selectionStrategyId: " " }),
  },
  {
    label: "non-number target",
    profile: profileWith({ targetSessionSize: "2" }),
  },
  { label: "unsafe target", profile: profileWith({ targetSessionSize: 1.5 }) },
  {
    label: "non-positive target",
    profile: profileWith({ targetSessionSize: 0 }),
  },
  { label: "non-array mix", profile: profileWith({ exerciseMix: null }) },
  { label: "empty mix", profile: profileWith({ exerciseMix: [] }) },
  { label: "null mix entry", profile: profileWith({ exerciseMix: [null] }) },
  { label: "primitive mix entry", profile: profileWith({ exerciseMix: [1] }) },
  {
    label: "non-number exercise count",
    profile: profileWith({
      exerciseMix: [{ type: "typed-answer", count: "1" }],
    }),
  },
  {
    label: "unsafe exercise count",
    profile: profileWith({
      exerciseMix: [{ type: "typed-answer", count: 1.5 }],
    }),
  },
  {
    label: "non-positive exercise count",
    profile: profileWith({ exerciseMix: [{ type: "typed-answer", count: 0 }] }),
  },
  {
    label: "unsupported exercise type",
    profile: profileWith({ exerciseMix: [{ type: "choice", count: 1 }] }),
  },
  {
    label: "null matching config",
    profile: profileWith({
      targetSessionSize: 1,
      exerciseMix: [{ type: "matching", count: 1, config: null }],
    }),
  },
  {
    label: "non-number pair count",
    profile: profileWith({
      targetSessionSize: 1,
      exerciseMix: [{ type: "matching", count: 1, config: { pairCount: "5" } }],
    }),
  },
  {
    label: "unsafe pair count",
    profile: profileWith({
      targetSessionSize: 1,
      exerciseMix: [{ type: "matching", count: 1, config: { pairCount: 1.5 } }],
    }),
  },
  {
    label: "non-positive pair count",
    profile: profileWith({
      targetSessionSize: 1,
      exerciseMix: [{ type: "matching", count: 1, config: { pairCount: 0 } }],
    }),
  },
  {
    label: "unsafe aggregate source demand",
    profile: profileWith({
      targetSessionSize: Number.MAX_SAFE_INTEGER,
      exerciseMix: [
        {
          type: "matching",
          count: Number.MAX_SAFE_INTEGER,
          config: { pairCount: 2 },
        },
      ],
    }),
  },
];

describe("exercise session request validation", () => {
  it.each(malformedProfiles)(
    "rejects $label",
    ({ profile: invalidProfile }) => {
      expectCode(
        () => build({ profile: invalidProfile as SessionProfile }),
        "invalid-profile",
      );
    },
  );

  it("rejects an empty stable session ID", () => {
    expectCode(() => build({ sessionId: " " }), "invalid-request");
  });

  it("rejects a non-array eligible pool at runtime", () => {
    const invalidPool = null as unknown as readonly EligibleItem[];
    expectCode(() => build({ eligibleItems: invalidPool }), "invalid-request");
  });

  it.each([
    {
      label: "typed-answer adapter",
      request: {
        sourceAdapters: {
          matching: (item: EligibleItem) => ({
            id: item.id,
            left: item.left,
            right: item.right,
          }),
        },
      },
    },
    {
      label: "typed-answer generator",
      request: { generators: { matching: generateMatchingExercise } },
    },
    {
      label: "matching adapter",
      request: {
        sourceAdapters: {
          "typed-answer": (item: EligibleItem) => ({
            id: item.id,
            prompt: item.prompt,
            acceptedAnswers: item.acceptedAnswers,
          }),
        },
      },
    },
  ])("rejects a missing $label", ({ request }) => {
    expectCode(() => build(request), "missing-generator");
  });

  it("rejects a selection strategy that returns a non-array value", () => {
    const strategy: ItemSelectionStrategy<
      EligibleItem,
      RandomizedItemSelectionRequest<EligibleItem>
    > = {
      id: profile.selectionStrategyId,
      select: () => undefined as unknown as readonly EligibleItem[],
    };
    expectCode(
      () => build({ selectionStrategy: strategy }),
      "incomplete-selection",
    );
  });

  it("rejects duplicate exercise identity instead of producing unstable IDs", () => {
    const repeatedMatchingProfile: SessionProfile = {
      id: "practice.repeated-matching",
      targetSessionSize: 2,
      exerciseMix: [{ type: "matching", count: 2, config: { pairCount: 1 } }],
      selectionStrategyId: "repeat-first.v1",
    };
    const strategy: ItemSelectionStrategy<
      EligibleItem,
      RandomizedItemSelectionRequest<EligibleItem>
    > = {
      id: repeatedMatchingProfile.selectionStrategyId,
      select: ({ eligibleItems }) => eligibleItems.slice(0, 1),
    };

    expectCode(
      () =>
        build({
          profile: repeatedMatchingProfile,
          selectionStrategy: strategy,
        }),
      "duplicate-exercise-id",
    );
  });

  it("rejects selected source items without stable IDs", () => {
    const sourceAdapters: ExerciseSessionSourceAdapters<EligibleItem> = {
      ...adapters,
      "typed-answer": (item) => ({
        id: " ",
        prompt: item.prompt,
        acceptedAnswers: item.acceptedAnswers,
      }),
    };
    expectCode(() => build({ sourceAdapters }), "invalid-source-item");
  });

  it("rejects a generator that changes its assigned identities", () => {
    const invalidGenerators: ExerciseSessionGenerators = {
      ...generators,
      "typed-answer": (sourceItems, config, random) => ({
        ...generateTypedAnswerExercise(sourceItems, config, random),
        id: "different.exercise.id",
      }),
    };
    expectCode(
      () => build({ generators: invalidGenerators }),
      "invalid-generated-exercise",
    );
  });

  it("rejects a generator result that is not an exercise object", () => {
    const invalidGenerators: ExerciseSessionGenerators = {
      ...generators,
      "typed-answer": () =>
        null as unknown as ReturnType<typeof generateTypedAnswerExercise>,
    };
    expectCode(
      () => build({ generators: invalidGenerators }),
      "invalid-generated-exercise",
    );
  });
});
