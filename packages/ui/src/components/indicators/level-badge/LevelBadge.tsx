import type { HTMLAttributes } from "react";
import { Icon } from "../../../icons/Icon";
import { Text } from "../../../typography/Text";
import { Badge, type BadgeVariant } from "../badge/Badge";
import "./level-badge.css";

export type LevelBadgeSize = "normal" | "compact";

export type LevelBadgeTier = {
  /** Caller-provided tier name; no tier is inferred from the level value. */
  label: string;
  /** Semantic Badge treatment selected by the caller. */
  variant?: BadgeVariant;
};

export type LevelBadgeProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children" | "data-size" | "data-variant"
> & {
  /** Caller-provided label displayed beside the supplied level value. */
  label: string;
  /** Shared presentation size. */
  size?: LevelBadgeSize;
  /** Optional caller-provided tier label and semantic treatment. */
  tier?: LevelBadgeTier;
  /** Caller-provided level value; no thresholds or progression are calculated. */
  value: number | string;
};

/** Presents a supplied level label and value without applying progression rules. */
export function LevelBadge({
  className,
  label,
  size = "normal",
  tier,
  value,
  ...props
}: LevelBadgeProps) {
  const classes = ["ns-level-badge", className].filter(Boolean).join(" ");

  return (
    <Badge {...props} className={classes} data-size={size} variant="neutral">
      <Icon className="ns-level-badge__icon" name="star" size="small" />
      <Text
        as="span"
        className="ns-level-badge__label"
        color="secondary"
        variant={size === "compact" ? "caption" : "label"}
      >
        {label}
      </Text>
      <Text
        as="span"
        className="ns-level-badge__value"
        color="primary"
        variant={size === "compact" ? "caption" : "label"}
      >
        {value}
      </Text>
      {tier === undefined ? null : (
        <Badge
          className="ns-level-badge__tier"
          variant={tier.variant ?? "neutral"}
        >
          {tier.label}
        </Badge>
      )}
    </Badge>
  );
}
