import type { ExerciseBase } from "../base";

export type TypedAnswerExercise = Readonly<
  ExerciseBase<"typed-answer"> & {
    prompt: Readonly<{ text: string }>;
    acceptedAnswers: readonly string[];
  }
>;
