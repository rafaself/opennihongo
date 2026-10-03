import { expect, it } from "vitest";
import {
  orderedSelectionStrategy,
  orderedSelectionStrategyId,
  SeededRandomSource,
} from "../../src";

it("selects the supplied authored order without mutating it or consuming randomness", () => {
  const eligibleItems = ["a", "i", "u"];
  const random = new SeededRandomSource("ordered");
  expect(orderedSelectionStrategy.id).toBe(orderedSelectionStrategyId);
  expect(
    orderedSelectionStrategy.select({ eligibleItems, count: 2, random }),
  ).toEqual(["a", "i"]);
  expect(eligibleItems).toEqual(["a", "i", "u"]);
  expect(random.next()).toBe(new SeededRandomSource("ordered").next());
  expect(
    orderedSelectionStrategy.select({ eligibleItems, count: 10, random }),
  ).toEqual(eligibleItems);
  expect(
    orderedSelectionStrategy.select({ eligibleItems, count: 0, random }),
  ).toEqual([]);
});

it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
  "rejects invalid ordered selection count %s",
  (count) => {
    expect(() =>
      orderedSelectionStrategy.select({
        eligibleItems: ["a"],
        count,
        random: new SeededRandomSource("ordered"),
      }),
    ).toThrow(RangeError);
  },
);
