import { useId, type ComponentPropsWithoutRef, type ReactElement } from "react";
import {
  Achievement,
  type AchievementProps,
} from "../../components/indicators/achievement/Achievement";
import { Celebration } from "../../components/indicators/celebration/Celebration";
import { Card } from "../../components/surface/Card";
import { Inline } from "../../components/layout/Inline";
import { Text } from "../../typography/Text";
import "./achievement-unlocked.css";

export type AchievementUnlockedData = Pick<
  AchievementProps,
  "description" | "icon" | "progress" | "state" | "stateLabel" | "title"
>;

export type AchievementUnlockedProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Caller-supplied achievement metadata and display state. */
  achievement: AchievementUnlockedData;
  /** Enables the optional emphasis; the Celebration primitive honors reduced motion. */
  celebration?: boolean;
  /** Visible heading for the named presentation region. */
  heading: string;
  /** Caller-supplied primary control, such as a Button or link. */
  primaryAction: ReactElement;
  /** Optional caller-supplied secondary control. */
  secondaryAction?: ReactElement;
};

/** Presents a caller-supplied achievement, state, and actions without game rules. */
export function AchievementUnlocked({
  achievement,
  celebration = true,
  className,
  heading,
  primaryAction,
  secondaryAction,
  ...props
}: AchievementUnlockedProps) {
  const headingId = useId();
  const classes = ["ns-achievement-unlocked", className]
    .filter(Boolean)
    .join(" ");

  if (!heading.trim()) {
    throw new Error("AchievementUnlocked requires a non-empty heading.");
  }

  return (
    <Card
      {...props}
      aria-labelledby={headingId}
      as="section"
      className={classes}
    >
      <Celebration
        active={celebration}
        className="ns-achievement-unlocked__celebration"
      >
        <div className="ns-achievement-unlocked__layout">
          <header className="ns-achievement-unlocked__header">
            <Text
              as="h2"
              className="ns-achievement-unlocked__heading"
              id={headingId}
              variant="heading"
            >
              {heading}
            </Text>
          </header>

          <Achievement {...achievement} />

          <Inline
            align="center"
            className="ns-achievement-unlocked__actions"
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
