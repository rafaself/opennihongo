import { expect, it } from "vitest";
import {
  ExerciseGenerationError,
  generateFlashcardExercise,
  SeededRandomSource,
  type FlashcardSourceItem,
} from "../../src";

const item: FlashcardSourceItem = {
  id: "word.cat",
  front: { text: "ねこ", lang: "ja" },
  back: { text: "cat", supportingText: "neko", lang: "en" },
};
const generate = (items = [item], exerciseId = "card.cat") =>
  generateFlashcardExercise(
    items,
    { exerciseId },
    new SeededRandomSource("cards"),
  );

it("preserves both card faces and source identity without sharing authored objects", () => {
  const card = generate();
  expect(card).toEqual({
    id: "card.cat",
    type: "flashcard",
    sourceItemIds: [item.id],
    front: item.front,
    back: item.back,
  });
  expect(card.front).not.toBe(item.front);
  expect(card.back).not.toBe(item.back);
  expect(generate()).toEqual(card);
});

it("requires one scored source item", () => {
  expect(() => generate([])).toThrow(ExerciseGenerationError);
  expect(() => generate([item, item])).toThrow(ExerciseGenerationError);
});

it.each([
  { ...item, id: " " },
  { ...item, front: { text: " " } },
  { ...item, back: { text: " " } },
])("rejects a card with an empty identity or face", (source) => {
  expect(() => generate([source])).toThrow(ExerciseGenerationError);
});

it("requires a stable exercise identity", () => {
  expect(() => generate([item], " ")).toThrow(ExerciseGenerationError);
});
