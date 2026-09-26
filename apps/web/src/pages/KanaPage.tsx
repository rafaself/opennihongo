import { checkKanaAnswer, hiraganaVowels } from "@opennihongo/core";
import type { KanaProgress } from "@opennihongo/core";
import { loadKanaProgress, saveKanaAnswer } from "@opennihongo/persistence";
import {
  Button,
  FormField,
  Input,
  Stack,
  Surface,
  Text,
} from "@opennihongo/ui";
import { useEffect, useState, type SyntheticEvent } from "react";

type Feedback = { correct: boolean; expected: string };

export function KanaPage() {
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
      setFeedback({ correct, expected: item.answer });
      setSaving(false);
    }
  }

  function continueSession() {
    setIndex((current) => current + 1);
    setAnswer("");
    setFeedback(null);
    window.requestAnimationFrame(() =>
      document.getElementById("kana-answer")?.focus(),
    );
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

  return (
    <section
      aria-labelledby="kana-title"
      className="mx-auto grid w-full max-w-2xl gap-6 py-8 md:py-12"
    >
      <Stack gap="2">
        <Text color="secondary" variant="label">
          Kana · Hiragana
        </Text>
        <Text as="h1" id="kana-title" variant="display">
          Learn the five vowels
        </Text>
        <Text color="secondary">
          Read each character and type its romaji. Your answers are saved on
          this device.
        </Text>
      </Stack>

      {storageError && (
        <p
          role="alert"
          className="rounded-lg border border-border bg-surface p-4 text-ink"
        >
          {storageError}
        </p>
      )}

      <Surface className="p-6 md:p-8" elevation="card">
        {loading ? (
          <p role="status">Loading your progress…</p>
        ) : complete ? (
          <Stack gap="6">
            <Stack gap="2">
              <Text as="h2" variant="heading">
                Session complete
              </Text>
              <Text>
                {correctCount} of {hiraganaVowels.length} correct.
              </Text>
              <Text color="secondary">
                Progress saved for {practicedCount} of {hiraganaVowels.length}{" "}
                vowels.
              </Text>
            </Stack>
            <Button onClick={restartSession}>Practice again</Button>
          </Stack>
        ) : item ? (
          <Stack gap="6">
            <Text color="secondary" variant="label">
              Character {index + 1} of {hiraganaVowels.length} ·{" "}
              {practicedCount} practiced on this device
            </Text>
            <p className="text-center text-8xl leading-tight text-ink md:text-9xl">
              {item.glyph}
            </p>
            <form
              className="grid gap-5"
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
              {feedback ? (
                <>
                  <p
                    aria-live="polite"
                    role="status"
                    className="font-semibold text-ink"
                  >
                    {feedback.correct
                      ? "Correct!"
                      : `The answer is ${feedback.expected}.`}
                  </p>
                  <Button onClick={continueSession}>
                    {index === hiraganaVowels.length - 1
                      ? "See results"
                      : "Next kana"}
                  </Button>
                </>
              ) : (
                <Button
                  disabled={!answer.trim()}
                  loading={saving}
                  loadingAnnouncement="Saving your answer"
                  type="submit"
                >
                  Check answer
                </Button>
              )}
            </form>
          </Stack>
        ) : null}
      </Surface>
    </section>
  );
}
