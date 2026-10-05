import { useId, useState } from "react";
import {
  getParticleLesson,
  type ParticleExample,
  type ParticleLesson,
} from "@opennihongo/content";
import {
  Button,
  SegmentedControl,
  Stack,
  Surface,
  Text,
} from "@opennihongo/ui";

function Sentence({
  example,
  lessonId,
}: {
  example: ParticleExample;
  lessonId: string;
}) {
  const [selection, setSelection] = useState(() =>
    example.tokens.findIndex(
      (token) => typeof token !== "string" && token.particleId === lessonId,
    ),
  );
  const [showReading, setShowReading] = useState(false);
  const readingId = useId();
  const selected = example.tokens[selection];
  const particle =
    typeof selected === "object"
      ? getParticleLesson(selected.particleId)
      : undefined;

  return (
    <Stack gap="5">
      <Text color="secondary">{example.context}</Text>
      <div
        className="particles-sentence"
        lang="ja"
        aria-label="Japanese sentence"
      >
        {example.tokens.map((token, index) =>
          typeof token === "string" ? (
            <span key={index}>{token}</span>
          ) : (
            <button
              type="button"
              key={index}
              aria-label={`Explore ${token.text}`}
              aria-pressed={index === selection}
              className="particles-token"
              onClick={() => {
                setSelection(index);
              }}
            >
              {token.text}
            </button>
          ),
        )}
      </div>
      <Text>{example.translation}</Text>
      <div>
        <Button
          variant="secondary"
          aria-expanded={showReading}
          aria-controls={readingId}
          onClick={() => {
            setShowReading((visible) => !visible);
          }}
        >
          {showReading ? "Hide reading" : "Show reading"}
        </Button>
        <div id={readingId}>
          {showReading && (
            <Text className="particles-reading" color="secondary">
              {example.reading}
            </Text>
          )}
        </div>
      </div>
      <div
        role="group"
        aria-label="Particle explanation"
        className="particles-explanation"
        aria-live="polite"
      >
        {typeof selected === "object" && particle && (
          <div key={selection} className="particles-reveal">
            <Text variant="label">
              <span lang="ja">{particle.glyph}</span> · {particle.reading}
            </Text>
            <Text>{selected.explanation}</Text>
          </div>
        )}
      </div>
    </Stack>
  );
}

export function SentenceExplorer({ lesson }: { lesson: ParticleLesson }) {
  const [exampleIndex, setExampleIndex] = useState("0");
  const example = lesson.examples[Number(exampleIndex)];
  return (
    <Surface className="particles-unit">
      <Stack gap="5">
        <Text variant="heading">A particle in its sentence</Text>
        <Text color="secondary">
          Select a highlighted particle to see its job.
        </Text>
        <SegmentedControl
          aria-label="Choose a sentence"
          value={exampleIndex}
          onValueChange={setExampleIndex}
          options={lesson.examples.map(({ label }, index) => ({
            label,
            value: String(index),
          }))}
        />
        {example && (
          <Sentence key={example.id} example={example} lessonId={lesson.id} />
        )}
      </Stack>
    </Surface>
  );
}
