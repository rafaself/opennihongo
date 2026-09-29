/**
 * Supplies pseudo-random values to domain operations.
 *
 * Implementations must return finite values in the half-open interval [0, 1).
 */
export interface RandomSource {
  next(): number;
}
