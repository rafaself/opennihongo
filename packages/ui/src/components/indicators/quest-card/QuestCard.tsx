import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Badge, type BadgeVariant } from "../badge/Badge";
import { Progress } from "../progress/Progress";
import {
  RewardCard,
  type RewardCardCategory,
  type RewardCardState,
} from "../reward-card/RewardCard";
import { Card } from "../../surface/Card";
import { Icon } from "../../../icons/Icon";
import { Text } from "../../../typography/Text";
import "./quest-card.css";

export type QuestCardStatus = "incomplete" | "completed";

export type QuestCardReward = {
  /** Optional localized category label. */
  categoryLabel?: string;
  /** Semantic reward category. */
  category: RewardCardCategory;
  /** Caller-supplied reward name. */
  label: string;
  /** Caller-supplied reward state; no reward rules are applied. */
  state: RewardCardState;
  /** Optional localized reward state label. */
  stateLabel?: string;
  /** Caller-supplied display value. */
  value: string | number;
};

const statusPresentation: Record<
  QuestCardStatus,
  { icon: "check" | "star"; label: string; variant: BadgeVariant }
> = {
  incomplete: { icon: "star", label: "Incomplete", variant: "info" },
  completed: { icon: "check", label: "Completed", variant: "success" },
};

export type QuestCardProps = Omit<
  ComponentPropsWithoutRef<"article">,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Optional caller-supplied action, such as a Button or link. */
  action?: ReactNode;
  /** Optional caller-supplied description. */
  description?: string;
  /** Caller-supplied current progress; no completion rules are applied. */
  progress: number;
  /** Optional localized accessible name for the progressbar. */
  progressLabel?: string;
  /** Optional reward metadata presented as a RewardCard. */
  reward?: QuestCardReward;
  /** Caller-supplied completion goal. */
  goal: number;
  /** Status selected by the caller; it is not derived from progress. */
  status: QuestCardStatus;
  /** Optional localized override for the visible and accessible status. */
  statusLabel?: string;
  /** Caller-supplied quest title. */
  title: string;
};

/** Presents caller-supplied quest details without completion or reward rules. */
export function QuestCard({
  "aria-describedby": ariaDescribedBy,
  action,
  className,
  description,
  goal,
  progress,
  progressLabel,
  reward,
  status,
  statusLabel,
  title,
  ...props
}: QuestCardProps) {
  const titleId = useId();
  const statusId = useId();
  const descriptionId = useId();
  const presentation = statusPresentation[status];
  const resolvedStatusLabel = statusLabel ?? presentation.label;
  const resolvedProgressLabel = progressLabel ?? `${title} progress`;
  const classes = ["ns-quest-card", className].filter(Boolean).join(" ");
  const describedBy = [
    ariaDescribedBy,
    description === undefined ? undefined : descriptionId,
  ]
    .filter(Boolean)
    .join(" ");

  if (!title.trim()) {
    throw new Error("QuestCard requires a non-empty title.");
  }

  if (!resolvedStatusLabel.trim()) {
    throw new Error("QuestCard requires a non-empty status label.");
  }

  if (!resolvedProgressLabel.trim()) {
    throw new Error("QuestCard requires a non-empty progress label.");
  }

  if (!Number.isFinite(progress) || !Number.isFinite(goal) || goal <= 0) {
    throw new Error("QuestCard requires finite progress and a positive goal.");
  }

  return (
    <Card
      {...props}
      aria-describedby={describedBy || undefined}
      aria-labelledby={`${titleId} ${statusId}`}
      as="article"
      className={classes}
      data-status={status}
    >
      <header className="ns-quest-card__header">
        <span aria-hidden="true" className="ns-quest-card__icon">
          <Icon name={presentation.icon} size="medium" />
        </span>
        <div className="ns-quest-card__heading">
          <Text
            as="h3"
            className="ns-quest-card__title"
            id={titleId}
            variant="heading"
          >
            {title}
          </Text>
          {description === undefined ? null : (
            <Text
              as="p"
              className="ns-quest-card__description"
              color="secondary"
              id={descriptionId}
              variant="body"
            >
              {description}
            </Text>
          )}
        </div>
        <Badge
          className="ns-quest-card__status"
          id={statusId}
          variant={presentation.variant}
        >
          {resolvedStatusLabel}
        </Badge>
      </header>

      <div className="ns-quest-card__progress">
        <div className="ns-quest-card__progress-summary">
          <Text as="span" color="secondary" variant="caption">
            {progressLabel ?? "Progress"}
          </Text>
          <Text
            as="span"
            className="ns-quest-card__progress-value"
            variant="label"
          >
            {progress} / {goal}
          </Text>
        </div>
        <Progress
          aria-label={resolvedProgressLabel}
          className="ns-quest-card__progress-bar"
          max={goal}
          value={progress}
        />
      </div>

      {reward === undefined ? null : (
        <div className="ns-quest-card__reward">
          <RewardCard {...reward} />
        </div>
      )}

      {action === undefined ? null : (
        <div className="ns-quest-card__action">{action}</div>
      )}
    </Card>
  );
}
