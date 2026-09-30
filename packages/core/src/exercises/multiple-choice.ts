import type { ExerciseBase } from "./base";

export type MultipleChoiceOption = Readonly<{ id: string; text: string }>;

export type MultipleChoiceExercise = Readonly<
  ExerciseBase<"multiple-choice"> & {
    prompt: Readonly<{ text: string }>;
    options: readonly MultipleChoiceOption[];
    correctOptionId: string;
  }
>;
