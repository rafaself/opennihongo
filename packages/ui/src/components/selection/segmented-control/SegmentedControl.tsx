import { useEffect, useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Radio } from "../radio-group/Radio";
import { RadioGroup } from "../radio-group/RadioGroup";
import "./segmented-control.css";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

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
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const indicator = indicatorRef.current;
    const group = indicator?.parentElement;
    if (!indicator || !group) return;

    let hasMeasured = false;
    let transitionFrame = 0;

    const measure = () => {
      const selected = group.querySelector<HTMLElement>(
        ":scope > .ns-segmented-control__option[data-state='checked']",
      );
      if (!selected) {
        indicator.removeAttribute("data-ready");
        return;
      }

      const { offsetHeight, offsetLeft, offsetTop, offsetWidth } = selected;
      if (offsetWidth === 0 || offsetHeight === 0) {
        indicator.removeAttribute("data-ready");
        return;
      }

      group.style.setProperty(
        "--ns-segmented-control-indicator-x",
        `${String(offsetLeft)}px`,
      );
      group.style.setProperty(
        "--ns-segmented-control-indicator-y",
        `${String(offsetTop)}px`,
      );
      group.style.setProperty(
        "--ns-segmented-control-indicator-width",
        `${String(offsetWidth)}px`,
      );
      group.style.setProperty(
        "--ns-segmented-control-indicator-height",
        `${String(offsetHeight)}px`,
      );
      indicator.dataset["ready"] = "true";

      if (!hasMeasured) {
        hasMeasured = true;
        transitionFrame = window.requestAnimationFrame(() => {
          indicator.dataset["animated"] = "true";
        });
      }
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    const observeSizes = () => {
      if (!resizeObserver) return;
      resizeObserver.disconnect();
      resizeObserver.observe(group);
      group
        .querySelectorAll<HTMLElement>(":scope > .ns-segmented-control__option")
        .forEach((option) => {
          resizeObserver.observe(option);
        });
    };
    const mutationObserver =
      typeof MutationObserver === "undefined"
        ? undefined
        : new MutationObserver(() => {
            observeSizes();
            measure();
          });

    measure();
    observeSizes();
    mutationObserver?.observe(group, {
      attributeFilter: ["data-state"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    window.addEventListener("resize", measure);

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener("resize", measure);
      window.cancelAnimationFrame(transitionFrame);
    };
  }, [options, value]);

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
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="ns-segmented-control__indicator"
      />
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
