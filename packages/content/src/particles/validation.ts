import type { ParticleCatalog, ParticleReference } from "./types";
import { reconstructParticleSentence } from "./sentences";

function unique(ids: readonly string[], label: string) {
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${label}`);
}
export function assertParticleCatalog(catalog: ParticleCatalog): void {
  const { lessons, sources } = catalog;
  if (!lessons.length) throw new Error("No particle lessons");
  unique(
    lessons.map(({ id }) => id),
    "lesson",
  );
  unique(
    sources.map(({ id }) => id),
    "source",
  );
  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const sourceIds = new Set(sources.map(({ id }) => id));
  for (const source of sources) {
    if (
      !source.title.trim() ||
      !source.institution.trim() ||
      !source.url.startsWith("https://") ||
      !/^\d{4}-\d{2}-\d{2}$/.test(source.accessedOn)
    )
      throw new Error("Invalid source");
  }
  const references = (refs: readonly ParticleReference[]) => {
    if (!refs.length) throw new Error("Missing references");
    for (const ref of refs) {
      if (!ref.locator.trim()) throw new Error("Invalid reference");
      if (!sourceIds.has(ref.sourceId)) throw new Error("Unknown source");
    }
  };
  const particle = (id: string) => {
    const result = lessonMap.get(id);
    if (!result) throw new Error("Unknown particle");
    return result;
  };
  for (const lesson of lessons) {
    if (
      ![
        lesson.id,
        lesson.glyph,
        lesson.reading,
        lesson.title,
        lesson.role,
        lesson.summary,
        lesson.note,
        ...lesson.paragraphs,
      ].every((value) => value.trim()) ||
      !/^[a-z][a-z-]*$/.test(lesson.id) ||
      lesson.minutes <= 0 ||
      !lesson.paragraphs.length
    )
      throw new Error("Incomplete lesson");
    references(lesson.references);
    lesson.relatedIds.forEach(particle);
    if (lesson.examples.length < 2) throw new Error("Not enough examples");
    unique(
      lesson.examples.map(({ id }) => id),
      "example",
    );
    for (const example of lesson.examples) {
      for (const token of example.tokens) {
        if (typeof token === "string") continue;
        if (
          particle(token.particleId).glyph !== token.text ||
          !token.explanation.trim()
        )
          throw new Error("Invalid particle token");
      }
      if (
        ![
          example.id,
          example.label,
          example.reading,
          example.translation,
          example.context,
        ].every((value) => value.trim()) ||
        reconstructParticleSentence(example.tokens) !== example.japanese
      )
        throw new Error("Invalid example");
      if (
        !example.tokens.some(
          (token) =>
            typeof token !== "string" && token.particleId === lesson.id,
        )
      )
        throw new Error("Missing focus particle");
    }
    unique(
      lesson.check.options.map(({ particleId }) => particleId),
      "check option",
    );
    lesson.check.options.forEach(({ particleId }) => particle(particleId));
    if (
      !lesson.check.prompt.trim() ||
      lesson.check.options.length < 2 ||
      !lesson.check.options.some(
        ({ particleId }) => particleId === lesson.id,
      ) ||
      !lesson.check.options.every(({ explanation }) => explanation.trim())
    )
      throw new Error("Invalid check");
  }
}
