import type { ItemSelectionStrategyId } from "../ids";
import { shuffle } from "../random/shuffle";
import type {
  ItemSelectionStrategy,
  RandomizedItemSelectionRequest,
} from "./item-selection-strategy";

/** Stable identifier for the initial random selection policy. */
export const randomWithoutReplacementSelectionStrategyId: ItemSelectionStrategyId =
  "random-without-replacement.v1";

/**
 * Selects a seeded, shuffled subset from the caller-supplied eligible pool.
 *
 * The pool is expected to contain unique candidates. Selection is without
 * replacement by candidate position; a request above the pool capacity returns
 * every available candidate in shuffled order. A zero count returns no items.
 */
export const randomWithoutReplacementSelectionStrategy = {
  id: randomWithoutReplacementSelectionStrategyId,
  select<TItem>({
    eligibleItems,
    count,
    random,
  }: RandomizedItemSelectionRequest<TItem>): readonly TItem[] {
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new RangeError(
        "Selection count must be a non-negative safe integer.",
      );
    }

    if (count === 0) {
      return [];
    }

    return shuffle(eligibleItems, random).slice(
      0,
      Math.min(count, eligibleItems.length),
    );
  },
} satisfies ItemSelectionStrategy<
  unknown,
  RandomizedItemSelectionRequest<unknown>
>;
