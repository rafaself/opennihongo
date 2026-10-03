import type { ItemSelectionStrategyId } from "../ids";
import type {
  ItemSelectionStrategy,
  RandomizedItemSelectionRequest,
} from "./item-selection-strategy";

export const orderedSelectionStrategyId: ItemSelectionStrategyId = "ordered.v1";

/** Preserves caller-authored order for lessons with an explicit sequence. */
export const orderedSelectionStrategy = {
  id: orderedSelectionStrategyId,
  select<TItem>({
    eligibleItems,
    count,
  }: RandomizedItemSelectionRequest<TItem>): readonly TItem[] {
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new RangeError(
        "Selection count must be a non-negative safe integer.",
      );
    }
    return eligibleItems.slice(0, count);
  },
} satisfies ItemSelectionStrategy<
  unknown,
  RandomizedItemSelectionRequest<unknown>
>;
