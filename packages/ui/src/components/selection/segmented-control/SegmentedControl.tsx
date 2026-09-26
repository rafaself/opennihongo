import type { ReactNode } from "react";
import { Radio } from "../radio-group/Radio";
import { RadioGroup } from "../radio-group/RadioGroup";
import "./segmented-control.css";

export type SegmentedControlOption<T extends string = string> = {
  label: ReactNode;
  value: T;
};

export type SegmentedControlProps<T extends string = string> = {
  "aria-label": string;
  className?: string;
  onValueChange: (value: T) => void;
  options: readonly SegmentedControlOption<T>[];
  value: T;
};

/** A compact, controlled radio group for choosing one of a few peer options. */
export function SegmentedControl<T extends string = string>({
  "aria-label": ariaLabel,
  className,
  onValueChange,
  options,
  value,
}: SegmentedControlProps<T>) {
  const handleValueChange = (nextValue: string) => {
    const option = options.find(
      ({ value: optionValue }) => optionValue === nextValue,
    );
    if (option) onValueChange(option.value);
  };

  return (
    <RadioGroup
      aria-label={ariaLabel}
      className={["ns-segmented-control", className].filter(Boolean).join(" ")}
      onValueChange={handleValueChange}
      orientation="horizontal"
      value={value}
    >
      {options.map((option) => (
        <Radio
          className="ns-segmented-control__option"
          key={option.value}
          value={option.value}
        >
          {option.label}
        </Radio>
      ))}
    </RadioGroup>
  );
}
