import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  evaluateTypedAnswer,
  advanceExerciseSession,
  createExerciseSessionState,
  recordExerciseSessionResult,
  countExerciseItems,
  createMatchingResult,
  createSingleAnswerResult,
  type Exercise,
  type ExerciseSession,
  type ExerciseResult,
  type PracticeEvidence,
  type MatchingPairId,
} from "@opennihongo/core";
import { usePracticeKeyboard } from "./usePracticeKeyboard";
import { useLearningRecorder } from "./history/useLearningRecorder";
import { getPracticeAudioIds } from "../session/practiceAudio";
import { useExerciseAudio } from "../audio/useExerciseAudio";
export type GradedPracticeSession = Omit<ExerciseSession, "exercises"> &
  Readonly<{ exercises: readonly Exclude<Exercise, { type: "flashcard" }>[] }>;
type Practice = Readonly<{ revision: number; session: GradedPracticeSession }>;
type Feedback = Readonly<{ result: ExerciseResult; message: string }>;
export function usePracticeSession({
  createSession,
  normalizeAnswer,
  fast,
}: {
  createSession: (revision: number, sessionId: string) => GradedPracticeSession;
  normalizeAnswer: (value: string) => string;
  fast: boolean;
}) {
  const [hintsUsed, setHintsUsed] = useState(0);
  const recorder = useLearningRecorder();
  const help = useRef({ hint: false, audio: false });
  const [completions, setCompletions] = useState<
    readonly { result: ExerciseResult; evidence: PracticeEvidence }[]
  >([]);
  function requestHelp(kind: "hint" | "audio") {
    if (submitted.current) return;
    help.current[kind] = true;
    if (kind === "hint") setHintsUsed((count) => count + 1);
  }
  function saveCompletion(result: ExerciseResult, skipped = false) {
    if (!exercise) return;
    const assistance = help.current.hint
      ? help.current.audio
        ? "hint-and-audio"
        : "hint"
      : help.current.audio
        ? "audio"
        : "none";
    const evidence: PracticeEvidence = {
      exerciseType: exercise.type,
      items: result.sourceItemResults.map((item) => ({
        sourceItemId: item.sourceItemId,
        response:
          skipped && item.outcome === "incorrect" ? "skipped" : "answered",
        assistance,
      })),
    };
    setCompletions((previous) => [...previous, { result, evidence }]);
    void recorder.recordResult(practice.session, result, evidence);
  }
  const [practice, setPractice] = useState<Practice>(() => ({
    revision: 0,
    session: createSession(0, crypto.randomUUID()),
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

  const resetExerciseState = useCallback(() => {
    submitted.current = false;
    help.current = { hint: false, audio: false };
    setSelectedOptionId(null);
    setTypedAnswer("");
    setMatchedPairIds([]);
    setMatchingAttempts(0);
    setFeedback(null);
  }, []);

  const continuePractice = useCallback(() => {
    setState(advanceExerciseSession);
    resetExerciseState();
  }, [resetExerciseState]);

  function checkAnswer(choiceId = selectedOptionId) {
    if (!exercise || submitted.current || feedback) {
      return;
    }

    if (exercise.type === "multiple-choice") {
      if (!exercise.options.some(({ id }) => id === choiceId)) return;
      submitted.current = true;
      const correct = choiceId === exercise.correctOptionId;
      const result = createSingleAnswerResult(exercise, correct, 1);
      saveCompletion(result);
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
        normalizeAnswer,
      );
      const correct = result.outcome === "correct";
      saveCompletion(result);
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
    saveCompletion(result);
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
    submitted.current = true;
    saveCompletion(result, true);
    setState((current) =>
      advanceExerciseSession(recordExerciseSessionResult(current, result)),
    );
    resetExerciseState();
  }

  function restartPractice(selectedIds?: readonly string[]) {
    const revision = practice.revision + 1;
    const session: GradedPracticeSession = selectedIds
      ? {
          ...practice.session,
          id: crypto.randomUUID(),
          exercises: exercises.filter((item) => selectedIds.includes(item.id)),
        }
      : createSession(revision, crypto.randomUUID());
    setPractice({ revision, session });
    setState(createExerciseSessionState(session));
    setHintsUsed(0);
    setCompletions([]);
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

  return {
    hintsUsed,
    requestHelp,
    completions,
    recorder,
    practice,
    index,
    results,
    selectedOptionId,
    submitted,
    typedAnswer,
    setTypedAnswer,
    matchedPairIds,
    setMatchedPairIds,
    setMatchingAttempts,
    feedback,
    exercises,
    complete,
    exercise,
    exerciseAudio,
    readyToCheck,
    progress,
    continuePractice,
    checkAnswer,
    skipExercise,
    restartPractice,
    setSelectedOptionId,
  };
}
