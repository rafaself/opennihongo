import { expect, it } from "vitest";
import type {
  Exercise,
  ExerciseType,
  MatchingExercise,
  MatchingPairId,
  TypedAnswerExercise,
  FlashcardExercise,
} from "../../src";

function readExerciseType(exercise: Exercise): ExerciseType {
  switch (exercise.type) {
    case "flashcard":
    case "multiple-choice":
    case "typed-answer":
      return exercise.type;
    case "matching":
      return exercise.type;
    default:
      return assertNever(exercise);
  }
}

function assertNever(value: never): never {
  throw new Error(`Unexpected exercise type: ${String(value)}`);
}

it("composes concrete exercises into an exhaustive union", () => {
  const leftOrder: readonly MatchingPairId[] = ["pair.hato", "pair.soto"];
  const rightOrder: readonly MatchingPairId[] = ["pair.soto", "pair.hato"];
  const matchingExercise = {
    id: "exercise.vocabulary-matching",
    type: "matching",
    sourceItemIds: ["vocabulary.soto", "vocabulary.hato"],
    config: { pairCount: 2 },
    pairs: [
      {
        id: "pair.soto",
        sourceItemId: "vocabulary.soto",
        left: "そと",
        right: "outside",
      },
      {
        id: "pair.hato",
        sourceItemId: "vocabulary.hato",
        left: "はと",
        right: "pigeon",
      },
    ],
    leftOrder,
    rightOrder,
  } as const satisfies MatchingExercise;

  const typedAnswerExercise = {
    id: "exercise.hiragana-a",
    type: "typed-answer",
    prompt: { text: "あ" },
    acceptedAnswers: ["a"],
    sourceItemIds: ["kana.hiragana.a"],
  } as const satisfies TypedAnswerExercise;

  const flashcardExercise = {
    id: "exercise.word-cat-card",
    type: "flashcard",
    sourceItemIds: ["word.cat"],
    front: { text: "ねこ" },
    back: { text: "cat" },
  } as const satisfies FlashcardExercise;

  const exercises: readonly Exercise[] = [
    typedAnswerExercise,
    matchingExercise,
    flashcardExercise,
  ];

  expect(exercises.map(readExerciseType)).toEqual([
    "typed-answer",
    "matching",
    "flashcard",
  ]);
  expect(matchingExercise.config.pairCount).toBe(2);
  expect(
    matchingExercise.pairs.map(({ sourceItemId }) => sourceItemId),
  ).toEqual(["vocabulary.soto", "vocabulary.hato"]);
  expect(matchingExercise.leftOrder).toEqual(["pair.hato", "pair.soto"]);
  expect(matchingExercise.rightOrder).toEqual(["pair.soto", "pair.hato"]);
});
