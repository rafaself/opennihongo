import type { FlashcardExercise } from "@opennihongo/core";
import type { Ref } from "react";

export function CardStackFace({
  card,
  revealed,
  answerRef,
  announce = true,
}: {
  card: FlashcardExercise;
  revealed: boolean;
  answerRef?: Ref<HTMLDivElement>;
  announce?: boolean;
}) {
  return revealed ? (
    <div
      className="card-stack__answer"
      role={announce ? "status" : undefined}
      tabIndex={announce ? -1 : undefined}
      ref={answerRef}
    >
      <p className="card-stack__context" lang={card.front.lang}>
        {card.front.text}
      </p>
      <p className="card-stack__face" lang={card.back.lang}>
        {card.back.text}
      </p>
      {card.back.supportingText && (
        <p className="card-stack__supporting">{card.back.supportingText}</p>
      )}
    </div>
  ) : (
    <div className="card-stack__front">
      <p className="card-stack__face" lang={card.front.lang}>
        {card.front.text}
      </p>
      {card.front.supportingText && (
        <p className="card-stack__supporting">{card.front.supportingText}</p>
      )}
      <p className="card-stack__hint">What comes to mind?</p>
    </div>
  );
}
