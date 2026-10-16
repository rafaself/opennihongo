import type { TypedAnswerExercise } from "@opennihongo/core";
import { findReadingItem } from "./catalog";
import "./readingReview.css";
export function ReadingFeedback({
  exercise,
}: {
  exercise: TypedAnswerExercise;
}) {
  const item = findReadingItem(exercise.sourceItemIds[0] ?? "");
  if (!item) return null;
  return (
    <div className="reading-feedback">
      <span>
        Reading to remember:{" "}
        <strong lang={item.subject === "kanji" ? "ja" : undefined}>
          {item.reading}
        </strong>
      </span>
      <p>{item.explanation}</p>
    </div>
  );
}
