import { describe, expect, it } from "vitest";
import { beginnerKanji } from "@opennihongo/content";
import {
  evaluateTypedAnswer,
  normalizeJapaneseReading,
} from "@opennihongo/core";
import {
  normalizeKanjiSearch,
  getKanjiItems,
  getKanjiSummary,
  toggleKanji,
  updateKanjiThemes,
  kanjiConfigurationId,
} from "../session/options";
import {
  createKanjiSession,
  getKanjiCards,
} from "../session/createKanjiSession";

const defaults = normalizeKanjiSearch({});
const first = beginnerKanji[0];
if (!first) throw new Error("Expected authored Kanji");

describe("Kanji configuration", () => {
  it("defaults to the complete collection and sanitizes URL input", () => {
    expect(getKanjiItems(defaults)).toHaveLength(30);
    expect(defaults).toMatchObject({
      difficulty: "standard",
      focus: "mixed",
      fast: false,
    });
    expect(normalizeKanjiSearch(null)).toEqual(defaults);
    expect(
      normalizeKanjiSearch({
        themes: ["invalid"],
        ids: [first.id, "invalid"],
        length: 99,
        difficulty: "invalid",
        focus: "invalid",
        fast: "true",
      }),
    ).toEqual({ ...defaults, ids: [first.id] });
    expect(
      normalizeKanjiSearch({
        themes: [],
        ids: [],
        difficulty: "easy",
        focus: "readings",
        fast: true,
        length: 20,
      }),
    ).toMatchObject({
      themes: [],
      ids: [],
      difficulty: "easy",
      focus: "readings",
      fast: true,
      length: 20,
    });
    expect(
      normalizeKanjiSearch({
        themes: ["nature", "nature"],
        difficulty: "hard",
        focus: "meanings",
      }),
    ).toMatchObject({
      themes: ["nature"],
      difficulty: "hard",
      focus: "meanings",
    });
  });
  it("preserves individual exclusions and adds newly enabled themes", () => {
    const excluded = toggleKanji(defaults, [first.id], false);
    expect(getKanjiItems(excluded)).toHaveLength(29);
    expect(toggleKanji(excluded, [first.id], true).ids).toContain(first.id);
    const numbers = updateKanjiThemes(excluded, ["numbers"]);
    expect(getKanjiItems(numbers)).toHaveLength(9);
    const expanded = updateKanjiThemes(numbers, ["numbers", "nature"]);
    expect(getKanjiItems(expanded)).toHaveLength(19);
    expect(expanded.ids).not.toContain(first.id);
    expect(updateKanjiThemes(defaults, ["nature"]).ids).toBeUndefined();
  });
  it("clamps small pools and prevents empty or ambiguous games", () => {
    const one = { ...defaults, ids: [first.id], length: 20 as const };
    expect(getKanjiSummary("reading", one)).toMatchObject({
      count: 1,
      canStart: true,
    });
    expect(getKanjiSummary("quiz", one).canStart).toBe(false);
    expect(getKanjiSummary("matching", one).canStart).toBe(false);
    expect(getKanjiSummary("cards", defaults).count).toBe(10);
    expect(
      getKanjiSummary("reading", { ...defaults, ids: [] }).error,
    ).toContain("Select at least one");
    expect(
      getKanjiSummary("matching", { ...defaults, length: 10 }).boards,
    ).toEqual([4, 4, 2]);
    expect(
      getKanjiSummary("matching", { ...defaults, length: 5 }).boards,
    ).toEqual([3, 2]);
    expect(
      getKanjiSummary("quiz", {
        ...defaults,
        ids: beginnerKanji.slice(0, 3).map(({ id }) => id),
        difficulty: "hard",
      }).choices,
    ).toBe(3);
  });
});

