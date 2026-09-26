import type { KanaTypedAnswerExercise } from "@opennihongo/core";
import { Input, Surface, Text } from "@opennihongo/ui";

type TypedAnswerExerciseProps = {
  exercise: KanaTypedAnswerExercise;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export function TypedAnswerExercise({
  exercise,
  value,
  disabled,
  onChange,
  onSubmit,
}: TypedAnswerExerciseProps) {
  return (
    <div className="practice-session__exercise">
      <Surface
        className="practice-session__prompt practice-session__prompt--typed"
        elevation="card"
      >
        <Text className="practice-session__prompt-kana practice-session__prompt-kana--compact">
          {exercise.prompt.text}
        </Text>
      </Surface>
      <Input
        aria-label={`Type the romaji reading for ${exercise.prompt.text}`}
        autoFocus
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
