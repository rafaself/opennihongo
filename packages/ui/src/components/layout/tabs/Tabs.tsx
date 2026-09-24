import type { ComponentPropsWithoutRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import "./tabs.css";

export type TabsProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

/** Switches between related panels without changing the current route. */
export function Tabs({ className, ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      {...props}
      className={["ns-tabs", className].filter(Boolean).join(" ")}
    />
  );
}

export type TabsListProps = ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

/** Scrollable strip of tabs. Give it an accessible name. */
export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <TabsPrimitive.List
      {...props}
      className={["ns-tabs__list", className].filter(Boolean).join(" ")}
    />
  );
}

export type TabsTriggerProps = ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
>;

/** Selects the panel with the matching value. */
export function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      {...props}
      className={["ns-tabs__trigger", className].filter(Boolean).join(" ")}
    />
  );
}

export type TabsContentProps = ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
>;

/** Panel displayed by the selected trigger with the matching value. */
export function TabsContent({ className, ...props }: TabsContentProps) {
  return (
    <TabsPrimitive.Content
      {...props}
      className={["ns-tabs__content", className].filter(Boolean).join(" ")}
    />
  );
}
