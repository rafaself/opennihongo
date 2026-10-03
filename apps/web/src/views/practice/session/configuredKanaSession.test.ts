import { expect, it } from "vitest";
import { normalizePracticeSearch } from "../../../app/practiceSearch";
import { createKanaPracticeSession } from "./createKanaPracticeSession";
import { getKanaPracticeSummary } from "./kanaPracticeContent";
import { getKanaPracticeTiles } from "./kanaPracticeSelection";
import { normalizeKanaAnswer } from "@opennihongo/core";

const selection = normalizePracticeSearch({
  scripts: ["hiragana", "katakana"],
  categories: ["basic", "dakuten"],
  length: 20,
});

it.each(["easy", "standard", "hard"] as const)(
  "builds %s quizzes with selected, unambiguous choices",
  (difficulty) => {
    const options = {
      ...selection,
      difficulty,
      mode: "quiz",
      revision: 0,
    } as const;
    const session = createKanaPracticeSession(options, "test-session");
    expect(session.exercises).toHaveLength(20);
    expect(session).toEqual(createKanaPracticeSession(options, "test-session"));
    const tiles = getKanaPracticeTiles(selection);
    expect(
      new Set(session.exercises.flatMap(({ sourceItemIds }) => sourceItemIds))
        .size,
    ).toBe(20);
    for (const exercise of session.exercises) {
      if (exercise.type !== "multiple-choice") throw new Error("Expected quiz");
      expect(exercise.options).toHaveLength(
        difficulty === "easy" ? 2 : difficulty === "standard" ? 4 : 6,
      );
      const readings = exercise.options.map(({ id }) =>
        normalizeKanaAnswer(
          tiles.find((tile) => tile.id === id)?.romanization ?? "",
        ),
      );
      expect(new Set(readings).size).toBe(readings.length);
    }
  },
);

it.each(["easy", "standard", "hard"] as const)(
  "splits %s matching into small boards with distinct readings",
  (difficulty) => {
    const session = createKanaPracticeSession(
      {
        ...selection,
        mode: "matching",
        difficulty,
        revision: 0,
      },
      "test-session",
    );
    expect(session.exercises.length).toBeGreaterThan(1);
    const ids = session.exercises.flatMap(({ sourceItemIds }) => sourceItemIds);
    expect(ids).toHaveLength(20);
    expect(new Set(ids).size).toBe(20);
    const readings: string[] = [];
    for (const exercise of session.exercises) {
      if (exercise.type !== "matching") throw new Error("Expected matching");
      expect(exercise.pairs.length).toBeGreaterThanOrEqual(2);
      expect(exercise.pairs.length).toBeLessThanOrEqual(
        difficulty === "easy" ? 3 : difficulty === "standard" ? 4 : 5,
      );
      readings.push(
        ...exercise.pairs.map(({ left }) => normalizeKanaAnswer(left)),
      );
    }
    expect(new Set(readings).size).toBe(20);
  },
);

it("rebalances trailing pairs, clamps tiny pools, and rejects unusable selections", () => {
  const base = normalizePracticeSearch({
    categories: ["small-tsu"],
    length: 20,
    difficulty: "hard",
  });
  expect(getKanaPracticeSummary("quiz", base)).toMatchObject({
    count: 4,
    choices: 4,
    requested: 20,
    canStart: true,
  });
  expect(
    getKanaPracticeSummary("matching", normalizePracticeSearch({ length: 5 })),
  ).toMatchObject({ boards: [3, 2], count: 5 });
  const oneSound = {
    ...selection,
    characterIds: ["hiragana.basic.あ", "katakana.basic.ア"],
  };
  expect(getKanaPracticeSummary("reading", oneSound).count).toBe(2);
  expect(getKanaPracticeSummary("cards", oneSound).count).toBe(2);
  for (const mode of ["quiz", "matching"] as const) {
    expect(getKanaPracticeSummary(mode, oneSound).canStart).toBe(false);
    expect(() =>
      createKanaPracticeSession(
        { ...oneSound, mode, revision: 0 },
        "test-session",
      ),
    ).toThrow(/distinct readings/);
  }
  expect(() =>
    createKanaPracticeSession(
      {
        ...selection,
        characterIds: [],
        mode: "reading",
        revision: 0,
      },
      "test-session",
    ),
  ).toThrow(/Select/);
});
