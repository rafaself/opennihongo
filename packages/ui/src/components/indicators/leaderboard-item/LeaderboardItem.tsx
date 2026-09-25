import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Avatar } from "../../avatar/Avatar";
import { Badge, type BadgeVariant } from "../badge/Badge";
import { Surface } from "../../surface/Surface";
import { Text } from "../../../typography/Text";
import "./leaderboard-item.css";

export type LeaderboardItemChangeDirection = "up" | "down" | "unchanged";

export type LeaderboardItemChange = {
  /** Caller-supplied visible description of the rank movement. */
  label: string;
  /** Caller-supplied movement state; it does not compare ranks. */
  direction: LeaderboardItemChangeDirection;
};

export type LeaderboardItemProps = Omit<
  ComponentPropsWithoutRef<"li">,
  "aria-current" | "aria-label" | "aria-labelledby" | "children" | "role"
> & {
  /** Optional caller-supplied avatar image URL. */
  avatarSrc?: string;
  /** Optional visible fallback shown when no avatar image is available. */
  avatarFallback?: ReactNode;
  /** Optional caller-supplied rank movement indicator. */
  change?: LeaderboardItemChange;
  /** Visible label for the current-user marker. */
  currentUserLabel?: string;
  /** Whether this participant is the current user. */
  isCurrentUser?: boolean;
  /** Caller-supplied participant identity. */
  participantName: string;
  /** Caller-supplied rank; no ordering or rank calculation is performed. */
  rank: string | number;
  /** Visible and accessible rank label, for localization. */
  rankLabel?: string;
  /** Caller-supplied score display value; it is not calculated or formatted. */
  score: string | number;
  /** Visible and accessible score label, for localization. */
  scoreLabel?: string;
};

const changePresentation: Record<
  LeaderboardItemChangeDirection,
  { mark: string; variant: BadgeVariant }
> = {
  up: { mark: "↑", variant: "success" },
  down: { mark: "↓", variant: "danger" },
  unchanged: { mark: "—", variant: "neutral" },
};

function isEmptyDisplayValue(value: string | number) {
  return typeof value === "string"
    ? value.trim().length === 0
    : !Number.isFinite(value);
}

/** Presents caller-supplied leaderboard data without sorting or ranking rules. */
export function LeaderboardItem({
  avatarFallback,
  avatarSrc,
  change,
  className,
  currentUserLabel = "You",
  isCurrentUser = false,
  participantName,
  rank,
  rankLabel = "Rank",
  score,
  scoreLabel = "Score",
  ...props
}: LeaderboardItemProps) {
  const rankId = useId();
  const participantId = useId();
  const currentUserId = useId();
  const changeId = useId();
  const scoreLabelId = useId();
  const scoreId = useId();
  const classes = ["ns-leaderboard-item", className].filter(Boolean).join(" ");

  if (!participantName.trim()) {
    throw new Error("LeaderboardItem requires a non-empty participant name.");
  }

  if (isEmptyDisplayValue(rank)) {
    throw new Error("LeaderboardItem requires a non-empty finite rank.");
  }

  if (isEmptyDisplayValue(score)) {
    throw new Error("LeaderboardItem requires a non-empty finite score.");
  }

  if (!rankLabel.trim() || !scoreLabel.trim()) {
    throw new Error(
      "LeaderboardItem requires non-empty rank and score labels.",
    );
  }

  if (isCurrentUser && !currentUserLabel.trim()) {
    throw new Error("LeaderboardItem requires a non-empty current-user label.");
  }

  if (change !== undefined && !change.label.trim()) {
    throw new Error("LeaderboardItem requires a non-empty change label.");
  }

  const presentation = change && changePresentation[change.direction];
  const labelledBy = [
    rankId,
    participantId,
    isCurrentUser ? currentUserId : undefined,
    change === undefined ? undefined : changeId,
    scoreLabelId,
    scoreId,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <li
      {...props}
      aria-current={isCurrentUser ? "true" : undefined}
      aria-labelledby={labelledBy}
      className={classes}
    >
      <Surface
        className="ns-leaderboard-item__surface"
        elevation="card"
        variant={isCurrentUser ? "subtle" : "default"}
      >
        <Text
          as="span"
          className="ns-leaderboard-item__rank"
          color="secondary"
          id={rankId}
          variant="caption"
        >
          {rankLabel} {rank}
        </Text>
        <Avatar
          alt=""
          className="ns-leaderboard-item__avatar"
          fallback={avatarFallback}
          size="medium"
          {...(avatarSrc === undefined ? {} : { src: avatarSrc })}
        />
        <Text
          as="span"
          className="ns-leaderboard-item__participant"
          id={participantId}
          variant="label"
        >
          {participantName}
        </Text>
        {isCurrentUser ? (
          <Badge
            className="ns-leaderboard-item__current-user"
            id={currentUserId}
            variant="info"
          >
            {currentUserLabel}
          </Badge>
        ) : null}
        {change && presentation ? (
          <Badge
            className="ns-leaderboard-item__change"
            id={changeId}
            variant={presentation.variant}
          >
            <span
              aria-hidden="true"
              className="ns-leaderboard-item__change-mark"
            >
              {presentation.mark}
            </span>
            <span>{change.label}</span>
          </Badge>
        ) : null}
        <span className="ns-leaderboard-item__score">
          <Text
            as="span"
            className="ns-leaderboard-item__score-label"
            color="secondary"
            id={scoreLabelId}
            variant="caption"
          >
            {scoreLabel}
          </Text>
          <Text
            as="span"
            className="ns-leaderboard-item__score-value"
            id={scoreId}
            variant="label"
          >
            {score}
          </Text>
        </span>
      </Surface>
    </li>
  );
}
