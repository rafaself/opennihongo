import { describe, expect, it } from "vitest";
import {
  beginnerKanji,
  getKanjiTheoryCharacter,
  kanjiTheoryCharacters,
} from "../src/index";

describe("Kanji theory", () => {
  it("offers a reference and two explained checks for every beginner character", () => {
    expect(kanjiTheoryCharacters).toHaveLength(30);
    for (const character of beginnerKanji) {
      const lesson = getKanjiTheoryCharacter(character.id);
      expect(lesson?.character).toEqual(character);
      expect(lesson?.checks.map(({ kind }) => kind)).toEqual([
        "meaning",
        "reading",
      ]);
      for (const check of lesson?.checks ?? []) {
        expect(check.options).toHaveLength(3);
        expect(new Set(check.options.map(({ id }) => id)).size).toBe(3);
        expect(new Set(check.options.map(({ label }) => label)).size).toBe(3);
        const correct = check.options.filter(
          ({ id }) => id === check.correctOptionId,
        );
        expect(correct).toHaveLength(1);
        expect(correct[0]?.label).toBe(
          check.kind === "meaning"
            ? character.meaning
            : character.example.reading,
        );
        for (const option of check.options) {
          expect(option.explanation).toContain(character.glyph);
          expect(option.explanation.trim().length).toBeGreaterThan(20);
        }
      }
    }
  });

  it("checks the whole word rather than an unrelated character reading", () => {
    const ten = getKanjiTheoryCharacter("kanji.character.u5341");
    const reading = ten?.checks.find(({ kind }) => kind === "reading");
    expect(reading?.prompt).toContain("十日");
    expect(
      reading?.options.find(({ id }) => id === reading.correctOptionId)?.label,
    ).toBe("とおか");
    const moon = getKanjiTheoryCharacter("kanji.character.u6708");
    expect(moon?.character.example.meaning).toBe("moon");
    expect(
      moon?.checks[1]?.options.find(({ id }) => id === moon.character.id)
        ?.label,
    ).toBe("つき");
  });

  it("returns no reference for an unknown public character ID", () => {
    expect(getKanjiTheoryCharacter("not-a-kanji")).toBeUndefined();
  });
});
