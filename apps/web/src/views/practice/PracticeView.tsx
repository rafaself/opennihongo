import { Link } from "@tanstack/react-router";
import {
  kanaExercises,
  scoreKanaChoiceAnswer,
  scoreKanaMatchingAnswer,
  validateKanaChoiceAnswer,
  type KanaMatchingExercise,
  type KanaPairAnswer,
} from "@opennihongo/core";
import { Button, Surface, Text } from "@opennihongo/ui";
import { useEffect, useState } from "react";
import { PronunciationButton } from "./PronunciationButton";
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
  const [selectedRomaji, setSelectedRomaji] = useState<string | null>(null);
  const [selectedHiragana, setSelectedHiragana] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<KanaPairAnswer[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [score, setScore] = useState(0);

  const complete = index >= kanaExercises.length;
  // The tuple is non-empty and the session index only moves forward.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- modulo always produces a tuple index
  const exercise = kanaExercises[index % kanaExercises.length]!;

  useEffect(() => {
    if (complete) {
      document.getElementById("practice-complete-title")?.focus();
    }
  }, [complete]);

  function resetExerciseState() {
    setSelectedChoice("");
    setSelectedRomaji(null);
    setSelectedHiragana(null);
    setMatchedPairs([]);
    setFeedback(null);
    setSelectionMessage("");
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
          ? "That’s right!"
          : `The correct answer is ${exercise.answer}.`,
      });
      return;
    }

    setScore(
      (current) => current + scoreKanaMatchingAnswer(exercise, matchedPairs),
    );
    setFeedback({
      correct: true,
      message: "All pairs match!",
    });
  }

  function matchPair(
    matchingExercise: KanaMatchingExercise,
    romaji: string,
    hiragana: string,
  ) {
    const pair = matchingExercise.pairs.find(
      (candidate) =>
        candidate.romaji === romaji && candidate.hiragana === hiragana,
    );
    if (pair) {
      const nextPairs = [...matchedPairs, { romaji, hiragana }];
      setMatchedPairs(nextPairs);
      setSelectionMessage(`${romaji} matched with ${hiragana}.`);
    } else {
      setSelectionMessage("Those words do not match. Try a different pair.");
    }
    setSelectedRomaji(null);
    setSelectedHiragana(null);
  }

  function selectRomaji(
    matchingExercise: KanaMatchingExercise,
    romaji: string,
  ) {
    if (selectedHiragana) {
      matchPair(matchingExercise, romaji, selectedHiragana);
    } else {
      setSelectedRomaji(romaji);
      setSelectionMessage("");
    }
  }

  function selectHiragana(
    matchingExercise: KanaMatchingExercise,
    hiragana: string,
  ) {
    if (selectedRomaji) {
      matchPair(matchingExercise, selectedRomaji, hiragana);
    } else {
      setSelectedHiragana(hiragana);
      setSelectionMessage("");
    }
  }

  function restartPractice() {
    setScore(0);
    setIndex(0);
    resetExerciseState();
  }

  const readyToCheck =
    exercise.kind === "multiple-choice"
      ? selectedChoice !== ""
      : matchedPairs.length === exercise.pairs.length;
  const progress = Math.round((index / kanaExercises.length) * 100);

  return (
    <section
      aria-labelledby={complete ? "practice-complete-title" : "practice-title"}
      className="practice-session"
    >
      <header className="practice-session__header">
        <Link className="practice-session__exit" to="/">
          Leave practice
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

      <div className="practice-session__body">
        {complete ? (
          <Surface className="practice-session__complete" elevation="card">
            <Text
              as="h1"
              id="practice-complete-title"
              tabIndex={-1}
              variant="display"
            >
              Practice complete
            </Text>
            <Text>
              You matched {score} of {totalPoints} items correctly.
            </Text>
            <div className="practice-session__complete-actions">
              <Button onClick={restartPractice}>Practice again</Button>
              <Link className="ns-button" data-variant="secondary" to="/kana">
                Learn more kana
              </Link>
            </div>
          </Surface>
        ) : exercise.kind === "multiple-choice" ? (
          <div className="practice-session__question">
            <Text color="secondary" variant="label">
              Hiragana · Word practice
            </Text>
            <Text as="h1" id="practice-title" variant="display">
              {exercise.direction === "hiragana-to-romaji"
                ? "Which reading matches this word?"
                : `Choose the characters for “${exercise.prompt.text}”.`}
            </Text>
            <div className="practice-session__exercise">
              <Surface className="practice-session__prompt" elevation="card">
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
        ) : (
          <div className="practice-session__question">
            <Text color="secondary" variant="label">
              Hiragana · Word practice
            </Text>
            <Text as="h1" id="practice-title" variant="display">
              Match each reading with its hiragana word.
            </Text>
            <div className="practice-session__matching">
              <div
                aria-label="Romaji readings"
                className="practice-session__match-column"
              >
                <Text as="h2" variant="label">
                  Romaji
                </Text>
                {exercise.pairs.map(({ id, romaji }) => {
                  const matched = matchedPairs.some(
                    (pair) => pair.romaji === romaji,
                  );
                  return (
                    <Button
                      aria-pressed={selectedRomaji === romaji}
                      className="practice-session__match-option"
                      data-matched={matched}
                      data-selected={selectedRomaji === romaji}
                      disabled={matched || feedback !== null}
                      key={id}
                      onClick={() => {
                        selectRomaji(exercise, romaji);
                      }}
                      variant="secondary"
                    >
                      {romaji}
                    </Button>
                  );
                })}
              </div>
              <div
                aria-label="Hiragana words"
                className="practice-session__match-column"
              >
                <Text as="h2" variant="label">
                  Hiragana
                </Text>
                {[...exercise.pairs].reverse().map(({ id, hiragana }) => {
                  const matched = matchedPairs.some(
                    (pair) => pair.hiragana === hiragana,
                  );
                  return (
                    <Button
                      aria-pressed={selectedHiragana === hiragana}
                      className="practice-session__match-option practice-session__match-option--kana"
                      data-matched={matched}
                      data-selected={selectedHiragana === hiragana}
                      disabled={matched || feedback !== null}
                      key={id}
                      onClick={() => {
                        selectHiragana(exercise, hiragana);
                      }}
                      variant="secondary"
                    >
                      {hiragana}
                    </Button>
                  );
                })}
              </div>
            </div>
            <p aria-live="polite" className="practice-session__match-status">
              {selectionMessage ||
                `${String(matchedPairs.length)} of ${String(exercise.pairs.length)} pairs matched`}
            </p>
          </div>
        )}
      </div>

      {!complete && (
        <footer className="practice-session__actions">
          {feedback ? (
            <>
              <p
                aria-live="polite"
                className={
                  feedback.correct
                    ? "practice-session__feedback practice-session__feedback--correct"
                    : "practice-session__feedback practice-session__feedback--incorrect"
                }
                role="status"
              >
                {feedback.message}
              </p>
              <Button onClick={continuePractice}>
                {index === kanaExercises.length - 1
                  ? "See results"
                  : "Continue"}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={skipExercise} variant="secondary">
                Skip
              </Button>
              <Button disabled={!readyToCheck} onClick={checkAnswer}>
                Check answer
              </Button>
            </>
          )}
        </footer>
      )}
    </section>
  );
}
