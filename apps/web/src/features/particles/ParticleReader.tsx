import {
  getParticleLesson,
  particleLessons,
  particleSources,
  type ParticleLesson,
} from "@opennihongo/content";
import { Stack, Surface, Text } from "@opennihongo/ui";
import { Link } from "@tanstack/react-router";
import { ParticleCheck } from "./components/ParticleCheck";
import { SentenceExplorer } from "./components/SentenceExplorer";

export function ParticleReader({ lesson }: { lesson: ParticleLesson }) {
  const index = particleLessons.findIndex(({ id }) => id === lesson.id);
  const previous = particleLessons[index - 1];
  const next = particleLessons[index + 1];

  return (
    <Stack className="particles-page particles-reader" gap="8">
      <header className="particles-introduction">
        <Link className="particles-back" to="/particles">
          All particles
        </Link>
        <Text color="secondary" variant="label">
          Lesson {index + 1} of {particleLessons.length} · About{" "}
          {lesson.minutes} min · Pronounced {lesson.reading}
        </Text>
        <Text variant="display">
          <span lang="ja">{lesson.glyph}</span>
          {lesson.title.slice(lesson.glyph.length)}
        </Text>
        <Text color="secondary">{lesson.summary}</Text>
      </header>
      <Surface className="particles-unit">
        <Stack gap="5">
          <Text variant="heading">How it works</Text>
          {lesson.paragraphs.map((paragraph) => (
            <Text key={paragraph}>{paragraph}</Text>
          ))}
        </Stack>
      </Surface>
      <SentenceExplorer lesson={lesson} />
      <aside className="particles-note" aria-label="A little more context">
        <Text variant="label">A little more context</Text>
        <Text color="secondary">{lesson.note}</Text>
      </aside>
      <ParticleCheck lesson={lesson} />
      <section aria-labelledby="particles-related-title">
        <Text variant="heading" id="particles-related-title">
          Notice the difference
        </Text>
        <div className="particles-related">
          {lesson.relatedIds.map((id) => {
            const related = getParticleLesson(id);
            return (
              related && (
                <Link
                  className="ns-button"
                  data-variant="secondary"
                  key={id}
                  to="/particles/$particleId"
                  params={{ particleId: id }}
                >
                  <span lang="ja">{related.glyph}</span> · {related.role}
                </Link>
              )
            );
          })}
        </div>
      </section>
      <details className="particles-sources">
        <summary>Learning sources</summary>
        <ul>
          {lesson.references.map(({ sourceId, locator }) => {
            const source = particleSources.find(({ id }) => id === sourceId);
            return (
              source && (
                <li key={`${sourceId}-${locator}`}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>{" "}
                  · {source.institution} · {locator}
                </li>
              )
            );
          })}
        </ul>
      </details>
      <nav
        className="particles-lesson-navigation"
        aria-label="Particle lessons navigation"
      >
        {previous && (
          <Link
            className="ns-button"
            data-variant="secondary"
            to="/particles/$particleId"
            params={{ particleId: previous.id }}
          >
            Previous: <span lang="ja">{previous.glyph}</span>
          </Link>
        )}
        {next ? (
          <Link
            className="ns-button"
            data-variant="primary"
            to="/particles/$particleId"
            params={{ particleId: next.id }}
          >
            Next: <span lang="ja">{next.glyph}</span>
          </Link>
        ) : (
          <Link className="ns-button" data-variant="primary" to="/practice">
            Explore character practice
          </Link>
        )}
      </nav>
    </Stack>
  );
}
