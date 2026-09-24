import type { ComponentPropsWithoutRef, ReactElement } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import "./tooltip.css";

type TooltipRootProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;
type TooltipProviderPrimitiveProps = ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Provider
>;
type TooltipContentProps = ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
>;

export type TooltipProviderProps = Pick<
  TooltipProviderPrimitiveProps,
  "children" | "delayDuration" | "skipDelayDuration"
>;

/** Provides consistent pointer timing for tooltips across an application. */
export function TooltipProvider({
  children,
  delayDuration,
  skipDelayDuration,
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      {...(delayDuration !== undefined ? { delayDuration } : {})}
      {...(skipDelayDuration !== undefined ? { skipDelayDuration } : {})}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}

export type TooltipProps = Pick<
  TooltipRootProps,
  "defaultOpen" | "delayDuration" | "onOpenChange" | "open"
> &
  Pick<TooltipContentProps, "side" | "sideOffset"> & {
    /** The element that opens the tooltip on pointer hover or keyboard focus. */
    children: ReactElement;
    /** Short, supplemental plain text; never use required or interactive content. */
    content: string;
    /** Stable host-owned mount. Defaults to the current document body. */
    portalContainer?: HTMLElement;
  };

/** Adds a brief, noninteractive description to a focusable trigger. */
export function Tooltip({
  children,
  content,
  portalContainer,
  side = "top",
  sideOffset = 6,
  ...rootProps
}: TooltipProps) {
  return (
    <TooltipPrimitive.Root {...rootProps}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal container={portalContainer}>
        <TooltipPrimitive.Content
          className="ns-tooltip__content"
          side={side}
          sideOffset={sideOffset}
        >
          {content}
          <TooltipPrimitive.Arrow
            aria-hidden="true"
            className="ns-tooltip__arrow"
            height={6}
            width={12}
          />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
