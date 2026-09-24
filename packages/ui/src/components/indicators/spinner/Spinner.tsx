import type { HTMLAttributes } from "react";
import "./spinner.css";

type SpinnerAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

export type SpinnerSize = "small" | "medium" | "large";
export type SpinnerColor = "primary" | "secondary" | "inverse";

export type SpinnerProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | "aria-atomic"
  | "aria-label"
  | "aria-labelledby"
  | "aria-live"
  | "children"
  | "role"
> &
  SpinnerAccessibleName & {
    /** Semantic foreground role; defaults to the primary action color. */
    color?: SpinnerColor;
    /** Shared semantic size; defaults to medium. */
    size?: SpinnerSize;
  };

/**
 * Renders an indeterminate loading status for short operations. Always provide
 * an accessible name; pair the spinner with visible status text so color or
 * motion is never the only indication that work is in progress.
 */
export function Spinner({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  color = "primary",
  size = "medium",
  ...props
}: SpinnerProps) {
  const accessibleName = ariaLabel ?? ariaLabelledBy;

  if (!accessibleName.trim()) {
    throw new Error("Spinner requires a non-empty accessible name.");
  }

  const classes = ["ns-spinner", className].filter(Boolean).join(" ");

  return (
    <span
      {...props}
      aria-atomic="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-live="polite"
      className={classes}
      data-color={color}
      data-size={size}
      role="status"
    >
      <span aria-hidden="true" className="ns-spinner__indicator" />
    </span>
  );
}
