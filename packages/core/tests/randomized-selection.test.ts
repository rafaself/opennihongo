import { describe, expect, it } from "vitest";
import {
  randomWithoutReplacementSelectionStrategy,
  randomWithoutReplacementSelectionStrategyId,
  SeededRandomSource,
} from "../src";

const eligibleItems = [
  { id: "kana.a", value: "あ" },
  { id: "kana.i", value: "い" },
  { id: "kana.u", value: "う" },
  { id: "kana.e", value: "え" },
  { id: "kana.o", value: "お" },
] as const;

describe("random without-replacement item selection", () => {
  it("exposes its stable strategy identifier", () => {
    expect(randomWithoutReplacementSelectionStrategy.id).toBe(
      randomWithoutReplacementSelectionStrategyId,
    );
    expect(randomWithoutReplacementSelectionStrategyId).toBe(
      "random-without-replacement.v1",
    );
  });

  it("reproduces a selection for the same eligible pool and seed", () => {
    const first = randomWithoutReplacementSelectionStrategy.select({
      eligibleItems,
      count: 3,
      random: new SeededRandomSource("selection.seed"),
    });
    const second = randomWithoutReplacementSelectionStrategy.select({
      eligibleItems,
      count: 3,
      random: new SeededRandomSource("selection.seed"),
    });

    expect(first).toEqual(second);
    expect(first).toHaveLength(3);
  });

  it("selects unique candidates without replacement from the eligible pool", () => {
    const originalEligibleItems = [...eligibleItems];
    const selected = randomWithoutReplacementSelectionStrategy.select({
      eligibleItems,
      count: 4,
      random: new SeededRandomSource("unique.selection"),
    });

    expect(new Set(selected.map(({ id }) => id)).size).toBe(4);
    expect(selected.every((item) => eligibleItems.includes(item))).toBe(true);
    expect(eligibleItems).toEqual(originalEligibleItems);
  });

  it("returns an empty selection for count zero", () => {
    const selected = randomWithoutReplacementSelectionStrategy.select({
      eligibleItems,
      count: 0,
      random: new SeededRandomSource("zero.selection"),
    });

    expect(selected).toEqual([]);
  });

  it("returns every available candidate when the requested count exceeds capacity", () => {
    const selected = randomWithoutReplacementSelectionStrategy.select({
      eligibleItems: eligibleItems.slice(0, 2),
      count: 3,
      random: new SeededRandomSource("bounded.selection"),
    });

    expect(selected).toHaveLength(2);
    expect(new Set(selected.map(({ id }) => id)).size).toBe(2);
    expect(selected.map(({ id }) => id).sort()).toEqual(
      eligibleItems
        .slice(0, 2)
        .map(({ id }) => id)
        .sort(),
    );
  });

  it.each([
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])("rejects invalid selection count %s", (count) => {
    expect(() =>
      randomWithoutReplacementSelectionStrategy.select({
        eligibleItems,
        count,
        random: new SeededRandomSource("invalid.selection"),
      }),
    ).toThrow(RangeError);
  });
});
