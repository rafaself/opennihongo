import type { InputHTMLAttributes } from "react";
import "./input.css";

export type InputSize = "compact" | "standard" | "comfortable";
export type InputType =
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type"
> & {
  /** Visual control size, independent from the native character-width setting. */
  size?: InputSize;
  /** Sets the native input `size` attribute in visible characters. */
  htmlSize?: number;
  /** Native single-line text-entry type. */
  type?: InputType;
};

export function Input({
  className,
  htmlSize,
  size = "standard",
  type = "text",
  ...props
}: InputProps) {
  const classes = ["ns-input", className].filter(Boolean).join(" ");

  return (
    <input
      {...props}
      className={classes}
      data-size={size}
      size={htmlSize}
      type={type}
    />
  );
}
