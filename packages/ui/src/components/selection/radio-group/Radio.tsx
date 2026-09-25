import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

export type RadioProps = Omit<
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "children"
> & {
  /** Card styling for content-rich choices in a named radio group. */
  variant?: "default" | "card";
  /** Visible option text also provides the radio's accessible name. */
  children: ReactNode;
};

/** A named option that must be composed inside `RadioGroup`. */
export function Radio({
  className,
  children,
  variant = "default",
  ...props
}: RadioProps) {
  return (
    <RadioGroupPrimitive.Item
      {...props}
      className={["ns-radio", className].filter(Boolean).join(" ")}
      data-variant={variant === "card" ? "card" : undefined}
    >
      <span aria-hidden="true" className="ns-radio__control">
        <RadioGroupPrimitive.Indicator className="ns-radio__indicator" />
      </span>
      <span className="ns-radio__label">{children}</span>
    </RadioGroupPrimitive.Item>
  );
}
