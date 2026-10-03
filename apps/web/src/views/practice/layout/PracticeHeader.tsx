import { Link } from "@tanstack/react-router";
import { Icon } from "@opennihongo/ui/icons";
import type { PracticeSearch } from "../../../app/practiceSearch";
import "./practiceHeader.css";

export function PracticeHeader({
  progress,
  step,
  search,
}: {
  progress: number;
  step: string;
  search?: PracticeSearch;
}) {
  return (
    <header className="practice-session__header">
      <Link
        aria-label="Leave practice"
        className="practice-session__exit"
        title="Leave practice"
        to="/practice"
        search={search ?? {}}
      >
        <Icon name="close" />
      </Link>
      <div
        aria-label="Practice progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress}
        className="practice-session__progress"
        role="progressbar"
      >
        <span
          className="practice-session__progress-fill"
          style={{ width: `${String(progress)}%` }}
        />
      </div>
      <span className="practice-session__step">{step}</span>
    </header>
  );
}
