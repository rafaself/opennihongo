import { kanaCharacterCharts } from "@opennihongo/content";
import { normalizeKanaAnswer } from "@opennihongo/core";
import { describe, expect, it } from "vitest";
import { createKanaPracticeSession } from "./createKanaPracticeSession";

for (const script of ["hiragana", "katakana"] as const) {
  for (const section of kanaCharacterCharts[script].sections) {
    const tiles = section.rows.flatMap((row) =>
      row.filter((tile) => tile !== null),
    );
    const options = { script, category: section.id, revision: 0 };

    describe(`${script} ${section.id} practice`, () => {
      it("creates distinct reading prompts with authored answers and stable identities", () => {
        const session = createKanaPracticeSession({
          ...options,
          mode: "reading",
        });
        expect(session.exercises).toHaveLength(Math.min(5, tiles.length));
        const sourceIds = session.exercises.flatMap(
          ({ sourceItemIds }) => sourceItemIds,
        );
        expect(new Set(sourceIds).size).toBe(session.exercises.length);
        expect(new Set(session.exercises.map(({ id }) => id)).size).toBe(
          session.exercises.length,
        );
        for (const exercise of session.exercises) {
          expect(exercise.type).toBe("typed-answer");
          if (exercise.type !== "typed-answer")
            throw new Error("Expected a reading exercise");
          const tile = tiles.find(({ id }) => id === exercise.sourceItemIds[0]);
          expect(tile).toBeDefined();
          expect(exercise.prompt.text).toBe(tile?.glyph);
          expect(exercise.acceptedAnswers).toEqual([tile?.romanization]);
          expect(Object.isFrozen(exercise)).toBe(true);
          expect(Object.isFrozen(exercise.prompt)).toBe(true);
          expect(Object.isFrozen(exercise.acceptedAnswers)).toBe(true);
        }
        expect(Object.isFrozen(session)).toBe(true);
        expect(Object.isFrozen(session.exercises)).toBe(true);
        expect(
          createKanaPracticeSession({ ...options, mode: "reading" }),
        ).toEqual(session);
        const replay = createKanaPracticeSession({
          ...options,
          mode: "reading",
          revision: 1,
        });
        expect(replay.id).not.toBe(session.id);
        expect(replay.exercises.map(({ id }) => id)).not.toEqual(
          session.exercises.map(({ id }) => id),
        );
      });

      it("creates an unambiguous matching board from the selected category", () => {
        const session = createKanaPracticeSession({
          ...options,
          mode: "matching",
        });
        expect(session.exercises).toHaveLength(1);
        const exercise = session.exercises[0];
        if (exercise?.type !== "matching")
          throw new Error("Expected a matching exercise");
        const readings = new Set(
          tiles.map(({ romanization }) => normalizeKanaAnswer(romanization)),
        );
        expect(exercise.config.pairCount).toBe(Math.min(5, readings.size));
        expect(
          new Set(exercise.pairs.map(({ left }) => normalizeKanaAnswer(left)))
            .size,
        ).toBe(exercise.config.pairCount);
        for (const pair of exercise.pairs) {
          const tile = tiles.find(({ id }) => id === pair.sourceItemId);
          expect(tile).toBeDefined();
          expect(pair.left).toBe(tile?.romanization);
          expect(pair.right).toBe(tile?.glyph);
          expect(Object.isFrozen(pair)).toBe(true);
        }
        expect(Object.isFrozen(exercise.leftOrder)).toBe(true);
        expect(Object.isFrozen(exercise.config)).toBe(true);
        expect(
          createKanaPracticeSession({ ...options, mode: "matching" }),
        ).toEqual(session);
      });
    });
  }
}

it("keeps shared readings unambiguous across replayed marked Kana boards", () => {
  for (let revision = 0; revision < 40; revision += 1) {
    const session = createKanaPracticeSession({
      mode: "matching",
      script: "hiragana",
      category: "dakuten",
      revision,
    });
    const exercise = session.exercises[0];
    if (exercise?.type !== "matching")
      throw new Error("Expected a matching exercise");
    expect(new Set(exercise.pairs.map(({ left }) => left)).size).toBe(5);
  }
});
