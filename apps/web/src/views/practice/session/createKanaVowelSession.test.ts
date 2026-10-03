import { expect, it } from "vitest";
import { hiraganaVowels, kanaVowelLessonProfile } from "@opennihongo/content";
import { createKanaVowelSession } from "./createKanaVowelSession";

it("builds a reproducible immutable typed-answer lesson in the authored vowel order", () => {
  const session = createKanaVowelSession();
  expect(session).toEqual(createKanaVowelSession());
  expect(session.profileId).toBe(kanaVowelLessonProfile.id);
  expect(session.exercises).toHaveLength(5);
  expect(session.exercises.map(({ sourceItemIds }) => sourceItemIds)).toEqual(
    hiraganaVowels.map(({ id }) => [id]),
  );
  expect(
    session.exercises.map((exercise) => {
      if (exercise.type !== "typed-answer")
        throw new Error("Expected a typed-answer lesson");
      return [exercise.prompt.text, exercise.acceptedAnswers];
    }),
  ).toEqual(
    hiraganaVowels.map(({ glyph, romanization }) => [glyph, [romanization]]),
  );
  expect(Object.isFrozen(session)).toBe(true);
  expect(
    session.exercises.every(
      (exercise) =>
        Object.isFrozen(exercise) && Object.isFrozen(exercise.sourceItemIds),
    ),
  ).toBe(true);
});
