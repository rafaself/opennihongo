import type { ComponentPropsWithoutRef } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import "./popover.css";

export type PopoverProps = Omit<
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>,
  "modal"
>;

/** Non-modal floating content with the focus and dismissal behavior of Radix Popover. */
export function Popover(props: PopoverProps) {
  return <PopoverPrimitive.Root modal={false} {...props} />;
}

export type PopoverTriggerProps = ComponentPropsWithoutRef<
  typeof PopoverPrimitive.Trigger
>;

/** Trigger that opens and closes its containing Popover. */
export const PopoverTrigger = PopoverPrimitive.Trigger;

export type PopoverContentProps = Omit<
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  "style"
> & {
  /** Stable host-owned portal mount. Defaults to the current document body. */
  portalContainer?: HTMLElement;
};

/** Portaled floating surface using shared semantic colors and overlay layering. */
export function PopoverContent({
  children,
  className,
  portalContainer,
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  const classes = ["ns-popover__content", className].filter(Boolean).join(" ");

  return (
    <PopoverPrimitive.Portal container={portalContainer}>
      <PopoverPrimitive.Content
        {...props}
        className={classes}
        sideOffset={sideOffset}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
