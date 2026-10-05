import { useState } from "react";
import { getParticleLesson, type ParticleLesson } from "@opennihongo/content";
import { Button, Stack, Surface, Text } from "@opennihongo/ui";

export function ParticleCheck({ lesson }: { lesson: ParticleLesson }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = lesson.check.options.find(
    ({ particleId }) => particleId === selectedId,
  );
  return (
    <section aria-labelledby="particle-check-title">
      <Surface className="particles-unit">
        <Stack gap="5">
          <div>
            <Text variant="heading" id="particle-check-title">
              Try the idea
            </Text>
            <Text color="secondary" variant="caption" as="p">
              Optional · No scores or saved results
            </Text>
          </div>
          <Text>{lesson.check.prompt}</Text>
          <div className="particles-check-options">
            {lesson.check.options.map(({ particleId }) => {
              const particle = getParticleLesson(particleId);
              return (
                particle && (
                  <Button
                    key={particleId}
                    variant="secondary"
                    aria-pressed={selectedId === particleId}
                    onClick={() => {
                      setSelectedId(particleId);
                    }}
                  >
                    <span lang="ja">{particle.glyph}</span> ({particle.reading})
                  </Button>
                )
              );
            })}
          </div>
          {selected && (
            <div
              role="status"
              className="particles-feedback particles-reveal"
              key={selectedId}
            >
              <Text variant="label">
                {selectedId === lesson.id
                  ? "That fits"
                  : "Try another particle"}
              </Text>
              <Text>{selected.explanation}</Text>
            </div>
          )}
          {selected && (
            <div>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedId(null);
                }}
              >
                Try again
              </Button>
            </div>
          )}
        </Stack>
      </Surface>
    </section>
  );
}
