import { hiraganaVowels } from "@opennihongo/content";
import {
  advanceExerciseSession,
  countExerciseItems,
  createExerciseSessionState,
  deriveItemProgress,
  evaluateTypedAnswer,
  getCurrentExercise,
  normalizeKanaAnswer,
  recordExerciseSessionResult,
  scoreExerciseResults,
} from "@opennihongo/core";
import {
  loadLearningHistory,
  type LearningHistory,
} from "@opennihongo/persistence";
import { useEffect, useMemo, useRef, useState } from "react";
import { createKanaVowelSession } from "../session/createKanaVowelSession";
import { useLearningRecorder } from "./history/useLearningRecorder";

/** Connects generic domain state, device history, and the lesson presentation. */
export function useKanaVowelLesson() {
  const [state, setState] = useState(() =>
    createExerciseSessionState(createKanaVowelSession(crypto.randomUUID())),
  );
  const [history, setHistory] = useState<LearningHistory>({
    records: [],
    baselines: [],
  });
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState("");
  const [storageError, setStorageError] = useState("");
  const submitted = useRef(false);
  const active = useRef(true);
  const recorder = useLearningRecorder();
  const exercise = getCurrentExercise(state);
  const feedback = state.results[state.index];
  const complete = exercise === undefined;
  const progress = useMemo(() => {
    try {
      return {
        items: deriveItemProgress(
          [...history.records, ...recorder.savedRecords],
          history.baselines,
        ),
        error: "",
      };
    } catch {
      return {
        items: [],
        error: "Progress could not be calculated. You can still practice.",
      };
    }
  }, [history, recorder.savedRecords]);

  useEffect(() => {
    let current = true;
    active.current = true;
    void loadLearningHistory()
      .then((saved) => {
        if (current) setHistory(saved);
      })
      .catch(() => {
        if (current)
          setStorageError(
            "Progress could not be loaded. You can still practice.",
          );
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (complete) document.getElementById("practice-complete-title")?.focus();
  }, [complete]);

  async function submitAnswer() {
    if (
      exercise?.type !== "typed-answer" ||
      !answer.trim() ||
      submitted.current
    )
      return;
    submitted.current = true;
    const result = evaluateTypedAnswer(exercise, answer, normalizeKanaAnswer);
    const answeredState = recordExerciseSessionResult(state, result);
    await recorder.recordResult(state.session, result);
    if (active.current) setState(answeredState);
  }
  function focusAnswer() {
    window.requestAnimationFrame(() =>
      document.getElementById("kana-answer")?.focus(),
    );
  }
  function continueSession() {
    const next = advanceExerciseSession(state);
    setState(next);
    setAnswer("");
    submitted.current = false;
    if (getCurrentExercise(next)) focusAnswer();
  }
  function restartSession() {
    setState(
      createExerciseSessionState(createKanaVowelSession(crypto.randomUUID())),
    );
    setAnswer("");
    submitted.current = false;
    focusAnswer();
  }
  return {
    loading,
    answer,
    setAnswer,
    saving: recorder.saving,
    storageError: storageError || progress.error,
    recorder,
    exercise,
    feedback,
    complete,
    index: state.index,
    total: countExerciseItems(state.session.exercises),
    score: scoreExerciseResults(state.results),
    practicedCount:
      storageError || progress.error
        ? undefined
        : progress.items.filter((entry) =>
            hiraganaVowels.some((vowel) => vowel.id === entry.itemId),
          ).length,
    submitAnswer,
    continueSession,
    restartSession,
  };
}
