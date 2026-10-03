import { normalizePracticeSearch } from "../../app/practiceSearch";
import { Button, FormField, Input, Surface, Text } from "@opennihongo/ui";
import { useKanaVowelLesson } from "../../views/practice/interaction/useKanaVowelLesson";
import { LearningSaveStatus } from "../../views/practice/interaction/history/LearningSaveStatus";
import { PracticeFeedback } from "../../views/practice/feedback/PracticeFeedback";
import { PracticeHeader } from "../../views/practice/layout/PracticeHeader";
import { PracticeResults } from "../../views/practice/results/PracticeResults";
import "../../views/practice/practice.css";

export function KanaVowelsPage() {
  const {
    loading,
    answer,
    setAnswer,
    saving,
    storageError,
    recorder,
    exercise,
    feedback,
    complete,
    index,
    total,
    score,
    practicedCount,
    submitAnswer,
    continueSession,
    restartSession,
  } = useKanaVowelLesson();

  const search = normalizePracticeSearch({});
  const sessionProgress = Math.round(
    ((index + Number(feedback !== undefined)) / total) * 100,
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
        step={`${String(complete ? total : index + 1)}/${String(total)}`}
        search={search}
      />
      <LearningSaveStatus recorder={recorder} />
      {storageError && <p role="alert">{storageError}</p>}
      {loading ? (
        <div className="practice-session__body">
          <p role="status">Loading your progress…</p>
        </div>
      ) : complete ? (
        <PracticeResults
          score={score}
          total={total}
          onRestart={restartSession}
          search={search}
          summary={
            practicedCount === undefined
              ? "Local progress is unavailable."
              : `Progress saved for ${String(practicedCount)} of ${String(total)} vowels.`
          }
        />
      ) : exercise?.type === "typed-answer" ? (
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
              <div className="practice-session__exercise">
                <Surface className="practice-session__prompt" elevation="card">
                  <span className="practice-session__prompt-kana" lang="ja">
                    {exercise.prompt.text}
                  </span>
                </Surface>
                <form
                  id="kana-vowels-answer"
                  className="practice-session__typed-answer w-full"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitAnswer();
                  }}
                >
                  <FormField id="kana-answer" label="Romaji answer">
                    <Input
                      autoComplete="off"
                      autoFocus
                      disabled={feedback !== undefined || saving}
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
                Character {index + 1} of {total} ·{" "}
                {practicedCount === undefined
                  ? "Progress unavailable on this device"
                  : `${String(practicedCount)} practiced on this device`}
              </Text>
            </div>
          </div>
          <div className="practice-session__action-slot">
            {feedback ? (
              <PracticeFeedback
                correct={feedback.outcome === "correct"}
                message={
                  feedback.outcome === "correct"
                    ? "Your reading is correct."
                    : `The answer is ${exercise.acceptedAnswers[0] ?? ""}.`
                }
                finalExercise={index === total - 1}
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
