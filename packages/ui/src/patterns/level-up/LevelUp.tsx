import {
  useId,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { Celebration } from "../../components/indicators/celebration/Celebration";
import {
  LevelBadge,
  type LevelBadgeProps,
} from "../../components/indicators/level-badge/LevelBadge";
import { Card } from "../../components/surface/Card";
import { Inline } from "../../components/layout/Inline";
import { Text } from "../../typography/Text";
import "./level-up.css";

export type LevelUpSize = "compact" | "full";

export type LevelUpLevel = Pick<LevelBadgeProps, "label" | "tier" | "value">;

export type LevelUpProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Caller-controlled state that enables the reduced-motion-aware emphasis. */
  celebration?: boolean;
  /** Optional caller-supplied explanation of the transition. */
  description?: string;
  /** Visible heading that names the presentation region. */
  heading: string;
  /** Caller-supplied destination level; no progression is calculated. */
  newLevel: LevelUpLevel;
  /** Required caller-supplied primary action, such as a Button or link. */
  primaryAction: ReactElement;
  /** Caller-supplied source level; no progression is calculated. */
  previousLevel: LevelUpLevel;
  /** Optional caller-composed reward content with appropriate semantics. */
  rewards?: ReactNode;
  /** Optional caller-supplied secondary action. */
  secondaryAction?: ReactElement;
  /** Chooses a compact or more spacious presentation. */
  size?: LevelUpSize;
};

/** Presents supplied level context, optional rewards, and actions without game rules. */
export function LevelUp({
  celebration = true,
  className,
  description,
  heading,
  newLevel,
  previousLevel,
  primaryAction,
  rewards,
  secondaryAction,
  size = "full",
  ...props
}: LevelUpProps) {
  const headingId = useId();
  const hasRewards = rewards !== undefined && rewards !== null;
  const classes = ["ns-level-up", className].filter(Boolean).join(" ");

  if (!heading.trim()) {
    throw new Error("LevelUp requires a non-empty heading.");
  }

  return (
    <Card
      {...props}
      aria-labelledby={headingId}
      as="section"
      className={classes}
      data-size={size}
    >
      <Celebration active={celebration} className="ns-level-up__celebration">
        <div className="ns-level-up__layout">
          <header className="ns-level-up__header">
            <Text
              as="h2"
              className="ns-level-up__heading"
              id={headingId}
              variant="heading"
            >
              {heading}
            </Text>
            {description && (
              <Text
                as="p"
                className="ns-level-up__description"
                color="secondary"
                variant="body"
              >
                {description}
              </Text>
            )}
          </header>

          <div className="ns-level-up__levels">
            <div
              aria-label="Previous level"
              className="ns-level-up__level ns-level-up__level--previous"
              role="group"
            >
              <Text as="span" color="secondary" variant="caption">
                Previous level
              </Text>
              <LevelBadge
                {...previousLevel}
                size={size === "compact" ? "compact" : "normal"}
              />
            </div>
            <Text
              aria-hidden="true"
              className="ns-level-up__transition"
              color="secondary"
              variant="heading"
            >
              →
            </Text>
            <div
              aria-label="New level"
              className="ns-level-up__level ns-level-up__level--new"
              role="group"
            >
              <Text as="span" color="secondary" variant="caption">
                New level
              </Text>
              <LevelBadge
                {...newLevel}
                size={size === "compact" ? "compact" : "normal"}
              />
            </div>
          </div>

          {hasRewards && (
            <div className="ns-level-up__rewards">
              <Text
                as="h3"
                className="ns-level-up__rewards-heading"
                variant="label"
              >
                Rewards
              </Text>
              {rewards}
            </div>
          )}

          <Inline
            align="center"
            className="ns-level-up__actions"
            gap="3"
            justify="end"
          >
            {secondaryAction}
            {primaryAction}
          </Inline>
        </div>
      </Celebration>
    </Card>
  );
}
