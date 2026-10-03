import { describe, expect, it, vi } from "vitest";
import {
  SeededRandomSource,
  buildExerciseSession,
  generateMatchingExercise,
  generateMultipleChoiceExercise,
  generateTypedAnswerExercise,
  type BuildExerciseSessionRequest,
  type ItemSelectionStrategy,
  type MultipleChoiceSourceItem,
  type RandomizedItemSelectionRequest,
  type SessionProfile,
  type TypedAnswerSourceItem,
} from "../../src";

type SourceItem = Readonly<{
  id: string;
  prompt: Readonly<{ text: string }>;
  acceptedAnswers: readonly string[];
  options: MultipleChoiceSourceItem["options"];
  correctOptionId: string;
}>;

const eligibleItems: readonly SourceItem[] = [1, 2, 3].map((number) => ({
  id: `kana.${String(number)}`,
  prompt: { text: `かな${String(number)}` },
  acceptedAnswers: [`kana-${String(number)}`],
  correctOptionId: "correct",
  options: ["correct", "option-a", "option-b", "option-c"].map((id, index) => ({
    id,
    text: `answer-${String(number)}-${String(index)}`,
  })),
}));

const profile: SessionProfile = {
  id: "kana.practice.selection",
  targetSessionSize: 4,
  selectionStrategyId: "first-eligible.v1",
  exerciseMix: [
    { type: "typed-answer", count: 2 },
    { type: "multiple-choice", count: 2 },
  ],
};

const selectionStrategy: ItemSelectionStrategy<
  SourceItem,
  RandomizedItemSelectionRequest<SourceItem>
> = {
  id: profile.selectionStrategyId,
  select: vi.fn(
    ({
      eligibleItems: items,
      count,
    }: RandomizedItemSelectionRequest<SourceItem>) => items.slice(0, count),
  ),
};

function build(
  overrides: Partial<BuildExerciseSessionRequest<SourceItem>> = {},
) {
  return buildExerciseSession({
    sessionId: "session.selection",
    profile,
    eligibleItems,
    selectionStrategy,
    sourceAdapters: {
      "typed-answer": (item): TypedAnswerSourceItem => ({
        id: item.id,
        prompt: item.prompt,
        acceptedAnswers: item.acceptedAnswers,
      }),
      "multiple-choice": (item): MultipleChoiceSourceItem => ({
        id: item.id,
        prompt: item.prompt,
        options: item.options,
        correctOptionId: item.correctOptionId,
      }),
    },
    generators: {
      "typed-answer": generateTypedAnswerExercise,
      "multiple-choice": generateMultipleChoiceExercise,
    },
    random: new SeededRandomSource("session.selection"),
    ...overrides,
  });
}

describe("exercise session source selection", () => {
  it("avoids same-type reuse while allowing reuse across exercise types", () => {
    const session = build();
    const typedAnswers = session.exercises.filter(
      ({ type }) => type === "typed-answer",
    );
    const multipleChoice = session.exercises.filter(
      ({ type }) => type === "multiple-choice",
    );
    const typedIds = typedAnswers.flatMap(({ sourceItemIds }) => sourceItemIds);
    const multipleChoiceIds = multipleChoice.flatMap(
      ({ sourceItemIds }) => sourceItemIds,
    );

    expect(typedIds).toHaveLength(2);
    expect(new Set(typedIds).size).toBe(2);
    expect(multipleChoiceIds).toHaveLength(2);
    expect(new Set(multipleChoiceIds).size).toBe(2);
    expect(typedIds).toEqual([eligibleItems[0]?.id, eligibleItems[1]?.id]);
    expect(multipleChoiceIds).toEqual([
      eligibleItems[0]?.id,
      eligibleItems[1]?.id,
    ]);
    expect(new Set(session.exercises.map(({ id }) => id)).size).toBe(4);
    expect(selectionStrategy.select).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        eligibleItems: eligibleItems.slice(1),
        count: 1,
      }),
    );
    expect(selectionStrategy.select).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        eligibleItems: eligibleItems.slice(1),
        count: 1,
      }),
    );
  });

  it("reports when later exercises cannot get enough unused source items", () => {
    const matchingProfile: SessionProfile = {
      id: "kana.practice.matching-selection",
      targetSessionSize: 2,
      selectionStrategyId: "first-eligible.v1",
      exerciseMix: [{ type: "matching", count: 2, config: { pairCount: 2 } }],
    };

    expect(() =>
      build({
        profile: matchingProfile,
        eligibleItems: eligibleItems.slice(0, 3),
        selectionStrategy: {
          id: matchingProfile.selectionStrategyId,
          select: ({ eligibleItems: items, count }) => items.slice(0, count),
        },
        sourceAdapters: {
          matching: (item) => ({
            id: item.id,
            left: item.prompt.text,
            right: item.acceptedAnswers[0] ?? "",
          }),
        },
        generators: { matching: generateMatchingExercise },
      }),
    ).toThrow(
      expect.objectContaining({
        code: "insufficient-source-items",
      }),
    );
  });

  it("rejects a strategy that reuses a source item excluded from its pool", () => {
    const typedProfile: SessionProfile = {
      ...profile,
      targetSessionSize: 2,
      exerciseMix: [{ type: "typed-answer", count: 2 }],
    };
    const strategy: ItemSelectionStrategy<
      SourceItem,
      RandomizedItemSelectionRequest<SourceItem>
    > = {
      id: typedProfile.selectionStrategyId,
      select: () => {
        const firstItem = eligibleItems[0];
        if (firstItem === undefined) throw new Error("Missing test item.");
        return [firstItem];
      },
    };

    expect(() =>
      build({ profile: typedProfile, selectionStrategy: strategy }),
    ).toThrow(
      expect.objectContaining({
        code: "duplicate-source-item-id",
      }),
    );
  });
});
