import { describe, expect, it } from "vitest";
import {
  ExerciseGenerationError,
  SeededRandomSource,
  generateMatchingExercise,
} from "../../src";
import type { MatchingSourceItem } from "../../src";

const sourceItems = [
  { id: "word.soto", left: "そと", right: "outside" },
  { id: "word.hato", left: "はと", right: "pigeon" },
  { id: "word.mizu", left: "みず", right: "water" },
  { id: "word.hana", left: "はな", right: "flower" },
  { id: "word.neko", left: "ねこ", right: "cat" },
] as const satisfies readonly MatchingSourceItem[];

function scriptedRandom(values: readonly number[]) {
  let index = 0;

  return {
    next() {
      const value = values[index];
      index += 1;

      if (value === undefined) {
        throw new Error("Unexpected random draw.");
      }

      return value;
    },
  };
}

describe("generateMatchingExercise", () => {
  it("generates five stable source-linked pairs and independently ordered sides", () => {
    const exercise = generateMatchingExercise(
      sourceItems,
      { exerciseId: "exercise.vocabulary", pairCount: 5 },
      scriptedRandom([0, 0, 0, 0, 0.99, 0.99, 0.99, 0.99]),
    );

    expect(exercise).toEqual({
      id: "exercise.vocabulary",
      type: "matching",
      sourceItemIds: sourceItems.map(({ id }) => id),
      config: { pairCount: 5 },
      pairs: sourceItems.map((item) => ({
        id: `pair.${item.id}`,
        sourceItemId: item.id,
        left: item.left,
        right: item.right,
      })),
      leftOrder: [
        "pair.word.hato",
        "pair.word.mizu",
        "pair.word.hana",
        "pair.word.neko",
        "pair.word.soto",
      ],
      rightOrder: [
        "pair.word.soto",
        "pair.word.hato",
        "pair.word.mizu",
        "pair.word.hana",
        "pair.word.neko",
      ],
    });
  });

  it("is reproducible for the same inputs and seed", () => {
    const first = generateMatchingExercise(
      sourceItems.slice(0, 3),
      { exerciseId: "exercise.vocabulary", pairCount: 3 },
      new SeededRandomSource("practice-seed"),
    );
    const second = generateMatchingExercise(
      sourceItems.slice(0, 3),
      { exerciseId: "exercise.vocabulary", pairCount: 3 },
      new SeededRandomSource("practice-seed"),
    );

    expect(second).toEqual(first);
  });

  it.each([1, 2, 5])("accepts a configured pair count of %i", (pairCount) => {
    const exercise = generateMatchingExercise(
      sourceItems.slice(0, pairCount),
      { exerciseId: "exercise.vocabulary", pairCount },
      new SeededRandomSource(`pairs-${String(pairCount)}`),
    );

    expect(exercise.pairs).toHaveLength(pairCount);
    expect(exercise.sourceItemIds).toHaveLength(pairCount);
    expect(exercise.config.pairCount).toBe(pairCount);
  });

  it("keeps pair content and source references intact after ordering", () => {
    const exercise = generateMatchingExercise(
      sourceItems.slice(0, 3),
      { exerciseId: "exercise.vocabulary", pairCount: 3 },
      new SeededRandomSource("integrity-seed"),
    );
    const pairsById = new Map(exercise.pairs.map((pair) => [pair.id, pair]));

    for (const pairId of [...exercise.leftOrder, ...exercise.rightOrder]) {
      expect(pairsById.has(pairId)).toBe(true);
    }

    expect(exercise.pairs.map(({ sourceItemId }) => sourceItemId)).toEqual(
      sourceItems.slice(0, 3).map(({ id }) => id),
    );
    expect(exercise.pairs.map(({ left, right }) => [left, right])).toEqual(
      sourceItems.slice(0, 3).map(({ left, right }) => [left, right]),
    );
  });

  it("rejects duplicate source IDs instead of producing duplicate pair IDs", () => {
    expect(() =>
      generateMatchingExercise(
        [sourceItems[0], { ...sourceItems[1], id: sourceItems[0].id }],
        { exerciseId: "exercise.vocabulary", pairCount: 2 },
        new SeededRandomSource("duplicates"),
      ),
    ).toThrow(
      expect.objectContaining({
        name: "ExerciseGenerationError",
        code: "invalid-configuration",
      }),
    );
  });

  it.each([
    [
      "a blank exercise ID",
      sourceItems.slice(0, 1),
      { exerciseId: " ", pairCount: 1 },
    ],
    [
      "a zero pair count",
      sourceItems.slice(0, 1),
      { exerciseId: "exercise.vocabulary", pairCount: 0 },
    ],
    [
      "a fractional pair count",
      sourceItems.slice(0, 1),
      { exerciseId: "exercise.vocabulary", pairCount: 1.5 },
    ],
    [
      "an empty source ID",
      [{ ...sourceItems[0], id: " " }],
      { exerciseId: "exercise.vocabulary", pairCount: 1 },
    ],
    [
      "blank left text",
      [{ ...sourceItems[0], left: " " }],
      { exerciseId: "exercise.vocabulary", pairCount: 1 },
    ],
    [
      "blank right text",
      [{ ...sourceItems[0], right: " " }],
      { exerciseId: "exercise.vocabulary", pairCount: 1 },
    ],
  ] as const)("rejects %s", (_description, items, config) => {
    expect(() =>
      generateMatchingExercise(
        items,
        config,
        new SeededRandomSource("invalid"),
      ),
    ).toThrow(
      expect.objectContaining({
        name: "ExerciseGenerationError",
        code: "invalid-configuration",
      }),
    );
  });

  it("reports an empty selected set as insufficient source items", () => {
    expect(() =>
      generateMatchingExercise(
        [],
        { exerciseId: "exercise.vocabulary", pairCount: 1 },
        new SeededRandomSource("empty"),
      ),
    ).toThrow(ExerciseGenerationError);

    expect(() =>
      generateMatchingExercise(
        [],
        { exerciseId: "exercise.vocabulary", pairCount: 1 },
        new SeededRandomSource("empty"),
      ),
    ).toThrow(expect.objectContaining({ code: "insufficient-source-items" }));
  });

  it("reports too few selected source items as insufficient", () => {
    expect(() =>
      generateMatchingExercise(
        sourceItems.slice(0, 1),
        { exerciseId: "exercise.vocabulary", pairCount: 2 },
        new SeededRandomSource("under-selected"),
      ),
    ).toThrow(expect.objectContaining({ code: "insufficient-source-items" }));
  });

  it("rejects an over-selected set instead of selecting a subset", () => {
    expect(() =>
      generateMatchingExercise(
        sourceItems.slice(0, 2),
        { exerciseId: "exercise.vocabulary", pairCount: 1 },
        new SeededRandomSource("over-selected"),
      ),
    ).toThrow(
      expect.objectContaining({
        name: "ExerciseGenerationError",
        code: "invalid-configuration",
      }),
    );
  });
});
