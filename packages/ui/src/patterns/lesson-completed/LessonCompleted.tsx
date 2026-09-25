import {
  useId,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { Celebration } from "../../components/indicators/celebration/Celebration";
import { Card } from "../../components/surface/Card";
import { Inline } from "../../components/layout/Inline";
import { Text } from "../../typography/Text";
import "./lesson-completed.css";

export type LessonCompletedProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Caller-supplied supporting completion text. */
  description?: string;
  /** Enables the optional, reduced-motion-aware emphasis treatment. */
  celebration?: boolean;
  /** Caller-composed progress content with its own accessible semantics. */
  progress?: ReactNode;
  /** Required caller-supplied primary action element, such as a Button or link. */
  primaryAction: ReactElement;
  /** Optional caller-composed reward content with appropriate semantics. */
  rewards?: ReactNode;
  /** Optional caller-supplied secondary action element. */
  secondaryAction?: ReactElement;
  /** Completion heading; it also names the section for assistive technology. */
  title: string;
};

/**
 * Presents caller-provided completion content, progress, rewards, and actions.
 * It does not determine completion, calculate rewards, or perform navigation.
 */
export function LessonCompleted({
  celebration = false,
  className,
  description,
  progress,
  primaryAction,
  rewards,
  secondaryAction,
  title,
  ...props
}: LessonCompletedProps) {
  const titleId = useId();
  const hasProgress = progress !== undefined && progress !== null;
  const hasRewards = rewards !== undefined && rewards !== null;
  const classes = ["ns-lesson-completed", className].filter(Boolean).join(" ");

  if (!title.trim()) {
    throw new Error("LessonCompleted requires a non-empty title.");
  }

  return (
    <Card {...props} aria-labelledby={titleId} as="section" className={classes}>
      <Celebration
        active={celebration}
        className="ns-lesson-completed__celebration"
      >
        <div className="ns-lesson-completed__layout">
          <header className="ns-lesson-completed__header">
            <Text
              as="h2"
              className="ns-lesson-completed__title"
              id={titleId}
              variant="heading"
            >
              {title}
            </Text>
            {description && (
              <Text
                as="p"
                className="ns-lesson-completed__description"
                color="secondary"
                variant="body"
              >
                {description}
              </Text>
            )}
          </header>

          {(hasProgress || hasRewards) && (
            <div className="ns-lesson-completed__summary">
              {hasProgress && (
                <div className="ns-lesson-completed__progress">{progress}</div>
              )}
              {hasRewards && (
                <div className="ns-lesson-completed__rewards">{rewards}</div>
              )}
            </div>
          )}

          <Inline
            align="center"
            className="ns-lesson-completed__actions"
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
