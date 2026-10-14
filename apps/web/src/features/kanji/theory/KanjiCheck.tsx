import { useId, useRef, useState } from "react";
import type { KanjiId, KanjiTheoryCheck } from "@opennihongo/content";
import { Button, Stack, Surface, Text } from "@opennihongo/ui";

export function KanjiCheck({ check }: { check: KanjiTheoryCheck }) {
  const titleId = useId();
  const choices = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<KanjiId | null>(null);
  const selected = check.options.find(({ id }) => id === selectedId);

  return (
    <section aria-labelledby={titleId}>
      <Surface className="kanji-theory__unit">
        <Stack gap="4">
          <Text as="h3" variant="heading" id={titleId}>
            {check.title}
          </Text>
          <Text>{check.prompt}</Text>
          <div className="kanji-theory__choices" ref={choices}>
            {check.options.map((option) => (
              <Button
                key={option.id}
                variant="secondary"
                aria-pressed={selectedId === option.id}
                onClick={() => {
                  setSelectedId(option.id);
                }}
              >
                <span lang={check.kind === "reading" ? "ja" : "en"}>
                  {option.label}
                </span>
              </Button>
            ))}
          </div>
          {selected && (
            <div role="status" className="kanji-theory__feedback">
              <Text variant="label">
                {selectedId === check.correctOptionId
                  ? "That fits"
                  : "Try another answer"}
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
                  choices.current?.querySelector("button")?.focus();
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
