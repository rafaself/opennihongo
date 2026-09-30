import { Link } from "@tanstack/react-router";
import type { MatchingPairId } from "@opennihongo/core";
import { Button } from "@opennihongo/ui";
import { useEffect, useRef, useState } from "react";
import { MatchingBoard } from "../../components/matching/MatchingBoard";
import {
  createWordsPracticeSession,
  type WordsPracticeSession,
} from "./session/createWordsPracticeSession";
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const round = session.rounds[roundIndex];
  const completedPairs =
    roundIndex * round.config.pairCount + matchedPairIds.length;
  const progress = Math.round((completedPairs / 10) * 100);

  useEffect(() => {
    titleRef.current?.focus();
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

  function beginRound() {
    setPhase("matching");
  }

  function continueToRollingRound() {
    setRoundIndex(1);
    setMatchedPairIds([]);
    setPhase("matching");
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
    <section aria-label="Word review lesson" className="words-practice">
      <header className="words-practice__header">
        <Link
          aria-label="Leave word practice"
          className="words-practice__exit"
          to="/practice"
        >
          <span aria-hidden="true">×</span>
          <span>Practice</span>
        </Link>
        <div
          aria-label="Lesson progress"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className="words-practice__progress"
          role="progressbar"
        >
          <span
            className="words-practice__progress-fill"
            style={{ width: `${String(progress)}%` }}
          />
        </div>
        <span className="words-practice__progress-label">{progress}%</span>
      </header>

      <div className="words-practice__body">
        {phase === "intro" && (
          <div className="words-practice__content words-practice__intro">
            <p className="words-practice__eyebrow">Word review · 2 rounds</p>
            <h1 id="words-practice-title" ref={titleRef} tabIndex={-1}>
              Review five beginner words
            </h1>
            <p>
              Match each Japanese word with its English meaning. You’ll match
              all five words twice.
            </p>
            <Button onClick={beginRound}>Continue</Button>
          </div>
        )}

        {phase === "matching" && (
          <div className="words-practice__content words-practice__question">
            <p className="words-practice__eyebrow">
              Round {roundIndex + 1} of 2 ·{" "}
              {roundIndex === 0 ? "All words" : "Rolling review"}
            </p>
            <h1 id="words-practice-title" ref={titleRef} tabIndex={-1}>
              {roundIndex === 0
                ? "Match each word to its meaning"
                : "Keep matching as new words appear"}
            </h1>
            <p className="words-practice__instruction">
              Select one English meaning and one Japanese word.
            </p>
            <MatchingBoard
              announceFeedback
              exercise={round}
              leftLabel="English meanings"
              matchedPairIds={matchedPairIds}
              onPairAttempt={recordPairAttempt}
              rightLabel="Japanese words"
              rolling={roundIndex === 1}
            />
          </div>
        )}

        {phase === "round-feedback" && (
          <div className="words-practice__content words-practice__round-complete">
            <p aria-hidden="true" className="words-practice__success-mark">
              ✓
            </p>
            <p className="words-practice__eyebrow">
              Round {roundIndex + 1} of 2 complete
            </p>
            <h1 id="words-practice-title" ref={titleRef} tabIndex={-1}>
              All five pairs matched
            </h1>
            <p>
              {roundIndex === 0
                ? "Continue to a rolling review. New words appear as you match."
                : "You matched all ten pairs in this lesson."}
            </p>
            <Button
              onClick={() => {
                if (roundIndex === 0) {
                  continueToRollingRound();
                } else {
                  setPhase("results");
                }
              }}
            >
              {roundIndex === 0 ? "Continue" : "See results"}
            </Button>
          </div>
        )}

        {phase === "results" && (
          <div className="words-practice__content words-practice__results">
            <p aria-hidden="true" className="words-practice__success-mark">
              ✓
            </p>
            <p className="words-practice__eyebrow">Word review complete</p>
            <h1 id="words-practice-title" ref={titleRef} tabIndex={-1}>
              Nice work!
            </h1>
            <dl
              aria-label="Word review results"
              className="words-practice__stats"
            >
              <div>
                <dt>Completed pairs</dt>
                <dd>10 / 10</dd>
              </div>
              <div>
                <dt>Accuracy</dt>
                <dd>{accuracy}%</dd>
              </div>
            </dl>
            <div className="words-practice__result-actions">
              <Button onClick={replay}>Replay</Button>
              <Link
                className="ns-button"
                data-variant="secondary"
                to="/practice"
              >
                Back to Practice
              </Link>
            </div>
          </div>
        )}
      </div>
      <footer aria-live="polite" className="words-practice__footer">
        <span>
          {phase === "intro"
            ? "Ten matches · about one minute"
            : `${String(completedPairs)} of 10 pairs completed`}
        </span>
      </footer>
    </section>
  );
}
