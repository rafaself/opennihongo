import { describe, expect, expectTypeOf, it } from "vitest";
import type {
  ItemSelectionRequest,
  ItemSelectionStrategy,
  ItemSelectionStrategyId,
  RandomizedItemSelectionRequest,
  RandomSource,
} from "../src";

type SourceItem = Readonly<{ id: string; value: string }>;
type StrategyContext = RandomizedItemSelectionRequest<SourceItem> &
  Readonly<{ scope: "lesson" }>;

describe("item selection contracts", () => {
  it("names policies and accepts extended caller context", () => {
    const selectionStrategyId: ItemSelectionStrategyId = "test-policy";
    const strategy: ItemSelectionStrategy<SourceItem, StrategyContext> = {
      id: selectionStrategyId,
      select: ({ eligibleItems, count }: StrategyContext) =>
        eligibleItems.slice(0, count),
    };
    const request: StrategyContext = {
      eligibleItems: [{ id: "kana.a", value: "あ" }],
      count: 1,
      random: { next: () => 0 },
      scope: "lesson",
    };

    expect(strategy.select(request)).toEqual(request.eligibleItems);
    expectTypeOf(strategy.id).toEqualTypeOf<ItemSelectionStrategyId>();
    expectTypeOf(strategy.select(request)).toEqualTypeOf<
      readonly SourceItem[]
    >();
    expectTypeOf<ItemSelectionRequest<SourceItem>>().toExtend<{
      eligibleItems: readonly SourceItem[];
      count: number;
    }>();
    expectTypeOf<RandomSource>().toExtend<{ next: () => number }>();
  });
});
