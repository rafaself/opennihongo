import { expect, it } from "vitest";
import {
  kanaCharacterCharts,
  kanaBeginnerWords,
  type KanaChartScript,
} from "@opennihongo/content";
import { createCardStackSession } from "../createCardStackSession";
import { getKanaCards, getWordCards } from "../cardStackContent";

it.each(["hiragana", "katakana"] as const)(
  "draws distinct %s cards from every selected category",
  (script: KanaChartScript) => {
    for (const section of kanaCharacterCharts[script].sections) {
      const items = getKanaCards({
        scripts: [script],
        categories: [section.id],
      });
      const session = createCardStackSession(
        items,
        `${script}:${section.id}`,
        0,
      );
      expect(session.exercises).toHaveLength(Math.min(10, items.length));
      expect(
        new Set(session.exercises.flatMap((card) => card.sourceItemIds)).size,
      ).toBe(session.exercises.length);
      for (const card of session.exercises) {
        const source = items.find(({ id }) => id === card.sourceItemIds[0]);
        expect(card.front).toEqual(source?.front);
        expect(card.back).toEqual(source?.back);
      }
      if (section.id === "small-tsu") expect(session.exercises).toHaveLength(4);
    }
  },
);

it("keeps characters with equivalent readings as distinct cards", () => {
  const items = getKanaCards({
    scripts: ["hiragana"],
    categories: ["dakuten"],
  });
  const duplicates = items.filter(({ back }) => back.text === "ji");
  expect(duplicates).toHaveLength(2);
  const session = createCardStackSession(duplicates, "duplicates", 0);
  expect(session.exercises).toHaveLength(2);
  expect(
    new Set(session.exercises.flatMap(({ sourceItemIds }) => sourceItemIds))
      .size,
  ).toBe(2);
});

it("uses the authored word meanings and pronunciations without repeating small collections", () => {
  const items = getWordCards();
  const session = createCardStackSession(items, "words", 0);
  expect(session.exercises).toHaveLength(kanaBeginnerWords.length);
  for (const card of session.exercises) {
    const word = kanaBeginnerWords.find(
      ({ id }) => id === card.sourceItemIds[0],
    );
    expect(card.front.text).toBe(word?.hiragana);
    expect(card.back.text).toBe(word?.englishMeaning);
    expect(card.back.supportingText).toBe(word?.romanization);
    expect(items.find(({ id }) => id === word?.id)?.pronunciationText).toBe(
      word?.pronunciation.text,
    );
  }
});

it("accepts future subjects, reproduces a seed, and reshuffles a replay without freezing authored data", () => {
  const items = Array.from({ length: 18 }, (_, index) => ({
    id: `future.${String(index)}`,
    front: { text: `Prompt ${String(index)}` },
    back: { text: `Answer ${String(index)}` },
  }));
  const session = createCardStackSession(items, "future", 0);
  expect(session).toEqual(createCardStackSession(items, "future", 0));
  expect(
    session.exercises.map(({ sourceItemIds }) => sourceItemIds),
  ).not.toEqual(
    createCardStackSession(items, "future", 1).exercises.map(
      ({ sourceItemIds }) => sourceItemIds,
    ),
  );
  expect(session.exercises).toHaveLength(10);
  for (const value of [
    session,
    session.exercises,
    ...session.exercises.flatMap((card) => [
      card,
      card.front,
      card.back,
      card.sourceItemIds,
    ]),
  ])
    expect(Object.isFrozen(value)).toBe(true);
  expect(Object.isFrozen(items[0]?.front)).toBe(false);
});

it("rejects empty collections and repeated identities before starting a session", () => {
  expect(() => createCardStackSession([], "empty", 0)).toThrow(/empty/i);
  const item = { id: "a", front: { text: "A" }, back: { text: "a" } };
  expect(() => createCardStackSession([item, item], "duplicates", 0)).toThrow(
    /distinct/i,
  );
});

it("supports configured Kana stack lengths while preserving the ten-card default", () => {
  const items = getKanaCards({ scripts: ["hiragana"], categories: ["basic"] });
  expect(createCardStackSession(items, "kana", 0, 20).exercises).toHaveLength(
    20,
  );
  expect(createCardStackSession(items, "kana", 0, 5).exercises).toHaveLength(5);
  expect(createCardStackSession(items, "kana", 0).exercises).toHaveLength(10);
});

it.each([0, -1, 1.5, Number.NaN])(
  "rejects an invalid stack length %s",
  (length) => {
    const items = getKanaCards({
      scripts: ["hiragana"],
      categories: ["basic"],
    });
    expect(() => createCardStackSession(items, "kana", 0, length)).toThrow(
      /length/,
    );
  },
);
