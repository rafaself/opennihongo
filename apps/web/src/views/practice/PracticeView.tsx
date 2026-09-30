import { Link } from "@tanstack/react-router";
import {
  normalizeKanaAnswer,
  type ExerciseResult,
  type ExerciseSession,
  type MatchingPairId,
} from "@opennihongo/core";
import { Button } from "@opennihongo/ui";
import { Icon } from "@opennihongo/ui/icons";
import { useEffect, useMemo, useState } from "react";
import { PracticeFeedback } from "./PracticeFeedback";
import { PracticeExerciseContent } from "./renderers/PracticeExerciseContent";
import { PracticeResults } from "./PracticeResults";
import {
  countExerciseItems,
  createMatchingResult,
  createTypedAnswerResult,
  scoreExerciseResults,
} from "./session/exerciseResults";
import {
  createKanaPracticeSession,
  type KanaPracticeOptions,
} from "./session/createKanaPracticeSession";
import { getPracticeAudioIds } from "./session/practiceAudio";
import { useExerciseAudio } from "./audio/useExerciseAudio";
import "./practice.css";

type Practice = Readonly<{
  revision: number;
  session: ExerciseSession;
}>;

type Feedback = Readonly<{
  result: ExerciseResult;
  message: string;
}>;

export function PracticeView({
  mode,
  script,
  category,
}: Omit<KanaPracticeOptions, "revision">) {
  const [practice, setPractice] = useState<Practice>(() => ({
    revision: 0,
    session: createKanaPracticeSession({ mode, script, category, revision: 0 }),
  }));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [matchedPairIds, setMatchedPairIds] = useState<MatchingPairId[]>([]);
  const [matchingAttempts, setMatchingAttempts] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const exercises = practice.session.exercises;
  const complete = index >= exercises.length;
  const exercise = complete ? undefined : exercises[index];
  const exerciseAudioIds = useMemo(
    () => getPracticeAudioIds(exercise),
    [exercise],
  );
  const exerciseAudio = useExerciseAudio(
    exerciseAudioIds,
    `${practice.session.id}:${exercise?.id ?? "complete"}`,
    !complete,
  );
  const readyToCheck =
    exercise?.type === "typed-answer"
      ? typedAnswer.trim() !== ""
      : exercise?.type === "matching"
        ? matchedPairIds.length === exercise.config.pairCount
        : false;
  const progress = Math.round(
    ((index + Number(feedback !== null)) / exercises.length) * 100,
  );

  useEffect(() => {
    if (complete) {
      document.getElementById("practice-complete-title")?.focus();
    }
  }, [complete]);

  function resetExerciseState() {
    setTypedAnswer("");
    setMatchedPairIds([]);
    setMatchingAttempts(0);
    setFeedback(null);
  }

  function continuePractice() {
    setIndex((current) => current + 1);
    resetExerciseState();
  }

  function checkAnswer() {
    if (!exercise) {
      return;
    }

    if (exercise.type === "typed-answer") {
      const correct = exercise.acceptedAnswers.some(
        (answer) =>
          normalizeKanaAnswer(answer) === normalizeKanaAnswer(typedAnswer),
      );
      const result = createTypedAnswerResult(exercise, correct, 1);
      setResults((current) => [...current, result]);
      setFeedback({
        result,
        message: correct
          ? "Your reading is correct."
          : `The correct reading is ${exercise.acceptedAnswers[0] ?? ""}.`,
      });
      return;
    }

    const result = createMatchingResult(
      exercise,
      matchedPairIds,
      matchingAttempts,
    );
    setResults((current) => [...current, result]);
    setFeedback({ result, message: "All pairs matched." });
  }

  function skipExercise() {
    if (!exercise) {
      return;
    }

    const result =
      exercise.type === "typed-answer"
        ? createTypedAnswerResult(exercise, false, 0)
        : createMatchingResult(exercise, matchedPairIds, matchingAttempts);
    setResults((current) => [...current, result]);
    continuePractice();
  }

  function restartPractice() {
    const revision = practice.revision + 1;
    setPractice({
      revision,
      session: createKanaPracticeSession({ mode, script, category, revision }),
    });
    setIndex(0);
    setResults([]);
    resetExerciseState();
  }

  useEffect(() => {
    if (!exercise || feedback !== null) {
      return;
    }

    function handlePrimaryActionKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing ||
        event.defaultPrevented
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (
        target.isContentEditable ||
        target.closest(
          "input, textarea, select, a[href], [contenteditable='true']",
        )
      ) {
        return;
      }

      const focusedButton = target.closest("button");
      const isAnswerOption = Boolean(focusedButton?.closest(".matching-board"));
      if (focusedButton && !isAnswerOption) {
        return;
      }

      if ((!feedback && !readyToCheck) || (isAnswerOption && !readyToCheck)) {
        return;
      }

      event.preventDefault();
      if (feedback) {
        continuePractice();
      } else {
        checkAnswer();
      }
    }

    window.addEventListener("keydown", handlePrimaryActionKeyDown);
    return () => {
      window.removeEventListener("keydown", handlePrimaryActionKeyDown);
    };
  }, [checkAnswer, continuePractice, exercise, feedback, readyToCheck]);

  return (
    <section
      aria-label={
        !complete && !exerciseAudio.isReady ? "Practice session" : undefined
      }
      aria-labelledby={
        complete
          ? "practice-complete-title"
          : exerciseAudio.isReady
            ? "practice-title"
            : undefined
      }
      className="practice-session"
    >
      <header className="practice-session__header">
        <Link
          aria-label="Leave practice"
          className="practice-session__exit"
          title="Leave practice"
          to="/practice"
          search={{ script, category }}
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
        <span className="practice-session__step">
          {complete ? exercises.length : index + 1}/{exercises.length}
        </span>
      </header>

      {complete ? (
        <PracticeResults
          score={scoreExerciseResults(results)}
          total={countExerciseItems(exercises)}
          onRestart={restartPractice}
          search={{ script, category }}
        />
      ) : !exerciseAudio.isReady ? (
        <div className="practice-session__body">
          <div className="practice-session__audio-loading" role="status">
            Preparing pronunciation audio…
          </div>
        </div>
      ) : exercise ? (
        <>
          <div className="practice-session__body">
            <PracticeExerciseContent
              autoFocusTypedAnswer={index > 0 || practice.revision > 0}
              disabled={feedback !== null}
              exercise={exercise}
              scriptLabel={script === "hiragana" ? "Hiragana" : "Katakana"}
              loadedAudioIds={exerciseAudio.loadedAudioIds}
              matchedPairIds={matchedPairIds}
              onPairAttempt={(matchedPairId) => {
                setMatchingAttempts((current) => current + 1);
                if (matchedPairId !== null) {
                  setMatchedPairIds((current) =>
                    current.includes(matchedPairId)
                      ? current
                      : [...current, matchedPairId],
                  );
                }
              }}
              onPlayAudio={exerciseAudio.playAudio}
              onTypedAnswerChanged={setTypedAnswer}
              onTypedAnswerSubmit={() => {
                if (readyToCheck) {
                  checkAnswer();
                }
              }}
              typedAnswer={typedAnswer}
            />
          </div>
          <div className="practice-session__action-slot">
            {feedback ? (
              <PracticeFeedback
                correct={feedback.result.outcome === "correct"}
                finalExercise={index === exercises.length - 1}
                message={feedback.message}
                onContinue={continuePractice}
              />
            ) : (
              <footer className="practice-session__actions">
                <div className="practice-session__actions-inner">
                  <Button onClick={skipExercise} variant="secondary">
                    Skip
                  </Button>
                  <Button disabled={!readyToCheck} onClick={checkAnswer}>
                    Check answer
                  </Button>
                </div>
              </footer>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
