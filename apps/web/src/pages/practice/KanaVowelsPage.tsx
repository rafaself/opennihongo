import { normalizePracticeSearch } from "../../app/practiceSearch";
import { hiraganaVowels } from "@opennihongo/content";
import { checkKanaAnswer } from "@opennihongo/core";
import type { KanaProgress } from "@opennihongo/core";
import { loadKanaProgress, saveKanaAnswer } from "@opennihongo/persistence";
import { Button, FormField, Input, Surface, Text } from "@opennihongo/ui";
import { useEffect, useState, type SyntheticEvent } from "react";
import { PracticeFeedback } from "../../views/practice/feedback/PracticeFeedback";
import { PracticeHeader } from "../../views/practice/layout/PracticeHeader";
import { PracticeResults } from "../../views/practice/results/PracticeResults";
import "../../views/practice/practice.css";

type Feedback = { correct: boolean; expected: string };

export function KanaVowelsPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<KanaProgress[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    let active = true;
    void loadKanaProgress()
      .then((saved) => {
        if (active) setProgress(saved);
      })
      .catch(() => {
        if (active)
          setStorageError(
            "Progress could not be loaded. You can still practice.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const item = hiraganaVowels[index];
  const complete = index >= hiraganaVowels.length;
  const practicedCount = progress.filter((entry) =>
    hiraganaVowels.some((vowel) => vowel.id === entry.itemId),
  ).length;

  useEffect(() => {
    if (complete) {
      document.getElementById("practice-complete-title")?.focus();
    }
  }, [complete]);

  async function submitAnswer(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item || !answer.trim() || feedback || saving) return;

    const correct = checkKanaAnswer(item, answer);
    setSaving(true);
    try {
      const saved = await saveKanaAnswer(
        item,
        correct,
        new Date().toISOString(),
      );
      setProgress((previous) => [
        ...previous.filter((entry) => entry.itemId !== saved.itemId),
        saved,
      ]);
      setStorageError("");
    } catch {
      setStorageError(
        "Your answer could not be saved. You can still finish this session.",
      );
    } finally {
      setCorrectCount((count) => count + Number(correct));
      setFeedback({ correct, expected: item.romanization });
      setSaving(false);
    }
  }

  function continueSession() {
    setIndex((current) => current + 1);
    setAnswer("");
    setFeedback(null);
    if (index < hiraganaVowels.length - 1) {
      window.requestAnimationFrame(() =>
        document.getElementById("kana-answer")?.focus(),
      );
    }
  }

  function restartSession() {
    setIndex(0);
    setAnswer("");
    setFeedback(null);
    setCorrectCount(0);
    window.requestAnimationFrame(() =>
      document.getElementById("kana-answer")?.focus(),
    );
  }

  const search = normalizePracticeSearch({});
  const sessionProgress = Math.round(
    ((index + Number(feedback !== null)) / hiraganaVowels.length) * 100,
  );

  return (
    <section
      aria-label={loading ? "First vowels" : undefined}
      aria-labelledby={
        loading
          ? undefined
          : complete
            ? "practice-complete-title"
            : "kana-title"
      }
      className="practice-session"
    >
      <PracticeHeader
        progress={sessionProgress}
        step={`${String(complete ? hiraganaVowels.length : index + 1)}/${String(hiraganaVowels.length)}`}
        search={search}
      />
      {loading ? (
        <div className="practice-session__body">
          <p role="status">Loading your progress…</p>
        </div>
      ) : complete ? (
        <PracticeResults
          score={correctCount}
          total={hiraganaVowels.length}
          onRestart={restartSession}
          search={search}
          summary={`Progress saved for ${String(practicedCount)} of ${String(hiraganaVowels.length)} vowels.`}
        />
      ) : item ? (
        <>
          <div className="practice-session__body">
            <div className="practice-session__question">
              <Text as="h1" id="kana-title" variant="display">
                Learn the five vowels
              </Text>
              <Text color="secondary">
                Read each character and type its romaji. Your answers are saved
                on this device.
              </Text>
              {storageError && <p role="alert">{storageError}</p>}
              <div className="practice-session__exercise">
                <Surface className="practice-session__prompt" elevation="card">
                  <span className="practice-session__prompt-kana" lang="ja">
                    {item.glyph}
                  </span>
                </Surface>
                <form
                  id="kana-vowels-answer"
                  className="practice-session__typed-answer w-full"
                  onSubmit={(event) => void submitAnswer(event)}
                >
                  <FormField id="kana-answer" label="Romaji answer">
                    <Input
                      autoComplete="off"
                      autoFocus
                      disabled={feedback !== null || saving}
                      inputMode="text"
                      onChange={(event) => {
                        setAnswer(event.target.value);
                      }}
                      required
                      value={answer}
                    />
                  </FormField>
                </form>
              </div>
              <Text color="secondary" variant="label">
                Character {index + 1} of {hiraganaVowels.length} ·{" "}
                {practicedCount} practiced on this device
              </Text>
            </div>
          </div>
          <div className="practice-session__action-slot">
            {feedback ? (
              <PracticeFeedback
                correct={feedback.correct}
                message={
                  feedback.correct
                    ? "Your reading is correct."
                    : `The answer is ${feedback.expected}.`
                }
                finalExercise={index === hiraganaVowels.length - 1}
                onContinue={continueSession}
              />
            ) : (
              <footer className="practice-session__actions">
                <div className="practice-session__actions-inner">
                  <Text color="secondary">Five Hiragana vowels</Text>
                  <Button
                    disabled={!answer.trim()}
                    loading={saving}
                    loadingAnnouncement="Saving your answer"
                    form="kana-vowels-answer"
                    type="submit"
                  >
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
