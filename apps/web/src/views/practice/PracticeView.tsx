import { usePracticeKeyboard } from "./interaction/usePracticeKeyboard";
import { Link } from "@tanstack/react-router";
import {
  normalizeKanaAnswer,
  type ExerciseResult,
  type ExerciseSession,
  type MatchingPairId,
} from "@opennihongo/core";
import { Button } from "@opennihongo/ui";
import { Icon } from "@opennihongo/ui/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { PracticeFeedback } from "./PracticeFeedback";
import { PracticeExerciseContent } from "./renderers/PracticeExerciseContent";
import { PracticeResults } from "./PracticeResults";
import {
  countExerciseItems,
  createMatchingResult,
  createSingleAnswerResult,
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
  direction = "random",
  fast = false,
  onChangeOptions,
}: Omit<KanaPracticeOptions, "revision"> & {
  fast?: boolean;
  onChangeOptions?: () => void;
}) {
  const [practice, setPractice] = useState<Practice>(() => ({
    revision: 0,
    session: createKanaPracticeSession({
      mode,
      script,
      category,
      direction,
      revision: 0,
    }),
  }));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const submitted = useRef(false);
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
        : exercise?.type === "multiple-choice" && selectedOptionId !== null;
  const progress = Math.round(
    ((index + Number(feedback !== null)) / exercises.length) * 100,
  );

  useEffect(() => {
    if (complete) {
      document.getElementById("practice-complete-title")?.focus();
    }
  }, [complete]);

  function resetExerciseState() {
    submitted.current = false;
    setSelectedOptionId(null);
    setTypedAnswer("");
    setMatchedPairIds([]);
    setMatchingAttempts(0);
    setFeedback(null);
  }

  function continuePractice() {
    setIndex((current) => current + 1);
    resetExerciseState();
  }

  function checkAnswer(choiceId = selectedOptionId) {
    if (!exercise || submitted.current || feedback) {
      return;
    }

    if (exercise.type === "multiple-choice") {
      if (!exercise.options.some(({ id }) => id === choiceId)) return;
      submitted.current = true;
      const correct = choiceId === exercise.correctOptionId;
      const result = createSingleAnswerResult(exercise, correct, 1);
      setResults((current) => [...current, result]);
      setFeedback({
        result,
        message: correct
          ? "Your answer is correct."
          : `The correct answer is ${exercise.options.find(({ id }) => id === exercise.correctOptionId)?.text ?? ""}.`,
      });
      return;
    }
    submitted.current = true;
    if (exercise.type === "typed-answer") {
      const correct = exercise.acceptedAnswers.some(
        (answer) =>
          normalizeKanaAnswer(answer) === normalizeKanaAnswer(typedAnswer),
      );
      const result = createSingleAnswerResult(exercise, correct, 1);
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
    if (!exercise || submitted.current || feedback) {
      return;
    }

    const result =
      exercise.type !== "matching"
        ? createSingleAnswerResult(exercise, false, 0)
        : createMatchingResult(exercise, matchedPairIds, matchingAttempts);
    setResults((current) => [...current, result]);
    continuePractice();
  }

  function restartPractice() {
    const revision = practice.revision + 1;
    setPractice({
      revision,
      session: createKanaPracticeSession({
        mode,
        script,
        category,
        direction,
        revision,
      }),
    });
    setIndex(0);
    setResults([]);
    resetExerciseState();
  }

  usePracticeKeyboard({
    exercise,
    hasFeedback: feedback !== null,
    readyToCheck,
    checkAnswer,
  });
  useEffect(() => {
    if (!fast || feedback === null) return;
    const timer = window.setTimeout(continuePractice, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [fast, feedback, continuePractice]);

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
          onChangeOptions={onChangeOptions}
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
              selectedOptionId={selectedOptionId}
              onOptionSelected={(id) => {
                if (submitted.current) return;
                setSelectedOptionId(id);
                if (fast) checkAnswer(id);
              }}
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
                automatic={fast}
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
                  {!fast && (
                    <Button
                      disabled={!readyToCheck}
                      onClick={() => {
                        checkAnswer();
                      }}
                    >
                      Check answer
                    </Button>
                  )}
                </div>
              </footer>
            )}
          </div>
        </>
      ) : null}
    </section>
  );
}
