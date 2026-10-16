import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@opennihongo/ui";
import type {
  ExerciseResult,
  PracticeEvidence,
  ExerciseId,
} from "@opennihongo/core";
import { findReadingItem } from "./catalog";
import "./readingReview.css";
export type ReadingCompletion = Readonly<{
  result: ExerciseResult;
  evidence: PracticeEvidence;
}>;
const assistanceLabels = {
  none: "no help requested",
  hint: "hint requested",
  audio: "audio requested",
  "hint-and-audio": "hint and audio requested",
};
export function ReadingResults({
  completions,
  onRetry,
  savedReviewAvailable,
}: {
  completions: readonly ReadingCompletion[];
  savedReviewAvailable: boolean;
  onRetry: (ids: readonly ExerciseId[]) => void;
}) {
  const [selected, setSelected] = useState<readonly string[]>(() =>
    completions
      .filter(
        ({ result, evidence }) =>
          result.outcome !== "correct" ||
          evidence.items.some((item) => item.assistance !== "none"),
      )
      .map(({ result }) => result.exerciseId),
  );
  return (
    <section aria-label="Your reading results" className="reading-results">
      <h2>Your reading results</h2>
      <p>
        Choose what to practise again. Help requests are shown separately from
        correctness.
      </p>
      <ul>
        {completions.map(({ result, evidence }) => {
          const detail = evidence.items[0];
          const source = result.sourceItemResults[0];
          const item = source && findReadingItem(source.sourceItemId);
          if (!detail || !source || !item) return null;
          const status =
            detail.response === "skipped"
              ? "Skipped"
              : source.outcome === "correct"
                ? "Correct"
                : "Incorrect";
          return (
            <li key={result.exerciseId}>
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(result.exerciseId)}
                  onChange={(event) => {
                    setSelected((previous) =>
                      event.target.checked
                        ? [...previous, result.exerciseId]
                        : previous.filter((id) => id !== result.exerciseId),
                    );
                  }}
                />
                <span>
                  <strong lang="ja">{item.prompt}</strong>
                  <span>{item.reading}</span>
                  <small>
                    {status} · {assistanceLabels[detail.assistance]}
                  </small>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="reading-review__actions">
        <Button
          disabled={selected.length === 0}
          onClick={() => {
            onRetry(selected);
          }}
        >
          Retry selected ({selected.length})
        </Button>
        {savedReviewAvailable ? (
          <Link
            className="ns-button"
            data-variant="secondary"
            to="/practice/review"
          >
            Review saved readings
          </Link>
        ) : (
          <p>
            Save your answers before opening saved review. You can retry saving
            above if it fails.
          </p>
        )}
      </div>
      <p className="reading-review__note">
        Saved review uses the latest reading evidence on this device. A correct
        answer with help stays available for another try.
      </p>
    </section>
  );
}
