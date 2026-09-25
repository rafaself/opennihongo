import { useId, type HTMLAttributes } from "react";
import { Badge, type BadgeVariant } from "../badge/Badge";
import { Icon } from "../../../icons/Icon";
import { Text } from "../../../typography/Text";
import "./streak.css";

export type StreakState =
  "active" | "at-risk" | "protected" | "completed" | "inactive";

const stateLabels: Record<StreakState, string> = {
  active: "Active",
  "at-risk": "At risk",
  protected: "Protected",
  completed: "Completed",
  inactive: "Inactive",
};

const stateVariants: Record<StreakState, BadgeVariant> = {
  active: "neutral",
  "at-risk": "warning",
  protected: "info",
  completed: "success",
  inactive: "neutral",
};

export type StreakProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | "aria-atomic"
  | "aria-label"
  | "aria-labelledby"
  | "aria-live"
  | "children"
  | "role"
> & {
  /** Caller-supplied streak count; the component does not calculate it. */
  count: number;
  /** Visible name for the status region. Defaults to "Streak". */
  label?: string;
  /** Visible and announced label for the current state; defaults to English. */
  stateLabel?: string;
  /** Caller-supplied presentation state; no streak rules are applied. */
  state: StreakState;
  /** Caller-supplied count unit. Defaults to "days". */
  unit?: string;
};

/** Presents caller-supplied count and state without applying streak rules. */
export function Streak({
  className,
  count,
  label = "Streak",
  stateLabel,
  state,
  unit = "days",
  ...props
}: StreakProps) {
  const labelId = useId();

  if (!label.trim()) {
    throw new Error("Streak requires a non-empty accessible label.");
  }

  if (stateLabel !== undefined && !stateLabel.trim()) {
    throw new Error("Streak requires a non-empty state label when supplied.");
  }

  const classes = ["ns-streak", className].filter(Boolean).join(" ");

  return (
    <div
      {...props}
      aria-atomic="true"
      aria-live="polite"
      aria-labelledby={labelId}
      className={classes}
      data-state={state}
      role="status"
    >
      <Icon
        className="ns-streak__icon"
        data-state={state}
        name="star"
        size="small"
      />
      <Text
        as="span"
        className="ns-streak__label"
        color="secondary"
        id={labelId}
        variant="caption"
      >
        {label}
      </Text>
      <span className="ns-streak__count">
        <Text as="span" className="ns-streak__value" variant="heading">
          {count}
        </Text>
        <Text
          as="span"
          className="ns-streak__unit"
          color="secondary"
          variant="caption"
        >
          {unit}
        </Text>
      </span>
      <Badge
        className="ns-streak__state"
        data-state={state}
        variant={stateVariants[state]}
      >
        {stateLabel ?? stateLabels[state]}
      </Badge>
    </div>
  );
}
