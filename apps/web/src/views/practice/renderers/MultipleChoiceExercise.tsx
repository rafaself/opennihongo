import type {
  LearningItemId,
  MultipleChoiceExercise as Exercise,
} from "@opennihongo/core";
import { Button, Text } from "@opennihongo/ui";
import { useEffect, useRef } from "react";
import { KeyboardShortcut } from "../../../components/keyboard/KeyboardShortcut";
import { PronunciationButton } from "../audio/PronunciationButton";
import "./multipleChoice.css";

type Props = {
  exercise: Exercise;
  selectedOptionId: string | null;
  disabled: boolean;
  onSelect: (id: string) => void;
  onPlayAudio: (id: LearningItemId) => void;
  audioId?: LearningItemId | undefined;
  speechText: string;
  audioAvailable: boolean;
};

export function MultipleChoiceExercise({
  exercise,
  selectedOptionId,
  disabled,
  onSelect,
  audioId,
  speechText,
  onPlayAudio,
  audioAvailable,
}: Props) {
  const optionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    optionsRef.current?.querySelector("button")?.focus();
  }, [exercise.id]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        disabled ||
        event.repeat ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.isComposing ||
        event.defaultPrevented
      )
        return;
      const target = event.target;
      if (
        !(target instanceof HTMLElement) ||
        target.isContentEditable ||
        target.closest(
          "input, textarea, select, a[href], [contenteditable='true']",
        )
      )
        return;
      if (target.closest("button") && !optionsRef.current?.contains(target))
        return;
      const index = ["1", "2", "3", "4", "5", "6"].indexOf(event.key);
      const option = exercise.options[index];
      if (option) {
        event.preventDefault();
        optionsRef.current?.querySelectorAll("button")[index]?.focus();
        onSelect(option.id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [disabled, exercise, onSelect]);

  return (
    <div className="practice-session__question kana-quiz">
      <Text as="h1" id="practice-title" variant="display">
        Choose the correct answer
      </Text>
      <div className="practice-session__prompt kana-quiz__prompt">
        <span className="practice-session__prompt-kana">
          {exercise.prompt.text}
        </span>
        {audioAvailable && (
          <PronunciationButton
            audioId={audioId}
            text={exercise.prompt.text}
            speechText={speechText}
            onPlay={onPlayAudio}
          />
        )}
      </div>
      <div
        aria-label="Answer options"
        className="kana-quiz__options"
        ref={optionsRef}
        role="group"
        onKeyDown={(event) => {
          const target = event.target;
          if (
            event.key === "Enter" &&
            target instanceof HTMLElement &&
            target.closest("button")?.getAttribute("aria-pressed") === "false"
          ) {
            event.stopPropagation();
            return;
          }
          const offsets: Record<string, number> = {
            ArrowLeft: -1,
            ArrowRight: 1,
            ArrowUp: -2,
            ArrowDown: 2,
          };
          const offset = offsets[event.key];
          if (
            offset === undefined ||
            disabled ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
          )
            return;
          const buttons = [...event.currentTarget.querySelectorAll("button")];
          const index = buttons.findIndex((button) => button === event.target);
          event.preventDefault();
          buttons[(index + offset + buttons.length) % buttons.length]?.focus();
        }}
      >
        {exercise.options.map((option, index) => (
          <Button
            key={option.id}
            aria-keyshortcuts={String(index + 1)}
            aria-label={option.text}
            aria-pressed={selectedOptionId === option.id}
            className="kana-quiz__option"
            variant="secondary"
            disabled={disabled}
            onClick={() => {
              onSelect(option.id);
            }}
            data-result={
              disabled
                ? option.id === exercise.correctOptionId
                  ? "correct"
                  : option.id === selectedOptionId
                    ? "incorrect"
                    : undefined
                : undefined
            }
          >
            <KeyboardShortcut className="kana-quiz__shortcut">
              {index + 1}
            </KeyboardShortcut>
            <span>{option.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
