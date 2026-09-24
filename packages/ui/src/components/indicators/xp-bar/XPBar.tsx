import type { HTMLAttributes, ReactNode } from "react";
import { Progress } from "../progress/Progress";
import "./xp-bar.css";

type XPBarAccessibleName =
  | { "aria-label": string; "aria-labelledby"?: never }
  | { "aria-label"?: never; "aria-labelledby": string };

type XPBarRange =
  | {
      current: number;
      target: number;
      value?: never;
      max?: never;
    }
  | {
      current?: never;
      target?: never;
      value: number;
      max?: number;
    };

export type XPBarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "aria-describedby"
  | "aria-label"
  | "aria-labelledby"
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuenow"
  | "children"
  | "role"
> &
  XPBarAccessibleName &
  XPBarRange & {
    /** Additional accessible context for the progress range. */
    "aria-describedby"?: string;
    /** Optional caller-supplied supporting text, rendered beside the bar. */
    text?: ReactNode;
  };

/**
 * Renders caller-supplied XP progress using the shared determinate Progress
 * contract. This component does not calculate XP awards, thresholds, or levels.
 */
export function XPBar(props: XPBarProps) {
  const {
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    className,
    current,
    max,
    target,
    text,
    value,
    ...wrapperProps
  } = props;
  const accessibleName =
    ariaLabel !== undefined
      ? { "aria-label": ariaLabel }
      : { "aria-labelledby": ariaLabelledBy };
  const progressRange =
    typeof current === "number"
      ? { max: target, value: current }
      : {
          value,
          ...(max === undefined ? {} : { max }),
        };
  const describedByProps =
    ariaDescribedBy === undefined
      ? {}
      : { "aria-describedby": ariaDescribedBy };
  const classes = ["ns-xp-bar", className].filter(Boolean).join(" ");

  return (
    <div {...wrapperProps} className={classes}>
      {text == null ? null : <span className="ns-xp-bar__text">{text}</span>}
      <Progress
        className="ns-xp-bar__progress"
        {...accessibleName}
        {...describedByProps}
        {...progressRange}
      />
    </div>
  );
}
