import { Link } from "@tanstack/react-router";
import { Button, Text } from "@opennihongo/ui";
import "./practiceResults.css";
import type { PracticeSearch } from "../../../app/practiceSearch";

type PracticeResultsProps = {
  score: number;
  total: number;
  onRestart: () => void;
  onChangeOptions?: (() => void) | undefined;
  search?: PracticeSearch;
  hintsUsed?: number | undefined;
  accuracy?: number;
  summary?: string;
  scoreLabel?: string;
  accuracyLabel?: string;
};

function CelebrationArt() {
  return (
    <svg
      aria-hidden="true"
      className="practice-results__art"
      fill="none"
      viewBox="0 0 360 210"
    >
      <circle
        cx="180"
        cy="102"
        r="88"
        fill="var(--ns-color-feedback-success-surface)"
      />
      <path
        d="M31 58h18M40 49v18M310 35h18M319 26v18"
        stroke="var(--ns-color-feedback-success)"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="m59 150 11 11 11-11M281 149l10 11 10-11"
        stroke="var(--ns-color-action-primary)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <circle cx="80" cy="42" r="5" fill="var(--ns-color-action-primary)" />
      <circle cx="290" cy="84" r="4" fill="var(--ns-color-feedback-success)" />
      <circle cx="47" cy="112" r="4" fill="var(--ns-color-feedback-success)" />
      <path
        d="M179 31 195 49l-16 17-16-17z"
        fill="var(--ns-color-action-primary)"
      />
      <path
        d="M134 57h92v113a13 13 0 0 1-13 13h-66a13 13 0 0 1-13-13z"
        fill="var(--ns-color-surface)"
        stroke="var(--ns-color-border-subtle)"
        strokeWidth="4"
      />
      <path
        d="M147 43h66a13 13 0 0 1 13 13v12h-92V56a13 13 0 0 1 13-13Z"
        fill="var(--ns-color-action-primary)"
      />
      <text
        x="180"
        y="139"
        textAnchor="middle"
        fill="var(--ns-color-text-primary)"
        fontSize="59"
        fontWeight="700"
      >
        花
      </text>
      <path
        d="M149 184h62"
        stroke="var(--ns-color-feedback-success)"
        strokeLinecap="round"
        strokeWidth="7"
      />
    </svg>
  );
}

export function PracticeResults({
  score,
  total,
  onRestart,
  onChangeOptions,
  search,
  accuracy: providedAccuracy,
  hintsUsed,
  summary,
  scoreLabel = "Correct items",
  accuracyLabel = "Accuracy",
}: PracticeResultsProps) {
  const accuracy = providedAccuracy ?? Math.round((score / total) * 100);
  const perfect = score === total && accuracy === 100;

  return (
    <>
      <div className="practice-results">
        <CelebrationArt />
        <Text
          as="h1"
          id="practice-complete-title"
          tabIndex={-1}
          variant="display"
        >
          {perfect ? "Perfect practice!" : "Practice complete!"}
        </Text>
        <Text color="secondary">
          {summary ??
            (perfect
              ? "Every answer landed. Beautiful work!"
              : "Every session moves you forward.")}
        </Text>
        {hintsUsed !== undefined && (
          <Text color="secondary">Hints used: {hintsUsed}</Text>
        )}
        <div className="practice-results__stats" aria-label="Session results">
          <div className="practice-results__stat practice-results__stat--score">
            <span>{scoreLabel}</span>
            <strong>
              {score} / {total}
            </strong>
          </div>
          <div className="practice-results__stat practice-results__stat--accuracy">
            <span>{accuracyLabel}</span>
            <strong>{accuracy}%</strong>
          </div>
        </div>
      </div>
      <div
        className={`practice-session__action-slot${onChangeOptions ? " practice-results__action-slot--options" : ""}`}
      >
        <footer className="practice-results__actions">
          <div>
            <Link
              className="ns-button"
              data-variant="secondary"
              search={search ?? {}}
              to="/practice"
            >
              Back to Practice
            </Link>
            {onChangeOptions && (
              <Button onClick={onChangeOptions} variant="secondary">
                Change options
              </Button>
            )}
            <Button onClick={onRestart}>Practice again</Button>
          </div>
        </footer>
      </div>
    </>
  );
}
