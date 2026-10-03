import type { KanaPracticeDifficulty } from "@opennihongo/content";
import { KanaReadingHint } from "../renderers/KanaReadingHint";
import { Button, Text } from "@opennihongo/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ExerciseResult } from "@opennihongo/core";
import type { PracticeSearch } from "../../../app/practiceSearch";
import { KeyboardShortcut } from "../../../components/keyboard/KeyboardShortcut";
import { PracticeHeader } from "../layout/PracticeHeader";
import { PracticeResults } from "../results/PracticeResults";
import { PronunciationButton } from "../audio/PronunciationButton";
import { useExerciseAudio } from "../audio/useExerciseAudio";
import { getPracticeAudioAsset } from "../session/practiceAudio";
import {
  createSingleAnswerResult,
  scoreExerciseResults,
} from "../session/exerciseResults";
import type { CardStackItem } from "./cardStackContent";
import { createCardStackSession } from "./createCardStackSession";
import { useCardStackKeyboard } from "./useCardStackKeyboard";
import { CardStackFace } from "./CardStackFace";
import { cardDiscardDurationMs, useCardDiscard } from "./useCardDiscard";
import "../practice.css";
import "./cardStack.css";

export function CardStackView({
  items,
  collectionId,
  title,
  search,
  difficulty,
  length,
  onChangeOptions,
}: {
  items: readonly CardStackItem[];
  collectionId: string;
  title: string;
  search: PracticeSearch;
  difficulty?: KanaPracticeDifficulty;
  length?: number;
  onChangeOptions?: () => void;
}) {
  const [practice, setPractice] = useState(() => ({
    revision: 0,
    session: createCardStackSession(items, collectionId, 0, length),
  }));
  const [hintsUsed, setHintsUsed] = useState(0);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const { discard, startDiscard, resetDiscard } = useCardDiscard();
  const ratedId = useRef<string | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const cards = practice.session.exercises;
  const card = cards[index];
  const complete = index >= cards.length;
  const showResults = complete && !discard;
  const source = items.find(({ id }) => id === card?.sourceItemIds[0]);
  const audioIds = useMemo(
    () =>
      source?.pronunciationText !== undefined &&
      getPracticeAudioAsset(source.id) !== undefined
        ? [source.id]
        : [],
    [source],
  );
  const audio = useExerciseAudio(audioIds, card?.id ?? "complete", !complete);

  useEffect(() => {
    if (showResults)
      document.getElementById("practice-complete-title")?.focus();
    else if (!complete && audio.isReady) {
      if (revealed) answerRef.current?.focus();
      else document.getElementById("card-stack-reveal")?.focus();
    }
  }, [card?.id, complete, showResults, audio.isReady, revealed]);

  function reveal() {
    if (card && audio.isReady) setRevealed(true);
  }
  function advance(remembered: boolean, attempts: number) {
    if (!card || !audio.isReady || ratedId.current === card.id) return;
    ratedId.current = card.id;
    startDiscard(
      card,
      revealed,
      attempts === 0 ? "down" : remembered ? "right" : "left",
    );
    setResults((current) => [
      ...current,
      createSingleAnswerResult(card, remembered, attempts),
    ]);
    setRevealed(false);
    setIndex((current) => current + 1);
  }
  function rate(remembered: boolean) {
    if (revealed) advance(remembered, 1);
  }
  function restart() {
    resetDiscard();
    const revision = practice.revision + 1;
    setPractice({
      revision,
      session: createCardStackSession(items, collectionId, revision, length),
    });
    ratedId.current = null;
    setIndex(0);
    setResults([]);
    setHintsUsed(0);
    setRevealed(false);
  }
  useCardStackKeyboard({
    active: !complete && audio.isReady,
    revealed,
    onReveal: reveal,
    onRate: rate,
  });
  const skipped = results.filter(({ attempts }) => attempts === 0).length;
  const needsPractice = results.filter(
    ({ attempts, outcome }) => attempts > 0 && outcome === "incorrect",
  ).length;

  return (
    <section
      className="practice-session card-stack"
      aria-labelledby={
        showResults ? "practice-complete-title" : "card-stack-title"
      }
    >
      <PracticeHeader
        progress={Math.round((index / cards.length) * 100)}
        step={`${String(complete ? cards.length : index + 1)}/${String(cards.length)}`}
        search={search}
      />
      {showResults ? (
        <PracticeResults
          score={scoreExerciseResults(results)}
          total={cards.length}
          onRestart={restart}
          onChangeOptions={onChangeOptions}
          hintsUsed={difficulty === "easy" ? hintsUsed : undefined}
          search={search}
          scoreLabel="Remembered"
          accuracyLabel="Recall"
          summary={`Your self-review: ${String(needsPractice)} marked for practice · ${String(skipped)} skipped.`}
        />
      ) : (
        <>
          <div className="practice-session__body">
            <div className="card-stack__content">
              <header className="card-stack__heading">
                <Text as="h1" id="card-stack-title" variant="display">
                  {title}
                </Text>
                <Text color="secondary">
                  Recall the answer, reveal it, then rate how you did.
                </Text>
              </header>
              {difficulty === "easy" && card && !revealed && (
                <KanaReadingHint
                  key={card.id}
                  reading={card.back.text}
                  disabled={!audio.isReady}
                  onRequested={() => {
                    setHintsUsed((count) => count + 1);
                  }}
                />
              )}
              <div
                className="card-stack__heap"
                data-remaining={cards.length - index}
              >
                {cards.length - index > 2 && (
                  <span
                    aria-hidden="true"
                    className="card-stack__layer card-stack__layer--back"
                  />
                )}
                {cards.length - index > 1 && (
                  <span
                    aria-hidden="true"
                    className="card-stack__layer card-stack__layer--middle"
                  />
                )}
                {!audio.isReady ? (
                  <div
                    role="status"
                    className="practice-session__audio-loading"
                  >
                    Preparing pronunciation audio…
                  </div>
                ) : (
                  card && (
                    <article
                      className="card-stack__card"
                      key={card.id}
                      data-revealed={revealed}
                      data-entering={index > 0}
                    >
                      {source?.pronunciationText !== undefined &&
                        (difficulty !== "hard" || revealed) && (
                          <PronunciationButton
                            audioId={audioIds.find((id) =>
                              audio.loadedAudioIds.has(id),
                            )}
                            text={card.front.text}
                            speechText={source.pronunciationText}
                            onPlay={audio.playAudio}
                          />
                        )}
                      <CardStackFace
                        card={card}
                        revealed={revealed}
                        answerRef={answerRef}
                      />
                    </article>
                  )
                )}
                {discard && (
                  <article
                    className="card-stack__card card-stack__discard"
                    key={`discard:${discard.card.id}`}
                    aria-hidden="true"
                    inert
                    data-revealed={discard.revealed}
                    data-direction={discard.direction}
                    style={{
                      animationDuration: `${String(cardDiscardDurationMs)}ms`,
                    }}
                  >
                    <CardStackFace
                      card={discard.card}
                      revealed={discard.revealed}
                      announce={false}
                    />
                  </article>
                )}
              </div>
            </div>
          </div>
          <div className="practice-session__action-slot">
            <footer className="practice-session__actions">
              {!complete && (
                <div className="practice-session__actions-inner card-stack__actions">
                  <Button
                    onClick={() => {
                      advance(false, 0);
                    }}
                    disabled={!audio.isReady}
                    variant="secondary"
                  >
                    Skip
                  </Button>
                  {revealed ? (
                    <div className="card-stack__ratings">
                      <Button
                        onClick={() => {
                          rate(false);
                        }}
                        variant="secondary"
                      >
                        <KeyboardShortcut>1</KeyboardShortcut>Need practice
                      </Button>
                      <Button
                        onClick={() => {
                          rate(true);
                        }}
                      >
                        <KeyboardShortcut>2</KeyboardShortcut>Got it
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={reveal}
                      id="card-stack-reveal"
                      disabled={!audio.isReady}
                    >
                      Reveal answer
                    </Button>
                  )}
                </div>
              )}
            </footer>
          </div>
        </>
      )}
    </section>
  );
}
