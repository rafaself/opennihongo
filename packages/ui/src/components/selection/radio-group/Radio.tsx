import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

export type RadioProps = Omit<
  ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
  "children"
> & {
  /** Visible option text also provides the radio's accessible name. */
  children: ReactNode;
};

/** A named option that must be composed inside `RadioGroup`. */
export function Radio({ className, children, ...props }: RadioProps) {
  return (
    <RadioGroupPrimitive.Item
      {...props}
      className={["ns-radio", className].filter(Boolean).join(" ")}
    >
      <span aria-hidden="true" className="ns-radio__control">
        <RadioGroupPrimitive.Indicator className="ns-radio__indicator" />
      </span>
      <span className="ns-radio__label">{children}</span>
    </RadioGroupPrimitive.Item>
  );
}
