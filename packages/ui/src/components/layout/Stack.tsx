import type { HTMLAttributes } from "react";
import "./stack.css";

export type StackGap =
  "none" | "1" | "2" | "2-5" | "3" | "4" | "5" | "6" | "8" | "12" | "16";

export type StackAlign = "start" | "center" | "end" | "stretch";

export type StackJustify =
  | "start"
  | "center"
  | "end"
  | "space-between"
  | "space-around"
  | "space-evenly";

export type StackProps = HTMLAttributes<HTMLDivElement> & {
  gap?: StackGap;
  align?: StackAlign;
  justify?: StackJustify;
};

export function Stack({
  align = "stretch",
  className,
  gap = "4",
  justify = "start",
  ...props
}: StackProps) {
  const classes = ["ns-stack", className].filter(Boolean).join(" ");

  return (
    <div
      {...props}
      className={classes}
      data-align={align}
      data-gap={gap}
      data-justify={justify}
    />
  );
}
