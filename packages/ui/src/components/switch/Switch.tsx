import { useState, type ButtonHTMLAttributes } from "react";
import { Icon } from "../../icons/Icon";
import "./switch.css";

export type SwitchProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-checked" | "children" | "defaultChecked" | "role" | "type"
> & {
  /** The current value for a controlled switch. */
  checked?: boolean;
  /** The initial value for an uncontrolled switch. */
  defaultChecked?: boolean;
  /** Called with the next value after an allowed activation. */
  onCheckedChange?: (checked: boolean) => void;
};

/**
 * An immediately applied on/off setting. Label it with a native `label` or
 * accessible name; use a Button for actions requiring submission or confirmation.
 */
export function Switch({
  checked,
  className,
  defaultChecked = false,
  disabled = false,
  onCheckedChange,
  onClick,
  ...props
}: SwitchProps) {
  const [uncontrolledChecked, setUncontrolledChecked] =
    useState(defaultChecked);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : uncontrolledChecked;

  return (
    <button
      {...props}
      aria-checked={isChecked}
      className={["ns-switch", className].filter(Boolean).join(" ")}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }

        const nextChecked = !isChecked;
        if (!isControlled) {
          setUncontrolledChecked(nextChecked);
        }
        onCheckedChange?.(nextChecked);
      }}
      role="switch"
      type="button"
    >
      <span aria-hidden="true" className="ns-switch__track">
        <span className="ns-switch__thumb">
          <Icon name="check" size="small" />
        </span>
      </span>
    </button>
  );
}
