import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Progress } from "../../components/indicators/progress/Progress";
import "./quest-list.css";

const headingTags = { 2: "h2", 3: "h3", 4: "h4" } as const;

export type QuestListItem = {
  /** Stable key supplied by the caller. */
  id: string;
  /** Decorative artwork for this quest. */
  icon: ReactNode;
  /** Caller-supplied quest title. */
  title: string;
  /** Current progress, between zero and the goal. */
  progress: number;
  /** Positive completion goal. */
  goal: number;
  /** Optional localized accessible name for the progressbar. */
  progressLabel?: string;
  /** Optional localized visible progress text. */
  valueLabel?: string;
  /** Optional visual reward with an accessible name. */
  reward?: { icon: ReactNode; label: string };
};

export type QuestListProps = Omit<
  ComponentPropsWithoutRef<"section">,
  "aria-label" | "aria-labelledby" | "children"
> & {
  /** Visible and accessible heading for this group. */
  title: string;
  /** Static, caller-supplied time text; this component does not run a timer. */
  remainingTime?: string;
  /** Heading level appropriate to the surrounding document. */
  headingLevel?: 2 | 3 | 4;
  /** Caller-supplied quests in display order. */
  items: readonly QuestListItem[];
};

/** Presents grouped quest progress without calculating rewards or time. */
export function QuestList({
  className,
  headingLevel = 2,
  items,
  remainingTime,
  title,
  ...props
}: QuestListProps) {
  const titleId = useId();
  const Heading = headingTags[headingLevel];
  const classes = ["ns-quest-list", className].filter(Boolean).join(" ");

  if (!title.trim()) {
    throw new Error("QuestList requires a non-empty title.");
  }

  const ids = new Set<string>();
  for (const item of items) {
    if (!item.id.trim() || ids.has(item.id)) {
      throw new Error("QuestList item ids must be non-empty and unique.");
    }
    ids.add(item.id);
    if (!item.title.trim()) {
      throw new Error("QuestList item titles must be non-empty.");
    }
    if (
      !Number.isFinite(item.goal) ||
      item.goal <= 0 ||
      !Number.isFinite(item.progress) ||
      item.progress < 0 ||
      item.progress > item.goal
    ) {
      throw new Error("QuestList progress must be within its positive goal.");
    }
    if (item.reward !== undefined && !item.reward.label.trim()) {
      throw new Error("QuestList reward labels must be non-empty.");
    }
  }

  return (
    <section {...props} aria-labelledby={titleId} className={classes}>
      <header className="ns-quest-list__header">
        <Heading className="ns-quest-list__title" id={titleId}>
          {title}
        </Heading>
        {remainingTime === undefined ? null : (
          <span className="ns-quest-list__time">
            <span aria-hidden="true" className="ns-quest-list__clock" />
            {remainingTime}
          </span>
        )}
      </header>

      <ul className="ns-quest-list__items">
        {items.map((item) => (
          <li className="ns-quest-list__item" key={item.id}>
            <span aria-hidden="true" className="ns-quest-list__icon">
              {item.icon}
            </span>
            <div className="ns-quest-list__content">
              <span className="ns-quest-list__item-title">{item.title}</span>
              <div className="ns-quest-list__progress-row">
                <div className="ns-quest-list__progress-wrap">
                  <Progress
                    aria-label={item.progressLabel ?? item.title}
                    className="ns-quest-list__progress"
                    max={item.goal}
                    value={item.progress}
                  />
                  <span aria-hidden="true" className="ns-quest-list__value">
                    {item.valueLabel ??
                      `${item.progress.toString()} / ${item.goal.toString()}`}
                  </span>
                </div>
                {item.reward === undefined ? null : (
                  <span
                    aria-label={item.reward.label}
                    className="ns-quest-list__reward"
                    role="img"
                  >
                    <span aria-hidden="true">{item.reward.icon}</span>
                  </span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
