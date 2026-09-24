import type { ComponentPropsWithoutRef } from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import "./radio-group.css";

export type RadioGroupProps = ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
>;

/**
 * Accessible, single-choice group. Set `aria-label` or `aria-labelledby` to
 * give the group a name, and use `Radio` children for its options.
 */
export function RadioGroup({
  className,
  orientation = "vertical",
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      {...props}
      className={["ns-radio-group", className].filter(Boolean).join(" ")}
      orientation={orientation}
    />
  );
}
