import type { HTMLAttributes } from "react";
import "./badge.css";

export type BadgeVariant =
  "neutral" | "success" | "warning" | "info" | "danger";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  /** Semantic informational treatment. Badge remains a non-interactive span. */
  variant?: BadgeVariant;
};

/** Renders a concise, non-interactive status or category label. */
export function Badge({
  className,
  variant = "neutral",
  ...props
}: BadgeProps) {
  const classes = ["ns-badge", className].filter(Boolean).join(" ");

  return <span {...props} className={classes} data-variant={variant} />;
}
