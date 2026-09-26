import { Button } from "@opennihongo/ui";
import { useEffect } from "react";
import "./practiceFeedback.css";

type PracticeFeedbackProps = {
  correct: boolean;
  message: string;
  finalExercise: boolean;
  onContinue: () => void;
};

export function PracticeFeedback({
  correct,
  message,
  finalExercise,
  onContinue,
}: PracticeFeedbackProps) {
  useEffect(() => {
    document.getElementById("practice-feedback-title")?.focus();
  }, []);

  return (
    <footer className="practice-feedback" data-correct={correct}>
      <div className="practice-feedback__inner">
        <span aria-hidden="true" className="practice-feedback__icon">
          {correct ? (
            <svg fill="none" viewBox="0 0 48 48">
              <path
                d="m10 25 9 9 19-20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="6"
              />
            </svg>
          ) : (
            <svg fill="none" viewBox="0 0 48 48">
              <path
                d="M15 15 33 33M33 15 15 33"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="6"
              />
            </svg>
          )}
        </span>
        <div
          className="practice-feedback__copy"
          role="status"
          aria-live="polite"
        >
          <strong id="practice-feedback-title" tabIndex={-1}>
            {correct ? "That’s right!" : "Not quite yet"}
          </strong>
          <span>{message}</span>
        </div>
        <Button onClick={onContinue}>
          {finalExercise ? "See results" : "Continue"}
        </Button>
      </div>
    </footer>
  );
}
