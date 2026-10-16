import { ReadingFeedback } from "../../../features/practice-review/ReadingFeedback";
import { ReadingResults } from "../../../features/practice-review/ReadingResults";
import { Button } from "@opennihongo/ui";
import {
  countExerciseItems,
  scoreExerciseResults,
  type Exercise,
} from "@opennihongo/core";
import type { KanaPracticeDifficulty } from "@opennihongo/content";
import type { PracticeSearch } from "../../../app/practiceSearch";
import { PracticeHeader } from "../layout/PracticeHeader";
import { PracticeFeedback } from "../feedback/PracticeFeedback";
import {
  PracticeExerciseContent,
  type ExercisePresentation,
} from "../renderers/PracticeExerciseContent";
import { PracticeResults } from "../results/PracticeResults";
import { LearningSaveStatus } from "./history/LearningSaveStatus";
import {
  usePracticeSession,
  type GradedPracticeSession,
} from "./usePracticeSession";
export type { GradedPracticeSession } from "./usePracticeSession";
import "../practice.css";
export function ExercisePracticeView({
  className,
  reading,
  difficulty,
  fast,
  search,
  createSession,
  normalizeAnswer,
  scriptLabel,
  presentation,
  onChangeOptions,
}: {
  className?: string;
  reading: boolean;
  difficulty: KanaPracticeDifficulty;
  fast: boolean;
  search: PracticeSearch;
  createSession: (revision: number, sessionId: string) => GradedPracticeSession;
  normalizeAnswer: (value: string) => string;
  scriptLabel: string;
  presentation?: (
    exercise: Exclude<Exercise, { type: "flashcard" }>,
  ) => ExercisePresentation;
  onChangeOptions?: (() => void) | undefined;
}) {
  const {
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
  } = usePracticeSession({ createSession, normalizeAnswer, fast });

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
      className={`practice-session${reading ? " practice-session--reading" : ""}${className ? ` ${className}` : ""}`}
    >
      <PracticeHeader
        progress={progress}
        search={search}
        step={`${String(complete ? exercises.length : index + 1)}/${String(exercises.length)}`}
      />
      <LearningSaveStatus recorder={recorder} />

      {complete ? (
        <PracticeResults
          score={scoreExerciseResults(results)}
          total={countExerciseItems(exercises)}
          hintsUsed={difficulty === "easy" && reading ? hintsUsed : undefined}
          onRestart={() => {
            restartPractice();
          }}
          onChangeOptions={onChangeOptions}
          search={search}
        >
          {reading && (
            <ReadingResults
              key={practice.session.id}
              completions={completions}
              onRetry={restartPractice}
              savedReviewAvailable={
                !recorder.saving && recorder.failedCount === 0
              }
            />
          )}
        </PracticeResults>
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
                requestHelp("hint");
              }}
              onAudioRequested={() => {
                requestHelp("audio");
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
              scriptLabel={scriptLabel}
              presentation={presentation?.(exercise)}
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
          <div
            className={`practice-session__action-slot${reading && feedback ? " practice-session__action-slot--reading-feedback" : ""}`}
          >
            {feedback ? (
              <PracticeFeedback
                automatic={fast}
                correct={feedback.result.outcome === "correct"}
                finalExercise={index === exercises.length - 1}
                message={feedback.message}
                onContinue={continuePractice}
              >
                {reading && exercise.type === "typed-answer" && (
                  <ReadingFeedback exercise={exercise} />
                )}
              </PracticeFeedback>
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
