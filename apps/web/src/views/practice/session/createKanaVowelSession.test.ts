import { expect, it } from "vitest";
import { hiraganaVowels, kanaVowelLessonProfile } from "@opennihongo/content";
import { createKanaVowelSession } from "./createKanaVowelSession";

it("builds a reproducible immutable typed-answer lesson in the authored vowel order", () => {
  const session = createKanaVowelSession("test-session");
  expect(session).toEqual(createKanaVowelSession("test-session"));
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

it("separates session occurrence identity from the authored lesson sequence", () => {
  const first = createKanaVowelSession("run-one");
  const second = createKanaVowelSession("run-two");
  expect(first.id).not.toBe(second.id);
  expect(first.exercises.map(({ id }) => id)).not.toEqual(
    second.exercises.map(({ id }) => id),
  );
  expect(first.exercises.map(({ sourceItemIds }) => sourceItemIds)).toEqual(
    second.exercises.map(({ sourceItemIds }) => sourceItemIds),
  );
});
