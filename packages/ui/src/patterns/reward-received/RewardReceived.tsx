import { useId, type ComponentPropsWithoutRef, type ReactElement } from "react";
import {
  RewardCard,
  type RewardCardProps,
} from "../../components/indicators/reward-card/RewardCard";
import { Celebration } from "../../components/indicators/celebration/Celebration";
import { Card } from "../../components/surface/Card";
import { Inline } from "../../components/layout/Inline";
import { Text } from "../../typography/Text";
import "./reward-received.css";

export type RewardReceivedData = Pick<
  RewardCardProps,
  "category" | "categoryLabel" | "label" | "state" | "stateLabel" | "value"
>;

export type RewardReceivedProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Enables the optional emphasis; Celebration honors reduced-motion settings. */
  celebration?: boolean;
  /** Optional caller-provided explanation of the reward. */
  description?: string;
  /** Visible heading that names the reward presentation region. */
  heading: string;
  /** Caller-provided action, such as a Button or link. */
  primaryAction: ReactElement;
  /** Caller-provided reward metadata and display state; no reward rules are applied. */
  reward: RewardReceivedData;
  /** Optional caller-provided secondary action. */
  secondaryAction?: ReactElement;
};

/** Presents a supplied reward and caller actions without calculating or granting rewards. */
export function RewardReceived({
  celebration = true,
  className,
  description,
  heading,
  primaryAction,
  reward,
  secondaryAction,
  ...props
}: RewardReceivedProps) {
  const headingId = useId();
  const classes = ["ns-reward-received", className].filter(Boolean).join(" ");

  if (!heading.trim()) {
    throw new Error("RewardReceived requires a non-empty heading.");
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
        className="ns-reward-received__celebration"
      >
        <div className="ns-reward-received__layout">
          <header className="ns-reward-received__header">
            <Text
              as="h2"
              className="ns-reward-received__heading"
              id={headingId}
              variant="heading"
            >
              {heading}
            </Text>
            {description && (
              <Text
                as="p"
                className="ns-reward-received__description"
                color="secondary"
                variant="body"
              >
                {description}
              </Text>
            )}
          </header>

          <RewardCard {...reward} />

          <Inline
            align="center"
            className="ns-reward-received__actions"
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
