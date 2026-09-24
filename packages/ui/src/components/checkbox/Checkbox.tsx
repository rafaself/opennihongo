import { useLayoutEffect, useRef, type InputHTMLAttributes } from "react";
import { Icon } from "../../icons/Icon";
import "./checkbox.css";

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  /** Sets the native mixed state; activation clears it unless the prop remains set. */
  indeterminate?: boolean;
};

/**
 * Native checkbox with a token-based visual treatment. Compose it with
 * `FormField` or associate it with a native `<label>` to provide its name.
 */
export function Checkbox({
  className,
  indeterminate = false,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  });

  return (
    <span className="ns-checkbox">
      <input
        {...props}
        className={["ns-checkbox__input", className].filter(Boolean).join(" ")}
        ref={inputRef}
        type="checkbox"
      />
      <span aria-hidden="true" className="ns-checkbox__indicator">
        <Icon name="check" size="small" />
      </span>
    </span>
  );
}
