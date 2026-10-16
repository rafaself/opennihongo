import { KanaReadingHint } from "./KanaReadingHint";
import type {
  LearningItemId,
  TypedAnswerExercise as TypedAnswerExerciseModel,
} from "@opennihongo/core";
import { Input, Surface, Text } from "@opennihongo/ui";
import { PronunciationButton } from "../audio/PronunciationButton";

type TypedAnswerExerciseProps = Readonly<{
  inputLabel?: string | undefined;
  supportingText?: string | undefined;
  exercise: TypedAnswerExerciseModel;
  speechText: string;
  value: string;
  disabled: boolean;
  autoFocus: boolean;
  audioId: LearningItemId | undefined;
  audioAvailable: boolean;
  hintAvailable: boolean;
  onHintRequested: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onAudioRequested?: (() => void) | undefined;
  onPlayAudio: (audioId: LearningItemId) => void;
}>;

export function TypedAnswerExercise({
  inputLabel,
  supportingText,
  exercise,
  speechText,
  value,
  disabled,
  autoFocus,
  audioId,
  audioAvailable,
  hintAvailable,
  onHintRequested,
  onChange,
  onSubmit,
  onAudioRequested,
  onPlayAudio,
}: TypedAnswerExerciseProps) {
  return (
    <div className="practice-session__exercise">
      <Surface
        className="practice-session__prompt practice-session__prompt--typed"
        elevation="card"
        variant="highlighted"
      >
        <Text className="practice-session__prompt-kana practice-session__prompt-kana--compact">
          {exercise.prompt.text}
        </Text>
        {supportingText && <Text color="secondary">{supportingText}</Text>}
        {audioAvailable && (
          <PronunciationButton
            audioId={audioId}
            onRequested={onAudioRequested}
            onPlay={onPlayAudio}
            speechText={speechText}
            text={exercise.prompt.text}
          />
        )}
      </Surface>
      <div className="practice-session__answer-field">
        {hintAvailable && (
          <KanaReadingHint
            key={exercise.id}
            reading={exercise.acceptedAnswers[0] ?? ""}
            disabled={disabled}
            onRequested={onHintRequested}
          />
        )}
        <Input
          aria-label={
            inputLabel ?? `Type the romaji reading for ${exercise.prompt.text}`
          }
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoComplete="off"
          className="practice-session__typed-answer"
          disabled={disabled}
          inputMode="text"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.nativeEvent.isComposing) {
              event.preventDefault();
              onSubmit();
            }
          }}
          onChange={(event) => {
            onChange(event.currentTarget.value);
          }}
          placeholder="Type here"
          spellCheck={false}
          value={value}
        />
      </div>
    </div>
  );
}
