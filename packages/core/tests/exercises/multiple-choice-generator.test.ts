import { expect, it } from "vitest";
import {
  ExerciseGenerationError,
  SeededRandomSource,
  generateMultipleChoiceExercise,
  type MultipleChoiceSourceItem,
} from "../../src";

const item: MultipleChoiceSourceItem = {
  id: "kana.a",
  prompt: { text: "あ" },
  correctOptionId: "a",
  options: ["a", "i", "u", "e"].map((text) => ({ id: text, text })),
};
const firstOption = item.options[0];
if (!firstOption) throw new Error("Expected four options");
const config = { exerciseId: "quiz.a" };
const generate = (items = [item], request = config) =>
  generateMultipleChoiceExercise(
    items,
    request,
    new SeededRandomSource("quiz"),
  );

it("shuffles four options reproducibly, preserving the target and correct choice", () => {
  const exercise = generate();
  expect(exercise).toEqual(generate());
  expect(exercise).toMatchObject({
    type: "multiple-choice",
    id: "quiz.a",
    sourceItemIds: ["kana.a"],
    prompt: item.prompt,
    correctOptionId: "a",
  });
  expect(exercise.options).toHaveLength(4);
  expect(new Set(exercise.options.map(({ id }) => id))).toEqual(
    new Set(["a", "i", "u", "e"]),
  );
  expect(exercise.options).not.toEqual(item.options);
  expect(item.options.map(({ id }) => id)).toEqual(["a", "i", "u", "e"]);
  expect(exercise.prompt).not.toBe(item.prompt);
  expect(exercise.options[0]).not.toBe(
    item.options.find(({ id }) => id === exercise.options[0]?.id),
  );
});

it("rejects missing source content", () => {
  expect(() => generate([])).toThrow(ExerciseGenerationError);
});

it.each([
  { label: "multiple targets", items: [item, item] },
  { label: "empty source identity", items: [{ ...item, id: " " }] },
  { label: "empty prompt", items: [{ ...item, prompt: { text: " " } }] },
  {
    label: "one option",
    items: [{ ...item, options: item.options.slice(0, 1) }],
  },
  {
    label: "seven options",
    items: [
      {
        ...item,
        options: Array.from({ length: 7 }, (_, i) => ({
          id: String(i),
          text: String(i),
        })),
        correctOptionId: "0",
      },
    ],
  },
  {
    label: "duplicate option identity",
    items: [{ ...item, options: [firstOption, ...item.options.slice(0, 3)] }],
  },
  {
    label: "empty option identity",
    items: [
      {
        ...item,
        options: item.options.map((option) => ({ ...option, id: " " })),
      },
    ],
  },
  {
    label: "empty option text",
    items: [
      {
        ...item,
        options: item.options.map((option) => ({ ...option, text: " " })),
      },
    ],
  },
  {
    label: "duplicate option text",
    items: [
      {
        ...item,
        options: item.options.map((option) => ({ ...option, text: "a" })),
      },
    ],
  },
  {
    label: "absent correct option",
    items: [{ ...item, correctOptionId: "other" }],
  },
])("rejects $label", ({ items }) => {
  expect(() => generate(items)).toThrow(ExerciseGenerationError);
});

it("rejects an empty exercise identity", () => {
  expect(() => generate([item], { exerciseId: " " })).toThrow(
    ExerciseGenerationError,
  );
});

it.each([2, 3, 4, 5, 6])(
  "supports %i distinct options while scoring only the target",
  (count) => {
    const options = Array.from({ length: count }, (_, index) => ({
      id: String(index),
      text: `Choice ${String(index)}`,
    }));
    const exercise = generate([{ ...item, options, correctOptionId: "0" }]);
    expect(exercise.options).toHaveLength(count);
    expect(new Set(exercise.options.map(({ id }) => id))).toEqual(
      new Set(options.map(({ id }) => id)),
    );
    expect(exercise.sourceItemIds).toEqual([item.id]);
    expect(exercise.correctOptionId).toBe("0");
  },
);
