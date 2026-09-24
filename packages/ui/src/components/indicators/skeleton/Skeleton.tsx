import type { HTMLAttributes } from "react";
import "./skeleton.css";

export type SkeletonShape = "text" | "rectangular" | "circular";
export type SkeletonSize = "small" | "medium" | "large";

export type SkeletonProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "aria-hidden" | "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Decorative shape. Use `style` to match a specific content width or height. */
  shape?: SkeletonShape;
  /** Shared semantic size for text, rectangular, and circular shapes. */
  size?: SkeletonSize;
};

/**
 * Renders a decorative loading placeholder. Keep loading announcements and
 * `aria-busy` on the consuming region; Skeleton is always hidden from AT.
 */
export function Skeleton({
  className,
  shape = "text",
  size = "medium",
  ...props
}: SkeletonProps) {
  const classes = ["ns-skeleton", className].filter(Boolean).join(" ");

  return (
    <span
      {...props}
      aria-hidden="true"
      className={classes}
      data-shape={shape}
      data-size={size}
    />
  );
}
