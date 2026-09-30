import type { ExerciseId, LearningItemId } from "../ids";
import { shuffle } from "../random/shuffle";
import { ExerciseGenerationError } from "./generation-error";
import type { ExerciseGenerator } from "./generator";
import type {
  MultipleChoiceExercise,
  MultipleChoiceOption,
} from "./multiple-choice";

export type MultipleChoiceSourceItem = Readonly<{
  id: LearningItemId;
  prompt: Readonly<{ text: string }>;
  options: readonly MultipleChoiceOption[];
  correctOptionId: string;
}>;
export type MultipleChoiceExerciseGenerationConfig = Readonly<{
  exerciseId: ExerciseId;
}>;

/** Shuffles four caller-authored options while scoring only the prompt's source. */
export const generateMultipleChoiceExercise: ExerciseGenerator<
  MultipleChoiceSourceItem,
  MultipleChoiceExerciseGenerationConfig,
  MultipleChoiceExercise
> = (items, config, random) => {
  const item = items[0];
  if (item === undefined) {
    throw new ExerciseGenerationError(
      "insufficient-source-items",
      "Expected one multiple-choice source item.",
    );
  }
  if (
    items.length !== 1 ||
    config.exerciseId.trim() === "" ||
    item.id.trim() === "" ||
    item.prompt.text.trim() === ""
  ) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "A quiz requires one source item with stable identities and prompt text.",
    );
  }
  const ids = new Set(item.options.map(({ id }) => id));
  const texts = new Set(item.options.map(({ text }) => text.trim()));
  if (
    item.options.length !== 4 ||
    ids.size !== 4 ||
    texts.size !== 4 ||
    item.options.some(
      ({ id, text }) => id.trim() === "" || text.trim() === "",
    ) ||
    !ids.has(item.correctOptionId)
  ) {
    throw new ExerciseGenerationError(
      "invalid-configuration",
      "A quiz requires four distinct non-empty options and one available correct option.",
    );
  }
  return {
    id: config.exerciseId,
    type: "multiple-choice",
    sourceItemIds: [item.id],
    prompt: { ...item.prompt },
    correctOptionId: item.correctOptionId,
    options: shuffle(
      item.options.map((option) => ({ ...option })),
      random,
    ),
  };
};
