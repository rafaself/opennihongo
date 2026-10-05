import { describe, expect, it } from "vitest";
import {
  assertParticleCatalog,
  getParticleLesson,
  particleCatalog,
  particleLessons,
  reconstructParticleSentence,
} from "../src/index";

describe("particle learning content", () => {
  it("provides ten ordered, sourced lessons with interactive original examples", () => {
    expect(() => {
      assertParticleCatalog(particleCatalog);
    }).not.toThrow();
    expect(particleLessons.map(({ id }) => id)).toEqual([
      "wa",
      "ga",
      "wo",
      "ni",
      "de",
      "he",
      "no",
      "to",
      "mo",
      "ka",
    ]);
    for (const lesson of particleLessons) {
      expect(getParticleLesson(lesson.id)).toBe(lesson);
      expect(lesson.examples.length).toBeGreaterThanOrEqual(2);
      for (const example of lesson.examples) {
        expect(reconstructParticleSentence(example.tokens)).toBe(
          example.japanese,
        );
        expect(
          example.tokens.some(
            (token) =>
              typeof token !== "string" && token.particleId === lesson.id,
          ),
        ).toBe(true);
      }
      expect(
        lesson.check.options.some(({ particleId }) => particleId === lesson.id),
      ).toBe(true);
    }
    expect(getParticleLesson("missing")).toBeUndefined();
  });

  it("distinguishes written glyphs from their particle pronunciations", () => {
    expect(getParticleLesson("wa")).toMatchObject({
      glyph: "は",
      reading: "wa",
    });
    expect(getParticleLesson("wo")).toMatchObject({
      glyph: "を",
      reading: "o",
    });
    expect(getParticleLesson("he")).toMatchObject({
      glyph: "へ",
      reading: "e",
    });
  });

  it("protects identities and maintainable source provenance", () => {
    const [lesson] = particleLessons;
    const [source] = particleCatalog.sources;
    if (!lesson || !source) throw new Error("Missing particle content");
    expect(() => {
      assertParticleCatalog({
        ...particleCatalog,
        lessons: [...particleLessons, lesson],
      });
    }).toThrow("Duplicate lesson");
    expect(() => {
      assertParticleCatalog({
        ...particleCatalog,
        sources: [...particleCatalog.sources, source],
      });
    }).toThrow("Duplicate source");
    expect(() => {
      assertParticleCatalog({
        ...particleCatalog,
        sources: [{ ...source, url: "http://example.com" }],
      });
    }).toThrow("Invalid source");
    expect(() => {
      assertParticleCatalog({
        ...particleCatalog,
        sources: [{ ...source, accessedOn: "yesterday" }],
      });
    }).toThrow("Invalid source");
    expect(() => {
      assertParticleCatalog({ ...particleCatalog, sources: [] });
    }).toThrow("Unknown source");
    expect(() => {
      assertParticleCatalog({ ...particleCatalog, lessons: [] });
    }).toThrow("No particle lessons");
  });

  it("rejects incomplete lessons, mismatched sentences and missing focus particles", () => {
    const [lesson] = particleLessons;
    const [example] = lesson?.examples ?? [];
    if (!lesson || !example) throw new Error("Missing particle example");
    const replace = (changes: Partial<typeof lesson>) => ({
      ...particleCatalog,
      lessons: [{ ...lesson, ...changes }, ...particleLessons.slice(1)],
    });
    expect(() => {
      assertParticleCatalog(replace({ summary: "" }));
    }).toThrow("Incomplete lesson");
    expect(() => {
      assertParticleCatalog(replace({ references: [] }));
    }).toThrow("Missing references");
    expect(() => {
      assertParticleCatalog(
        replace({ references: [{ sourceId: "irodori-grammar", locator: "" }] }),
      );
    }).toThrow("Invalid reference");
    expect(() => {
      assertParticleCatalog(replace({ examples: [] }));
    }).toThrow("Not enough examples");
    expect(() => {
      assertParticleCatalog(replace({ examples: [example, example] }));
    }).toThrow("Duplicate example");
    expect(() => {
      assertParticleCatalog(
        replace({
          examples: [
            { ...example, japanese: "違います。" },
            ...lesson.examples.slice(1),
          ],
        }),
      );
    }).toThrow("Invalid example");
    expect(() => {
      assertParticleCatalog(
        replace({
          examples: [
            { ...example, tokens: [example.japanese] },
            ...lesson.examples.slice(1),
          ],
        }),
      );
    }).toThrow("Missing focus particle");
    expect(() => {
      assertParticleCatalog(
        replace({
          examples: [
            {
              ...example,
              tokens: [
                { particleId: "unknown", text: "は", explanation: "Unknown" },
              ],
            },
            ...lesson.examples.slice(1),
          ],
        }),
      );
    }).toThrow("Unknown particle");
  });

  it("requires matching highlighted glyphs and unambiguous, explained checks", () => {
    const [lesson] = particleLessons;
    const [example] = lesson?.examples ?? [];
    const [option] = lesson?.check.options ?? [];
    if (!lesson || !example || !option)
      throw new Error("Missing particle example");
    const replace = (changes: Partial<typeof lesson>) => ({
      ...particleCatalog,
      lessons: [{ ...lesson, ...changes }, ...particleLessons.slice(1)],
    });
    for (const token of [
      { particleId: "wa", text: "が", explanation: "Wrong glyph" },
      { particleId: "wa", text: "は", explanation: "" },
    ])
      expect(() => {
        assertParticleCatalog(
          replace({
            examples: [
              { ...example, tokens: [token] },
              ...lesson.examples.slice(1),
            ],
          }),
        );
      }).toThrow("Invalid particle token");
    expect(() => {
      assertParticleCatalog(
        replace({ check: { ...lesson.check, options: [] } }),
      );
    }).toThrow("Invalid check");
    expect(() => {
      assertParticleCatalog(
        replace({
          check: {
            ...lesson.check,
            options: [option, option],
          },
        }),
      );
    }).toThrow("Duplicate check option");
    expect(() => {
      assertParticleCatalog(
        replace({
          check: {
            ...lesson.check,
            options: [
              { particleId: "unknown", explanation: "Unknown" },
              { particleId: "ga", explanation: "Subject" },
            ],
          },
        }),
      );
    }).toThrow("Unknown particle");
  });
});
