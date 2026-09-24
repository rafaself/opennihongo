import type { HTMLAttributes } from "react";
import "./inline.css";

export type InlineGap =
  "none" | "1" | "2" | "2-5" | "3" | "4" | "5" | "6" | "8" | "12" | "16";

export type InlineAlign = "start" | "center" | "end" | "baseline" | "stretch";

export type InlineJustify = "start" | "center" | "end" | "space-between";

export type InlineProps = HTMLAttributes<HTMLDivElement> & {
  gap?: InlineGap;
  align?: InlineAlign;
  justify?: InlineJustify;
  wrap?: boolean;
};

export function Inline({
  align = "center",
  className,
  gap = "2",
  justify = "start",
  wrap = true,
  ...props
}: InlineProps) {
  const classes = ["ns-inline", className].filter(Boolean).join(" ");

  return (
    <div
      {...props}
      className={classes}
      data-align={align}
      data-gap={gap}
      data-justify={justify}
      data-wrap={wrap}
    />
  );
}
