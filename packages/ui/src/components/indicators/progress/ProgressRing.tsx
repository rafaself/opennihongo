import type { HTMLAttributes, ReactNode } from "react";
import { resolveProgressRange } from "./resolveProgressRange";
import "./progress-ring.css";

type ProgressRingAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type ProgressRingSize = "small" | "medium" | "large";

export type ProgressRingProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-describedby" | "aria-label" | "aria-labelledby" | "children" | "role"
> &
  ProgressRingAccessibleName & {
    /** Describes the progressbar when additional context is useful. */
    "aria-describedby"?: string;
    /** Optional centered content remains outside the progressbar semantics. */
    children?: ReactNode;
    /** Upper end of the range. Must be positive and finite; otherwise it uses 100. */
    max?: number;
    /** Shared semantic diameter; defaults to the medium token. */
    size?: ProgressRingSize;
    /** Current progress. Invalid or non-finite values resolve to 0; finite values are clamped to the range. */
    value: number;
  };

const CIRCLE_RADIUS = 21;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

/**
 * Renders a static determinate circular progress indicator. `max` and `value`
 * follow the same range contract as Progress. Centered content is a sibling of
 * the progressbar, so it remains separately available to assistive technology.
 */
export function ProgressRing({
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  className,
  max,
  size = "medium",
  value,
  ...props
}: ProgressRingProps) {
  const {
    max: resolvedMax,
    percentage,
    value: resolvedValue,
  } = resolveProgressRange(value, max);
  const classes = ["ns-progress-ring", `ns-progress-ring--${size}`, className]
    .filter(Boolean)
    .join(" ");
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <div {...props} className={classes} data-size={size}>
      <svg
        aria-describedby={ariaDescribedBy}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-valuemax={resolvedMax}
        aria-valuemin={0}
        aria-valuenow={resolvedValue}
        className="ns-progress-ring__graphic"
        focusable="false"
        role="progressbar"
        viewBox="0 0 48 48"
      >
        <circle
          aria-hidden="true"
          className="ns-progress-ring__track"
          cx="24"
          cy="24"
          r={CIRCLE_RADIUS}
        />
        <circle
          aria-hidden="true"
          className="ns-progress-ring__indicator"
          cx="24"
          cy="24"
          r={CIRCLE_RADIUS}
          strokeDasharray={`${CIRCLE_CIRCUMFERENCE.toString()} ${CIRCLE_CIRCUMFERENCE.toString()}`}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      {children == null ? null : (
        <span className="ns-progress-ring__content">{children}</span>
      )}
    </div>
  );
}
