import { hiraganaVowels } from "@opennihongo/content";
import {
  advanceExerciseSession,
  countExerciseItems,
  createExerciseSessionState,
  evaluateTypedAnswer,
  getCurrentExercise,
  normalizeKanaAnswer,
  recordExerciseSessionResult,
  recordKanaItemResult,
  scoreExerciseResults,
  type KanaProgress,
} from "@opennihongo/core";
import { loadKanaProgress, updateKanaProgress } from "@opennihongo/persistence";
import { useEffect, useRef, useState } from "react";
import { createKanaVowelSession } from "../session/createKanaVowelSession";

/** Connects transient domain state to React and the device storage boundary. */
export function useKanaVowelLesson() {
  const [state, setState] = useState(() =>
    createExerciseSessionState(createKanaVowelSession()),
  );
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<KanaProgress[]>([]);
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState("");
  const submitted = useRef(false);
  const active = useRef(true);
  const exercise = getCurrentExercise(state);
  const feedback = state.results[state.index];
  const complete = exercise === undefined;

  useEffect(() => {
    let current = true;
    active.current = true;
    void loadKanaProgress()
      .then((saved) => {
        if (current) setProgress(saved);
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
    const answeredAt = new Date().toISOString();
    setSaving(true);
    try {
      for (const itemResult of result.sourceItemResults) {
        const saved = await updateKanaProgress(
          itemResult.sourceItemId,
          (existing) => recordKanaItemResult(existing, itemResult, answeredAt),
        );
        if (active.current) {
          setProgress((previous) => [
            ...previous.filter((entry) => entry.itemId !== saved.itemId),
            saved,
          ]);
        }
      }
      if (active.current) setStorageError("");
    } catch {
      if (active.current)
        setStorageError(
          "Your answer could not be saved. You can still finish this session.",
        );
    } finally {
      if (active.current) {
        setState(answeredState);
        setSaving(false);
      }
    }
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
    setState(createExerciseSessionState(state.session));
    setAnswer("");
    submitted.current = false;
    focusAnswer();
  }

  return {
    loading,
    answer,
    setAnswer,
    saving,
    storageError,
    exercise,
    feedback,
    complete,
    index: state.index,
    total: countExerciseItems(state.session.exercises),
    score: scoreExerciseResults(state.results),
    practicedCount: progress.filter((entry) =>
      hiraganaVowels.some((vowel) => vowel.id === entry.itemId),
    ).length,
    submitAnswer,
    continueSession,
    restartSession,
  };
}
