import type { HTMLAttributes } from "react";
import "./progress.css";

type ProgressAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type ProgressProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "aria-label"
  | "aria-labelledby"
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuenow"
  | "children"
  | "role"
> &
  ProgressAccessibleName & {
    /** Upper end of the range. Must be positive and finite; otherwise it uses 100. */
    max?: number;
    /** Current progress. Invalid or non-finite values resolve to 0; finite values are clamped to the range. */
    value: number;
  };

const DEFAULT_PROGRESS_MAX = 100;

/**
 * Renders a static, determinate progress bar. `max` defaults to 100 and falls
 * back to 100 when it is non-finite or not positive. A non-finite `value` is
 * treated as 0; finite values are clamped between 0 and the resolved maximum.
 */
export function Progress({
  className,
  max = DEFAULT_PROGRESS_MAX,
  value,
  ...props
}: ProgressProps) {
  const resolvedMax =
    Number.isFinite(max) && max > 0 ? max : DEFAULT_PROGRESS_MAX;
  const resolvedValue = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), resolvedMax)
    : 0;
  const percentage = (resolvedValue / resolvedMax) * 100;
  const classes = ["ns-progress", className].filter(Boolean).join(" ");

  return (
    <div
      {...props}
      aria-valuemax={resolvedMax}
      aria-valuemin={0}
      aria-valuenow={resolvedValue}
      className={classes}
      role="progressbar"
    >
      <span
        aria-hidden="true"
        className="ns-progress__indicator"
        style={{ width: `${percentage.toString()}%` }}
      />
    </div>
  );
}
