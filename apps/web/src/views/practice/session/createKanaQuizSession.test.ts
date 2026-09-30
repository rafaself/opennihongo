import { kanaCharacterCharts } from "@opennihongo/content";
import { normalizeKanaAnswer } from "@opennihongo/core";
import { expect, it } from "vitest";
import { createKanaPracticeSession } from "./createKanaPracticeSession";
import { getKanaPracticeTiles } from "./kanaPracticeContent";

for (const script of ["hiragana", "katakana"] as const) {
  for (const { id: category } of kanaCharacterCharts[script].sections) {
    for (const direction of ["random", "character", "romaji"] as const) {
      it(`generates unambiguous ${script} ${category} ${direction} questions`, () => {
        const options = {
          mode: "quiz",
          script,
          category,
          direction,
          revision: 0,
        } as const;
        const session = createKanaPracticeSession(options);
        expect(session).toEqual(createKanaPracticeSession(options));
        expect(session.profileId).toBe("kana.practice.quiz");
        expect(session.exercises).toHaveLength(
          category === "small-tsu" ? 4 : 5,
        );
        expect(
          new Set(
            session.exercises.flatMap(({ sourceItemIds }) => sourceItemIds),
          ).size,
        ).toBe(session.exercises.length);
        const tiles = getKanaPracticeTiles(script, category);
        let characterPrompts = 0;
        for (const exercise of session.exercises) {
          expect(exercise.type).toBe("multiple-choice");
          if (exercise.type !== "multiple-choice")
            throw new Error("Expected quiz");
          const target = tiles.find(
            ({ id }) => id === exercise.sourceItemIds[0],
          );
          if (!target) throw new Error("Expected chart target");
          const character = exercise.prompt.text === target.glyph;
          characterPrompts += Number(character);
          if (direction !== "random")
            expect(character).toBe(direction === "character");
          expect(exercise.options).toHaveLength(4);
          expect(exercise.correctOptionId).toBe(target.id);
          const optionTiles = exercise.options.map((option) => {
            const tile = tiles.find(({ id }) => id === option.id);
            if (!tile) throw new Error("Expected category option");
            expect(option.text).toBe(
              character ? tile.romanization : tile.glyph,
            );
            return tile;
          });
          expect(
            new Set(
              optionTiles.map(({ romanization }) =>
                normalizeKanaAnswer(romanization),
              ),
            ).size,
          ).toBe(4);
          for (const value of [
            exercise,
            exercise.prompt,
            exercise.options,
            ...exercise.options,
            exercise.sourceItemIds,
          ])
            expect(Object.isFrozen(value)).toBe(true);
        }
        if (direction === "random")
          expect(
            Math.abs(characterPrompts * 2 - session.exercises.length),
          ).toBeLessThanOrEqual(1);
        expect(Object.isFrozen(session)).toBe(true);
        expect(Object.isFrozen(session.exercises)).toBe(true);
        expect(
          createKanaPracticeSession({ ...options, revision: 1 }),
        ).not.toEqual(session);
      });
    }
  }
}

it("keeps duplicate readings out of every marked-Kana option set across replays", () => {
  for (let revision = 0; revision < 20; revision++) {
    const session = createKanaPracticeSession({
      mode: "quiz",
      script: "hiragana",
      category: "dakuten",
      direction: "romaji",
      revision,
    });
    expect(
      new Set(
        session.exercises.map((exercise) =>
          exercise.type === "multiple-choice" ? exercise.prompt.text : "",
        ),
      ).size,
    ).toBe(5);
  }
});
