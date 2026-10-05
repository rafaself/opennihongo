import { particleIntroduction, particleLessons } from "@opennihongo/content";
import { Stack, Surface, Text } from "@opennihongo/ui";
import { Link } from "@tanstack/react-router";

export function ParticlesOverview() {
  return (
    <Stack className="particles-page" gap="8">
      <header className="particles-introduction">
        <Text color="secondary" variant="label">
          A small step into sentences
        </Text>
        <Text variant="display">Japanese particles</Text>
        <Text color="secondary">{particleIntroduction.summary}</Text>
      </header>
      <Surface className="particles-welcome">
        <div className="particles-welcome__glyphs" lang="ja" aria-hidden="true">
          <span>は</span>
          <span>を</span>
          <span>に</span>
        </div>
        <Stack gap="4">
          <Text variant="heading">Meet the little signposts</Text>
          {particleIntroduction.paragraphs.map((paragraph) => (
            <Text key={paragraph} color="secondary">
              {paragraph}
            </Text>
          ))}
          <Text color="secondary" variant="caption" as="p">
            Ten short lessons. Explore in any order; the quick checks are
            optional.
          </Text>
          <Link
            className="ns-button"
            data-variant="primary"
            to="/particles/$particleId"
            params={{ particleId: "wa" }}
          >
            Start with <span lang="ja">は</span>
          </Link>
        </Stack>
      </Surface>
      <section aria-labelledby="particle-lessons-title">
        <Text id="particle-lessons-title" variant="heading">
          Choose a particle
        </Text>
        <ol className="particles-catalog" aria-label="Particle lessons">
          {particleLessons.map((lesson, index) => (
            <li key={lesson.id}>
              <Link
                className="particles-card"
                to="/particles/$particleId"
                params={{ particleId: lesson.id }}
              >
                <span className="particles-card__glyph" lang="ja">
                  {lesson.glyph}
                </span>
                <div className="particles-card__copy">
                  <span className="particles-eyebrow">
                    {String(index + 1).padStart(2, "0")} · {lesson.reading} ·
                    About {lesson.minutes} min
                  </span>
                  <Text as="h3" variant="heading">
                    {lesson.role}
                  </Text>
                  <Text as="span" color="secondary">
                    {lesson.summary}
                  </Text>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </Stack>
  );
}
