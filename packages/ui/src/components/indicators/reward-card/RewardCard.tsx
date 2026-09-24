import { useId, type ComponentPropsWithoutRef } from "react";
import { Badge, type BadgeVariant } from "../badge/Badge";
import { Icon } from "../../../icons/Icon";
import { Card } from "../../surface/Card";
import { Text } from "../../../typography/Text";
import "./reward-card.css";

export type RewardCardCategory = "xp" | "streak" | "achievement";

export type RewardCardState = "earned" | "preview" | "locked";

const categoryLabels: Record<RewardCardCategory, string> = {
  xp: "XP",
  streak: "Streak",
  achievement: "Achievement",
};

const statePresentation: Record<
  RewardCardState,
  { label: string; variant: BadgeVariant }
> = {
  earned: { label: "Earned", variant: "success" },
  preview: { label: "Preview", variant: "info" },
  locked: { label: "Locked", variant: "neutral" },
};

export type RewardCardProps = Omit<
  ComponentPropsWithoutRef<"article">,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Semantic reward category; chooses a shared reward color treatment. */
  category: RewardCardCategory;
  /** Optional visible category label, for localization or product wording. */
  categoryLabel?: string;
  /** Caller-supplied reward name. */
  label: string;
  /** Caller-supplied presentation state; no reward rules are applied. */
  state: RewardCardState;
  /** Optional localized override for the visible and accessible state label. */
  stateLabel?: string;
  /** Caller-supplied display value; the component does not calculate it. */
  value: string | number;
};

/** Presents a caller-supplied reward category, value, and state without game rules. */
export function RewardCard({
  "aria-describedby": ariaDescribedBy,
  category,
  categoryLabel,
  className,
  label,
  state,
  stateLabel,
  value,
  ...props
}: RewardCardProps) {
  const labelId = useId();
  const stateId = useId();
  const resolvedCategoryLabel = categoryLabel ?? categoryLabels[category];
  const presentation = statePresentation[state];
  const resolvedStateLabel = stateLabel ?? presentation.label;
  const classes = ["ns-reward-card", className].filter(Boolean).join(" ");

  if (!label.trim()) {
    throw new Error("RewardCard requires a non-empty label.");
  }

  if (!resolvedCategoryLabel.trim()) {
    throw new Error("RewardCard requires a non-empty category label.");
  }

  if (!resolvedStateLabel.trim()) {
    throw new Error("RewardCard requires a non-empty state label.");
  }

  if (
    (typeof value === "string" && !value.trim()) ||
    (typeof value === "number" && !Number.isFinite(value))
  ) {
    throw new Error("RewardCard requires a non-empty finite value.");
  }

  return (
    <Card
      {...props}
      aria-describedby={ariaDescribedBy}
      aria-labelledby={`${labelId} ${stateId}`}
      as="article"
      className={classes}
      data-category={category}
      data-state={state}
    >
      <div className="ns-reward-card__layout">
        <span aria-hidden="true" className="ns-reward-card__icon">
          <Icon name={state === "earned" ? "check" : "star"} size="medium" />
        </span>
        <div className="ns-reward-card__content">
          <Text
            as="span"
            className="ns-reward-card__category"
            color="secondary"
            variant="caption"
          >
            {resolvedCategoryLabel}
          </Text>
          <Text
            as="h3"
            className="ns-reward-card__label"
            id={labelId}
            variant="heading"
          >
            {label}
          </Text>
          <Text as="p" className="ns-reward-card__value" variant="display">
            {value}
          </Text>
        </div>
        <Badge
          className="ns-reward-card__state"
          id={stateId}
          variant={presentation.variant}
        >
          {resolvedStateLabel}
        </Badge>
      </div>
    </Card>
  );
}
