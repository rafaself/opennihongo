import type { ItemSelectionStrategyId } from "../ids";
import type { RandomSource } from "../random/random-source";

/** Caller-supplied learning items eligible for a selection operation. */
export type ItemSelectionRequest<TItem> = Readonly<{
  eligibleItems: readonly TItem[];
  count: number;
}>;

/** Selection request for strategies that use injected randomness. */
export type RandomizedItemSelectionRequest<TItem> =
  ItemSelectionRequest<TItem> &
    Readonly<{
      random: RandomSource;
    }>;

/**
 * Named selection policy over caller-supplied eligible items.
 *
 * Strategies own selection only; exercise generators receive the selected
 * items separately. More specific requests can add strategy-specific context.
 */
export type ItemSelectionStrategy<
  TItem,
  TRequest extends ItemSelectionRequest<TItem> = ItemSelectionRequest<TItem>,
> = Readonly<{
  id: ItemSelectionStrategyId;
  select: (request: TRequest) => readonly TItem[];
}>;
