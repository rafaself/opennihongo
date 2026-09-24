import type { TextareaHTMLAttributes } from "react";
import "./textarea.css";

export type TextareaSize = "compact" | "standard" | "comfortable";
export type TextareaResize = "none" | "vertical";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** Visual control size, consistent with Input. */
  size?: TextareaSize;
  /** Allows vertical resizing by default while preserving the control width. */
  resize?: TextareaResize;
};

/**
 * A multiline text control with soft-wrapped content and vertical scrolling.
 * It starts at four rows; use `rows` to choose another initial height. Users
 * can resize it vertically by default or set `resize="none"` to lock its size.
 */
export function Textarea({
  className,
  resize = "vertical",
  rows = 4,
  size = "standard",
  ...props
}: TextareaProps) {
  const classes = ["ns-textarea", className].filter(Boolean).join(" ");

  return (
    <textarea
      {...props}
      className={classes}
      data-resize={resize}
      data-size={size}
      rows={rows}
    />
  );
}
