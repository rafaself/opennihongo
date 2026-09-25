import { useId, type ComponentPropsWithoutRef, type ReactElement } from "react";
import { Badge } from "../../components/indicators/badge/Badge";
import { Celebration } from "../../components/indicators/celebration/Celebration";
import { Progress } from "../../components/indicators/progress/Progress";
import {
  RewardCard,
  type RewardCardProps,
} from "../../components/indicators/reward-card/RewardCard";
import { Inline } from "../../components/layout/Inline";
import { Card } from "../../components/surface/Card";
import { Text } from "../../typography/Text";
import "./daily-goal-completed.css";

export type DailyGoalCompletedGoal = {
  /** Caller-provided goal name and accessible progress label. */
  label: string;
  /** Caller-provided current progress; completion is never inferred from it. */
  value: number;
  /** Optional upper end of the supplied progress range. */
  max?: number;
  /** Optional caller-provided display of the goal values. */
  valueLabel?: string;
  /** Optional caller-provided explanation of the goal. */
  description?: string;
};

export type DailyGoalCompletedReward = Pick<
  RewardCardProps,
  "category" | "categoryLabel" | "label" | "state" | "stateLabel" | "value"
>;

export type DailyGoalCompletedProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Enables restrained emphasis; Celebration honors reduced-motion settings. */
  celebration?: boolean;
  /** Caller-provided, visible completion status. */
  completionLabel: string;
  /** Optional caller-provided supporting text. */
  description?: string;
  /** Caller-provided completed goal values; progress does not determine state. */
  goal: DailyGoalCompletedGoal;
  /** Visible heading that names the presentation region. */
  heading: string;
  /** Heading for the rewards section. Defaults to "Rewards". */
  rewardsHeading?: string;
  /** Caller-provided primary action, such as a Button or link. */
  primaryAction: ReactElement;
  /** Caller-provided rewards and their display states. */
  rewards: readonly DailyGoalCompletedReward[];
  /** Optional caller-provided secondary action. */
  secondaryAction?: ReactElement;
};

/** Presents caller-confirmed daily goal completion without calculating goals or rewards. */
export function DailyGoalCompleted({
  celebration = true,
  className,
  completionLabel,
  description,
  goal,
  heading,
  primaryAction,
  rewards,
  rewardsHeading = "Rewards",
  secondaryAction,
  ...props
}: DailyGoalCompletedProps) {
  const headingId = useId();
  const goalLabelId = useId();
  const goalDescriptionId = useId();
  const rewardHeadingId = useId();
  const classes = ["ns-daily-goal-completed", className]
    .filter(Boolean)
    .join(" ");
  const hasDescription = description !== undefined;
  const hasGoalDescription = goal.description !== undefined;
  const describedBy = [
    props["aria-describedby"],
    hasDescription ? `${headingId}-description` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  if (!heading.trim()) {
    throw new Error("DailyGoalCompleted requires a non-empty heading.");
  }

  if (!completionLabel.trim()) {
    throw new Error(
      "DailyGoalCompleted requires a non-empty completion label.",
    );
  }

  if (!goal.label.trim()) {
    throw new Error("DailyGoalCompleted requires a non-empty goal label.");
  }

  if (!rewards.length) {
    throw new Error(
      "DailyGoalCompleted requires at least one supplied reward.",
    );
  }

  if (!rewardsHeading.trim()) {
    throw new Error("DailyGoalCompleted requires a non-empty rewards heading.");
  }

  return (
    <Card
      {...props}
      aria-describedby={describedBy || undefined}
      aria-labelledby={headingId}
      as="section"
      className={classes}
    >
      <Celebration
        active={celebration}
        className="ns-daily-goal-completed__celebration"
      >
        <div className="ns-daily-goal-completed__layout">
          <header className="ns-daily-goal-completed__header">
            <Text
              as="h2"
              className="ns-daily-goal-completed__heading"
              id={headingId}
              variant="heading"
            >
              {heading}
            </Text>
            {hasDescription ? (
              <Text
                as="p"
                className="ns-daily-goal-completed__description"
                color="secondary"
                id={`${headingId}-description`}
                variant="body"
              >
                {description}
              </Text>
            ) : null}
          </header>

          <section
            aria-labelledby={goalLabelId}
            className="ns-daily-goal-completed__goal"
          >
            <Inline
              align="center"
              className="ns-daily-goal-completed__goal-header"
              gap="2"
              justify="space-between"
            >
              <Text
                as="h3"
                className="ns-daily-goal-completed__goal-label"
                id={goalLabelId}
                variant="label"
              >
                {goal.label}
              </Text>
              <Inline align="center" gap="2">
                {goal.valueLabel !== undefined ? (
                  <Badge>{goal.valueLabel}</Badge>
                ) : null}
                <Badge variant="success">{completionLabel}</Badge>
              </Inline>
            </Inline>
            {hasGoalDescription ? (
              <Text
                as="p"
                className="ns-daily-goal-completed__goal-description"
                color="secondary"
                id={goalDescriptionId}
                variant="caption"
              >
                {goal.description}
              </Text>
            ) : null}
            <Progress
              {...(hasGoalDescription
                ? { "aria-describedby": goalDescriptionId }
                : {})}
              aria-label={goal.label}
              className="ns-daily-goal-completed__progress"
              {...(goal.max === undefined ? {} : { max: goal.max })}
              value={goal.value}
            />
          </section>

          <section
            aria-labelledby={rewardHeadingId}
            className="ns-daily-goal-completed__rewards"
          >
            <Text
              as="h3"
              className="ns-daily-goal-completed__reward-heading"
              id={rewardHeadingId}
              variant="label"
            >
              {rewardsHeading}
            </Text>
            <div className="ns-daily-goal-completed__reward-grid">
              {rewards.map((reward, index) => (
                <RewardCard
                  {...reward}
                  key={`${reward.category}-${reward.label}-${index.toString()}`}
                />
              ))}
            </div>
          </section>

          <Inline
            align="center"
            className="ns-daily-goal-completed__actions"
            gap="3"
            justify="end"
          >
            {primaryAction}
            {secondaryAction}
          </Inline>
        </div>
      </Celebration>
    </Card>
  );
}
