import { Link } from "@tanstack/react-router";
import {
  kanaExercises,
  scoreKanaChoiceAnswer,
  scoreKanaMatchingAnswer,
  scoreKanaTypedAnswer,
  validateKanaChoiceAnswer,
  validateKanaTypedAnswer,
  type KanaPairAnswer,
  type KanaMatchingExercise,
  type KanaWord,
} from "@opennihongo/core";
import { kanaBeginnerWords } from "@opennihongo/content";
import { Button } from "@opennihongo/ui";
import { Icon } from "@opennihongo/ui/icons";
import { useEffect, useState } from "react";
import { PracticeFeedback } from "./PracticeFeedback";
import { PracticeExerciseContent } from "./PracticeExerciseContent";
import { PracticeResults } from "./PracticeResults";
import { useExerciseAudio } from "./audio/useExerciseAudio";
import "./practice.css";

type Feedback = { correct: boolean; message: string };

const totalPoints = kanaExercises.reduce(
  (total, exercise) =>
    total + (exercise.kind === "matching-pairs" ? exercise.pairIds.length : 1),
  0,
);

const matchingWordsById = new Map(
  kanaBeginnerWords.map((word) => [
    word.id,
    {
      id: word.id,
      hiragana: word.hiragana,
      romaji: word.romanization,
    },
  ]),
);

function resolveMatchingPairs(
  exercise: KanaMatchingExercise,
): readonly KanaWord[] {
  return exercise.pairIds.map((id) => {
    const word = matchingWordsById.get(id);
    if (!word) {
      throw new Error(`Missing Kana word content for ${id}`);
    }
    return word;
  });
}

export function PracticeView() {
  const [index, setIndex] = useState(0);
  const [sessionId, setSessionId] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [matchedPairs, setMatchedPairs] = useState<KanaPairAnswer[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);

  const complete = index >= kanaExercises.length;
  // The tuple is non-empty and the session index only moves forward.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- modulo always produces a tuple index
  const exercise = kanaExercises[index % kanaExercises.length]!;
  const matchingPairs =
    exercise.kind === "matching-pairs" ? resolveMatchingPairs(exercise) : [];
  const choiceExercise =
    exercise.kind === "multiple-choice" ? exercise : undefined;
  const exerciseAudio = useExerciseAudio(
    exercise.audioIds,
    `${String(sessionId)}:${exercise.id}`,
    !complete,
  );
  useEffect(() => {
    if (complete) {
      document.getElementById("practice-complete-title")?.focus();
    }
  }, [complete]);

  useEffect(() => {
    if (!choiceExercise || feedback !== null) {
      return;
    }
    const choices = choiceExercise.choices;

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.defaultPrevented
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest("input, textarea, select, [contenteditable='true']"))
      ) {
        return;
      }

      const choiceIndex = Number(event.key) - 1;
      const choice = choices[choiceIndex];
      if (!choice) {
        return;
      }

      event.preventDefault();
      setSelectedChoice(choice);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [choiceExercise, feedback]);

  function resetExerciseState() {
    setSelectedChoice("");
    setTypedAnswer("");
    setMatchedPairs([]);
    setFeedback(null);
  }

  function continuePractice() {
    setIndex((current) => current + 1);
    resetExerciseState();
  }

  function skipExercise() {
    continuePractice();
  }

  function checkAnswer() {
    if (exercise.kind === "multiple-choice") {
      const correct = validateKanaChoiceAnswer(exercise, selectedChoice);
      setScore(
        (current) => current + scoreKanaChoiceAnswer(exercise, selectedChoice),
      );
      setFeedback({
        correct,
        message: correct
          ? "You chose the right answer."
          : `The correct answer is ${exercise.answer}.`,
      });
      return;
    }

    if (exercise.kind === "typed-answer") {
      const correct = validateKanaTypedAnswer(exercise, typedAnswer);
      setScore(
        (current) => current + scoreKanaTypedAnswer(exercise, typedAnswer),
      );
      setFeedback({
        correct,
        message: correct
          ? "Your reading is correct."
          : `The correct reading is ${exercise.answer}.`,
      });
      return;
    }

    setScore(
      (current) =>
        current + scoreKanaMatchingAnswer(matchingPairs, matchedPairs),
    );
    setFeedback({
      correct: true,
      message: "All pairs matched.",
    });
  }

  function restartPractice() {
    setScore(0);
    setIndex(0);
    setSessionId((current) => current + 1);
    resetExerciseState();
  }

  const readyToCheck =
    exercise.kind === "multiple-choice"
      ? selectedChoice !== ""
      : exercise.kind === "typed-answer"
        ? typedAnswer.trim() !== ""
        : matchedPairs.length === matchingPairs.length;
  const progress = Math.round(
    ((index + Number(feedback !== null)) / kanaExercises.length) * 100,
  );

  useEffect(() => {
    if (complete) {
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
      const isAnswerOption = focusedButton?.matches(
        ".practice-session__choice, .practice-session__match-option",
      );
      if (focusedButton && !isAnswerOption) {
        return;
      }

      if (isAnswerOption && !feedback && !readyToCheck) {
        return;
      }

      if (!feedback && !readyToCheck) {
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
  }, [checkAnswer, complete, continuePractice, feedback, readyToCheck]);

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
          to="/"
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
          {complete ? kanaExercises.length : index + 1}/{kanaExercises.length}
        </span>
      </header>

      {complete ? (
        <PracticeResults
          score={score}
          total={totalPoints}
          onRestart={restartPractice}
        />
      ) : !exerciseAudio.isReady ? (
        <div className="practice-session__body">
          <div className="practice-session__audio-loading" role="status">
            Preparing pronunciation audio…
          </div>
        </div>
      ) : (
        <>
          <div className="practice-session__body">
            <PracticeExerciseContent
              disabled={feedback !== null}
              exercise={exercise}
              loadedAudioIds={exerciseAudio.loadedAudioIds}
              matchingPairs={matchingPairs}
              matchedPairs={matchedPairs}
              onChoiceSelected={setSelectedChoice}
              onPairMatched={(pair) => {
                setMatchedPairs((current) => [...current, pair]);
              }}
              onPlayAudio={exerciseAudio.playAudio}
              onTypedAnswerChanged={setTypedAnswer}
              onTypedAnswerSubmit={() => {
                if (readyToCheck) {
                  checkAnswer();
                }
              }}
              selectedChoice={selectedChoice}
              typedAnswer={typedAnswer}
            />
          </div>
          <div className="practice-session__action-slot">
            {feedback ? (
              <PracticeFeedback
                correct={feedback.correct}
                finalExercise={index === kanaExercises.length - 1}
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
      )}
    </section>
  );
}
