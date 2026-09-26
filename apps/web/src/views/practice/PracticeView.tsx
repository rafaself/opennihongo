import { Link } from "@tanstack/react-router";
import {
  kanaExercises,
  scoreKanaChoiceAnswer,
  scoreKanaMatchingAnswer,
  scoreKanaTypedAnswer,
  validateKanaChoiceAnswer,
  validateKanaTypedAnswer,
  type KanaPairAnswer,
} from "@opennihongo/core";
import { Button, Surface, Text } from "@opennihongo/ui";
import { Icon } from "@opennihongo/ui/icons";
import { useEffect, useState } from "react";
import { MatchingExercise } from "./MatchingExercise";
import { PracticeFeedback } from "./PracticeFeedback";
import { PracticeResults } from "./PracticeResults";
import { PronunciationButton } from "./PronunciationButton";
import { TypedAnswerExercise } from "./TypedAnswerExercise";
import "./practice.css";

type Feedback = { correct: boolean; message: string };

const totalPoints = kanaExercises.reduce(
  (total, exercise) =>
    total + (exercise.kind === "matching-pairs" ? exercise.pairs.length : 1),
  0,
);

export function PracticeView() {
  const [index, setIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [matchedPairs, setMatchedPairs] = useState<KanaPairAnswer[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);

  const complete = index >= kanaExercises.length;
  // The tuple is non-empty and the session index only moves forward.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- modulo always produces a tuple index
  const exercise = kanaExercises[index % kanaExercises.length]!;
  const choiceExercise =
    exercise.kind === "multiple-choice" ? exercise : undefined;

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
      (current) => current + scoreKanaMatchingAnswer(exercise, matchedPairs),
    );
    setFeedback({
      correct: true,
      message: "All pairs matched.",
    });
  }

  function restartPractice() {
    setScore(0);
    setIndex(0);
    resetExerciseState();
  }

  const readyToCheck =
    exercise.kind === "multiple-choice"
      ? selectedChoice !== ""
      : exercise.kind === "typed-answer"
        ? typedAnswer.trim() !== ""
        : matchedPairs.length === exercise.pairs.length;
  const progress = Math.round(
    ((index + Number(feedback !== null)) / kanaExercises.length) * 100,
  );

  return (
    <section
      aria-labelledby={complete ? "practice-complete-title" : "practice-title"}
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
      ) : (
        <>
          <div className="practice-session__body">
            {exercise.kind === "multiple-choice" ? (
              <div className="practice-session__question">
                <Text as="h1" id="practice-title" variant="display">
                  {exercise.direction === "hiragana-to-romaji"
                    ? "Which reading matches this word?"
                    : `Choose the characters for “${exercise.prompt.text}”:`}
                </Text>
                <div className="practice-session__exercise">
                  <Surface
                    className="practice-session__prompt"
                    elevation="card"
                  >
                    <Text
                      className={
                        exercise.prompt.script === "hiragana"
                          ? "practice-session__prompt-kana"
                          : "practice-session__prompt-romaji"
                      }
                    >
                      {exercise.prompt.text}
                    </Text>
                    {exercise.prompt.script === "hiragana" && (
                      <PronunciationButton text={exercise.prompt.text} />
                    )}
                  </Surface>
                  <div
                    aria-label="Answer choices"
                    className="practice-session__choices"
                    role="group"
                  >
                    {exercise.choices.map((choice, choiceIndex) => (
                      <Button
                        aria-keyshortcuts={String(choiceIndex + 1)}
                        aria-pressed={selectedChoice === choice}
                        className="practice-session__choice"
                        data-selected={selectedChoice === choice}
                        disabled={feedback !== null}
                        key={choice}
                        onClick={() => {
                          setSelectedChoice(choice);
                        }}
                        variant="secondary"
                      >
                        <span
                          aria-hidden="true"
                          className="practice-session__choice-number"
                        >
                          {choiceIndex + 1}
                        </span>
                        <span>{choice}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : exercise.kind === "typed-answer" ? (
              <div className="practice-session__question">
                <Text as="h1" id="practice-title" variant="display">
                  What is the corresponding sound?
                </Text>
                <TypedAnswerExercise
                  disabled={feedback !== null}
                  exercise={exercise}
                  onChange={setTypedAnswer}
                  onSubmit={() => {
                    if (readyToCheck) {
                      checkAnswer();
                    }
                  }}
                  value={typedAnswer}
                />
              </div>
            ) : (
              <div className="practice-session__question">
                <Text as="h1" id="practice-title" variant="display">
                  Match each reading with its hiragana word.
                </Text>
                <MatchingExercise
                  disabled={feedback !== null}
                  exercise={exercise}
                  matchedPairs={matchedPairs}
                  onPairMatched={(pair) => {
                    setMatchedPairs((current) => [...current, pair]);
                  }}
                />
              </div>
            )}
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
