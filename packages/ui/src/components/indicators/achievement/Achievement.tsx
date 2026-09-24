import { useId, type HTMLAttributes, type ReactNode } from "react";
import { Badge, type BadgeVariant } from "../badge/Badge";
import { Progress } from "../progress/Progress";
import { Surface } from "../../surface/Surface";
import { Icon } from "../../../icons/Icon";
import { Text } from "../../../typography/Text";
import "./achievement.css";

export type AchievementState = "locked" | "in-progress" | "unlocked" | "new";

export type AchievementProgress = {
  /** Accessible and visible description of the supplied range. */
  label: string;
  /** Caller-supplied current progress. */
  current: number;
  /** Caller-supplied completion target. */
  target: number;
};

const statePresentation: Record<
  AchievementState,
  { label: string; variant: BadgeVariant }
> = {
  locked: { label: "Locked", variant: "neutral" },
  "in-progress": { label: "In progress", variant: "info" },
  unlocked: { label: "Unlocked", variant: "success" },
  new: { label: "New", variant: "info" },
};

export type AchievementProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Optional caller-supplied descriptive text. */
  description?: string;
  /** Optional decorative caller-provided artwork. */
  icon?: ReactNode;
  /** Optional caller-supplied progress range. */
  progress?: AchievementProgress;
  /** State chosen by the caller; no eligibility or unlock rules are applied. */
  state: AchievementState;
  /** Optional localized override for the visible and accessible state label. */
  stateLabel?: string;
  /** Caller-supplied achievement title. */
  title: string;
};

/** Presents caller-supplied achievement metadata and state without game rules. */
export function Achievement({
  "aria-describedby": ariaDescribedBy,
  className,
  description,
  icon,
  progress,
  state,
  stateLabel,
  title,
  ...props
}: AchievementProps) {
  const titleId = useId();
  const stateId = useId();
  const descriptionId = useId();
  const presentation = statePresentation[state];
  const resolvedStateLabel = stateLabel ?? presentation.label;
  const classes = ["ns-achievement", className].filter(Boolean).join(" ");
  const describedBy = [
    ariaDescribedBy,
    description === undefined ? undefined : descriptionId,
  ]
    .filter(Boolean)
    .join(" ");

  if (!title.trim()) {
    throw new Error("Achievement requires a non-empty title.");
  }

  if (!resolvedStateLabel.trim()) {
    throw new Error("Achievement requires a non-empty state label.");
  }

  if (progress !== undefined && !progress.label.trim()) {
    throw new Error("Achievement progress requires a non-empty label.");
  }

  return (
    <Surface
      {...props}
      aria-describedby={describedBy || undefined}
      aria-labelledby={`${titleId} ${stateId}`}
      className={classes}
      data-state={state}
      role="group"
    >
      <span aria-hidden="true" className="ns-achievement__icon">
        {icon ?? <Icon name="star" size="large" />}
      </span>
      <div className="ns-achievement__content">
        <Text
          as="h3"
          className="ns-achievement__title"
          id={titleId}
          variant="heading"
        >
          {title}
        </Text>
        {description === undefined ? null : (
          <Text
            as="p"
            className="ns-achievement__description"
            color="secondary"
            id={descriptionId}
            variant="body"
          >
            {description}
          </Text>
        )}
        {progress === undefined ? null : (
          <div className="ns-achievement__progress">
            <Text
              as="span"
              className="ns-achievement__progress-label"
              color="secondary"
              variant="caption"
            >
              {progress.label}
            </Text>
            <Progress
              aria-label={progress.label}
              className="ns-achievement__progress-bar"
              max={progress.target}
              value={progress.current}
            />
          </div>
        )}
      </div>
      <Badge
        className="ns-achievement__state"
        id={stateId}
        variant={presentation.variant}
      >
        {resolvedStateLabel}
      </Badge>
    </Surface>
  );
}
