import type { HTMLAttributes } from "react";
import "./grid.css";

export type GridColumns = 1 | 2 | 3 | 4;

export type GridGap =
  "none" | "1" | "2" | "2-5" | "3" | "4" | "5" | "6" | "8" | "12" | "16";

export type GridProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Maximum column count. Additional columns appear at responsive viewport
   * widths; use CSS Grid directly for named areas, item placement, or custom
   * track sizing.
   */
  columns?: GridColumns;
  gap?: GridGap;
};

export function Grid({
  className,
  columns = 1,
  gap = "4",
  ...props
}: GridProps) {
  const classes = ["ns-grid", className].filter(Boolean).join(" ");

  return (
    <div {...props} className={classes} data-columns={columns} data-gap={gap} />
  );
}
