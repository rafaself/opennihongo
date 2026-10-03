import { usePracticeKeyboard } from "./interaction/usePracticeKeyboard";
import {
  normalizeKanaAnswer,
  evaluateTypedAnswer,
  advanceExerciseSession,
  createExerciseSessionState,
  recordExerciseSessionResult,
  type ExerciseResult,
  type MatchingPairId,
} from "@opennihongo/core";
import { Button } from "@opennihongo/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { PracticeHeader } from "./layout/PracticeHeader";
import { PracticeFeedback } from "./feedback/PracticeFeedback";
import { PracticeExerciseContent } from "./renderers/PracticeExerciseContent";
import { PracticeResults } from "./results/PracticeResults";
import {
  countExerciseItems,
  createMatchingResult,
  createSingleAnswerResult,
  scoreExerciseResults,
} from "@opennihongo/core";
import {
  createKanaPracticeSession,
  type KanaPracticeOptions,
  type KanaPracticeSession,
} from "./session/createKanaPracticeSession";
import { getPracticeAudioIds } from "./session/practiceAudio";
import { useExerciseAudio } from "./audio/useExerciseAudio";
import "./practice.css";

type Practice = Readonly<{
  revision: number;
  session: KanaPracticeSession;
}>;

type Feedback = Readonly<{
  result: ExerciseResult;
  message: string;
}>;

export function PracticeView({
  mode,
  scripts,
  categories,
  characterIds,
  difficulty,
  length,
  direction,
  fast,
  onChangeOptions,
}: Omit<KanaPracticeOptions, "revision"> & {
  onChangeOptions?: () => void;
}) {
  const configuration = {
    scripts,
    categories,
    ...(characterIds === undefined ? {} : { characterIds }),
    difficulty,
    ...(length === undefined ? {} : { length }),
    direction,
    fast,
  };
  const [hintsUsed, setHintsUsed] = useState(0);
  const [practice, setPractice] = useState<Practice>(() => ({
    revision: 0,
    session: createKanaPracticeSession({
      mode,
      ...configuration,
      revision: 0,
    }),
  }));
  const [state, setState] = useState(() =>
    createExerciseSessionState(practice.session),
  );
  const { index, results } = state;
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
  const completedItems =
    countExerciseItems(exercises.slice(0, index)) +
    (feedback && exercise ? countExerciseItems([exercise]) : 0);
  const progress = Math.round(
    (completedItems / countExerciseItems(exercises)) * 100,
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
    setState(advanceExerciseSession);
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
      setState((current) => recordExerciseSessionResult(current, result));
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
      const result = evaluateTypedAnswer(
        exercise,
        typedAnswer,
        normalizeKanaAnswer,
      );
      const correct = result.outcome === "correct";
      setState((current) => recordExerciseSessionResult(current, result));
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
    setState((current) => recordExerciseSessionResult(current, result));
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
    setState((current) =>
      advanceExerciseSession(recordExerciseSessionResult(current, result)),
    );
    resetExerciseState();
  }

  function restartPractice() {
    const revision = practice.revision + 1;
    const session = createKanaPracticeSession({
      mode,
      ...configuration,
      revision,
    });
    setPractice({ revision, session });
    setState(createExerciseSessionState(session));
    setHintsUsed(0);
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
      <PracticeHeader
        progress={progress}
        search={configuration}
        step={`${String(complete ? exercises.length : index + 1)}/${String(exercises.length)}`}
      />

      {complete ? (
        <PracticeResults
          score={scoreExerciseResults(results)}
          total={countExerciseItems(exercises)}
          hintsUsed={
            difficulty === "easy" && mode === "reading" ? hintsUsed : undefined
          }
          onRestart={restartPractice}
          onChangeOptions={onChangeOptions}
          search={configuration}
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
              difficulty={difficulty}
              onHintRequested={() => {
                setHintsUsed((count) => count + 1);
              }}
              selectedOptionId={selectedOptionId}
              onOptionSelected={(id) => {
                if (submitted.current) return;
                setSelectedOptionId(id);
                if (fast) checkAnswer(id);
              }}
              autoFocusTypedAnswer={index > 0 || practice.revision > 0}
              disabled={feedback !== null}
              exercise={exercise}
              scriptLabel={
                scripts.length === 2
                  ? "Kana"
                  : scripts[0] === "hiragana"
                    ? "Hiragana"
                    : "Katakana"
              }
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
