import type { MatchingPairId } from "@opennihongo/core";
import { Button, Text } from "@opennihongo/ui";
import { useEffect, useState } from "react";
import { MatchingBoard } from "../../../components/matching/MatchingBoard";
import { PracticeFeedback } from "../feedback/PracticeFeedback";
import { PracticeHeader } from "../layout/PracticeHeader";
import { PracticeResults } from "../results/PracticeResults";
import {
  createWordsPracticeSession,
  type WordsPracticeSession,
} from "./session/createWordsPracticeSession";
import "../practice.css";
import "./words-practice.css";

type Phase = "intro" | "matching" | "round-feedback" | "results";

export function WordsPracticeView() {
  const [session, setSession] = useState<WordsPracticeSession>(() =>
    createWordsPracticeSession(0),
  );
  const [revision, setRevision] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState<0 | 1>(0);
  const [matchedPairIds, setMatchedPairIds] = useState<MatchingPairId[]>([]);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const round = session.rounds[roundIndex];
  const completedPairs =
    roundIndex * round.config.pairCount + matchedPairIds.length;
  const progress = Math.round((completedPairs / 10) * 100);

  useEffect(() => {
    if (phase === "results") {
      document.getElementById("practice-complete-title")?.focus();
    } else if (phase !== "round-feedback") {
      document.getElementById("words-practice-title")?.focus();
    }
  }, [phase, roundIndex]);

  function recordPairAttempt(pairId: MatchingPairId | null) {
    if (pairId === null) {
      setWrongAttempts((count) => count + 1);
      return;
    }

    const nextMatches = [...matchedPairIds, pairId];
    setMatchedPairIds(nextMatches);
    if (nextMatches.length === round.config.pairCount) {
      setPhase("round-feedback");
    }
  }

  function replay() {
    const nextRevision = revision + 1;
    setRevision(nextRevision);
    setSession(createWordsPracticeSession(nextRevision));
    setRoundIndex(0);
    setMatchedPairIds([]);
    setWrongAttempts(0);
    setPhase("intro");
  }

  const accuracy = Math.round((10 / (10 + wrongAttempts)) * 100);

  return (
    <section
      aria-label="Word review lesson"
      className="practice-session words-practice"
    >
      <PracticeHeader
        progress={progress}
        step={`${String(completedPairs)}/10`}
      />
      {phase === "results" ? (
        <PracticeResults
          score={10}
          total={10}
          accuracy={accuracy}
          onRestart={replay}
        />
      ) : (
        <>
          <div className="practice-session__body">
            <div className="words-practice__content">
              <p className="words-practice__eyebrow">
                {phase === "intro"
                  ? "Word review · 2 rounds"
                  : `Round ${String(roundIndex + 1)} of 2 · ${roundIndex === 0 ? "All words" : "Rolling review"}`}
              </p>
              <Text
                as="h1"
                id="words-practice-title"
                tabIndex={-1}
                variant="display"
              >
                {phase === "intro"
                  ? "Review five beginner words"
                  : phase === "round-feedback"
                    ? "All five pairs matched"
                    : roundIndex === 0
                      ? "Match each word to its meaning"
                      : "Keep matching as new words appear"}
              </Text>
              <p>
                {phase === "intro"
                  ? "Match each Japanese word with its English meaning. You’ll match all five words twice."
                  : phase === "round-feedback"
                    ? roundIndex === 0
                      ? "Continue to a rolling review. New words appear as you match."
                      : "You matched all ten pairs in this lesson."
                    : "Select one English meaning and one Japanese word."}
              </p>
              {phase === "matching" && (
                <MatchingBoard
                  announceFeedback
                  exercise={round}
                  leftLabel="English meanings"
                  matchedPairIds={matchedPairIds}
                  onPairAttempt={recordPairAttempt}
                  rightLabel="Japanese words"
                  rolling={roundIndex === 1}
                />
              )}
            </div>
          </div>
          <div className="practice-session__action-slot">
            {phase === "round-feedback" ? (
              <PracticeFeedback
                correct
                finalExercise={roundIndex === 1}
                message="All pairs matched."
                onContinue={() => {
                  if (roundIndex === 0) {
                    setRoundIndex(1);
                    setMatchedPairIds([]);
                    setPhase("matching");
                  } else {
                    setPhase("results");
                  }
                }}
              />
            ) : (
              <footer className="practice-session__actions">
                <div className="practice-session__actions-inner">
                  <Text aria-live="polite" color="secondary">
                    {phase === "intro"
                      ? "Ten matches · about one minute"
                      : `${String(completedPairs)} of 10 pairs completed`}
                  </Text>
                  {phase === "intro" && (
                    <Button
                      onClick={() => {
                        setPhase("matching");
                      }}
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </footer>
            )}
          </div>
        </>
      )}
    </section>
  );
}
