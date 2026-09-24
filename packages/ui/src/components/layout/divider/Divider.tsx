import type { HTMLAttributes } from "react";
import "./divider.css";

export type DividerProps = Omit<
  HTMLAttributes<HTMLHRElement>,
  "aria-hidden" | "aria-orientation" | "role"
> & {
  /** Hide the divider from assistive technology when it is purely decorative. */
  decorative?: boolean;
};

/**
 * Renders a semantic horizontal separator by default. Set `decorative` when
 * the line is purely visual; use layout components to control surrounding
 * spacing.
 */
export function Divider({
  className,
  decorative = false,
  ...props
}: DividerProps) {
  const classes = ["ns-divider", className].filter(Boolean).join(" ");

  return (
    <hr
      {...props}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : "horizontal"}
      className={classes}
    />
  );
}
