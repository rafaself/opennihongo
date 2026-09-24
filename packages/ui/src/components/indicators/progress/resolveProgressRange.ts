export type ResolvedProgressRange = {
  max: number;
  percentage: number;
  value: number;
};

const DEFAULT_PROGRESS_MAX = 100;

/** Resolves the shared determinate value/max contract used by progress UI. */
export function resolveProgressRange(
  value: number,
  max: number = DEFAULT_PROGRESS_MAX,
): ResolvedProgressRange {
  const resolvedMax =
    Number.isFinite(max) && max > 0 ? max : DEFAULT_PROGRESS_MAX;
  const resolvedValue = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), resolvedMax)
    : 0;

  return {
    max: resolvedMax,
    percentage: (resolvedValue / resolvedMax) * 100,
    value: resolvedValue,
  };
}
