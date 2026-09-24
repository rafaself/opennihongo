import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import "./select.css";

export type SelectProps = ComponentPropsWithoutRef<typeof SelectPrimitive.Root>;

/** Accessible single-value selection root. Compose with the exported parts. */
export const Select = SelectPrimitive.Root;

export type SelectTriggerProps = Omit<
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
  "required"
> & {
  /** Exposes FormField's required state on the combobox trigger. */
  required?: boolean;
};

/** Keyboard-operable combobox trigger with visible focus and field states. */
export function SelectTrigger({
  className,
  children,
  required,
  ...props
}: SelectTriggerProps) {
  return (
    <SelectPrimitive.Trigger
      {...props}
      aria-required={required || props["aria-required"] || undefined}
      className={["ns-select__trigger", className].filter(Boolean).join(" ")}
    >
      {children}
      <SelectPrimitive.Icon aria-hidden="true" className="ns-select__icon">
        <span />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export type SelectValueProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Value
>;

export const SelectValue = SelectPrimitive.Value;

export type SelectGroupProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Group
>;

export const SelectGroup = SelectPrimitive.Group;

export type SelectContentProps = Omit<
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>,
  "position" | "style"
> & {
  /** Stable host-owned portal mount. Defaults to the current document body. */
  portalContainer?: HTMLElement;
};

/** Portaled listbox content using the shared popover layer and surface tokens. */
export function SelectContent({
  children,
  className,
  portalContainer,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal container={portalContainer}>
      <SelectPrimitive.Content
        {...props}
        className={["ns-select__content", className].filter(Boolean).join(" ")}
        position="popper"
      >
        <SelectPrimitive.Viewport className="ns-select__viewport">
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export type SelectItemProps = Omit<
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>,
  "children"
> & {
  /** Visible option text also supplies the option's accessible name. */
  children: ReactNode;
};

/** A single selectable option. */
export function SelectItem({ children, className, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      {...props}
      className={["ns-select__item", className].filter(Boolean).join(" ")}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        aria-hidden="true"
        className="ns-select__indicator"
      >
        <span />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export type SelectLabelProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Label
>;

export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      {...props}
      className={["ns-select__label", className].filter(Boolean).join(" ")}
    />
  );
}

export type SelectSeparatorProps = ComponentPropsWithoutRef<
  typeof SelectPrimitive.Separator
>;

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      {...props}
      className={["ns-select__separator", className].filter(Boolean).join(" ")}
    />
  );
}