describe("Kanji sessions", () => {
  it("produces immutable reproducible batches with no reused source items", () => {
    for (const mode of ["reading", "matching", "quiz"] as const) {
      const a = createKanjiSession(mode, defaults, 0, "session");
      expect(a).toEqual(createKanjiSession(mode, defaults, 0, "session"));
      expect(Object.isFrozen(a)).toBe(true);
      expect(Object.isFrozen(a.exercises)).toBe(true);
      const ids = a.exercises.flatMap(({ sourceItemIds }) => sourceItemIds);
      expect(ids).toHaveLength(5);
      expect(new Set(ids).size).toBe(ids.length);
      expect(
        createKanjiSession(mode, defaults, 1, "session").exercises,
      ).not.toEqual(a.exercises);
    }
    expect(kanjiConfigurationId(defaults)).toBe(
      kanjiConfigurationId({
        ...defaults,
        themes: [...defaults.themes].reverse(),
      }),
    );
    expect(kanjiConfigurationId({ ...defaults, ids: ["a", "b"] })).toBe(
      kanjiConfigurationId({ ...defaults, ids: ["b", "a"] }),
    );
    expect(() =>
      createKanjiSession("reading", { ...defaults, ids: [] }, 0, "empty"),
    ).toThrow(/Select at least one/);
  });
  it("accepts only the contextual reading and explicitly authored romanizations", () => {
    const ten = beginnerKanji.find(({ glyph }) => glyph === "十");
    if (!ten) throw new Error("Expected ten");
    const exercise = createKanjiSession(
      "reading",
      { ...defaults, ids: [ten.id] },
      0,
      "ten",
    ).exercises[0];
    if (exercise?.type !== "typed-answer") throw new Error("Expected reading");
    expect(exercise.prompt.text).toBe("十日");
    for (const answer of ["とおか", "トオカ", "tooka", "TŌKA"])
      expect(
        evaluateTypedAnswer(exercise, answer, normalizeJapaneseReading).outcome,
      ).toBe("correct");
    for (const answer of ["とか", "toka", "じゅう", "ten"])
      expect(
        evaluateTypedAnswer(exercise, answer, normalizeJapaneseReading).outcome,
      ).toBe("incorrect");
  });
  it("balances mixed question types and supplies distinct correctly keyed choices", () => {
    for (const focus of ["meanings", "readings", "mixed"] as const) {
      const session = createKanjiSession(
        "quiz",
        { ...defaults, focus, difficulty: "hard", length: 20 },
        0,
        "quiz",
      );
      let meanings = 0;
      for (const exercise of session.exercises) {
        if (exercise.type !== "multiple-choice")
          throw new Error("Expected quiz");
        const item = beginnerKanji.find(
          ({ id }) => id === exercise.sourceItemIds[0],
        );
        if (!item) throw new Error("Expected source");
        const choice = exercise.options.find(
          ({ id }) => id === exercise.correctOptionId,
        );
        const isMeaning = choice?.text === item.meaning;
        if (isMeaning) meanings++;
        expect(exercise.prompt.text).toBe(
          isMeaning ? item.glyph : item.example.text,
        );
        expect(exercise.options).toHaveLength(6);
        expect(new Set(exercise.options.map(({ text }) => text)).size).toBe(6);
        if (!isMeaning) expect(choice?.text).toBe(item.example.reading);
      }
      expect(meanings).toBe(
        focus === "mixed" ? 10 : focus === "meanings" ? 20 : 0,
      );
    }
  });
  it("adapts cards with complete recall details and optional romaji", () => {
    const card = getKanjiCards(defaults, true)[0];
    expect(card?.front).toEqual({
      text: first.glyph,
      supportingText: first.example.text,
      lang: "ja",
    });
    expect(card?.back.text).toBe(first.meaning);
    expect(card?.back.supportingText).toContain(first.example.romaji);
    expect(card?.back.supportingText).toContain("On:");
    expect(card?.back.supportingText).toContain("Kun:");
    expect(card?.pronunciationText).toBe(first.example.reading);
    expect(card?.pronunciationLabel).toBe(first.example.text);
    expect(
      getKanjiCards(defaults, false)[0]?.back.supportingText,
    ).not.toContain(first.example.romaji);
  });
});
