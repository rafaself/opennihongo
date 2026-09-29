import type {
  KanaAudioId,
  TypedAnswerExercise as TypedAnswerExerciseModel,
} from "@opennihongo/core";
import { Input, Surface, Text } from "@opennihongo/ui";
import { PronunciationButton } from "../PronunciationButton";

type TypedAnswerExerciseProps = Readonly<{
  exercise: TypedAnswerExerciseModel;
  value: string;
  disabled: boolean;
  autoFocus: boolean;
  audioId: KanaAudioId | undefined;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onPlayAudio: (audioId: KanaAudioId) => void;
}>;

export function TypedAnswerExercise({
  exercise,
  value,
  disabled,
  autoFocus,
  audioId,
  onChange,
  onSubmit,
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
        <PronunciationButton
          audioId={audioId}
          onPlay={onPlayAudio}
          text={exercise.prompt.text}
        />
      </Surface>
      <Input
        aria-label={`Type the romaji reading for ${exercise.prompt.text}`}
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
  );
}
