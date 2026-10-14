import {
  kanjiCollections,
  kanjiThemes,
  kanjiTheoryIntroduction,
} from "@opennihongo/content";
import { Stack, Surface, Text } from "@opennihongo/ui";
import { Link } from "@tanstack/react-router";
import { KanjiSources } from "./KanjiSources";

export function KanjiOverview() {
  return (
    <Stack className="kanji-theory" gap="8">
      <header>
        <Text variant="label" color="secondary">
          Shapes, meanings, and words
        </Text>
        <Text variant="display">Kanji</Text>
        <Text color="secondary">{kanjiTheoryIntroduction.summary}</Text>
      </header>
      <Surface className="kanji-theory__unit">
        <Stack gap="4">
          <Text variant="heading">Learn a character through a word</Text>
          {kanjiTheoryIntroduction.paragraphs.map((paragraph) => (
            <Text key={paragraph}>{paragraph}</Text>
          ))}
          <Text variant="caption" color="secondary" as="p">
            A starter collection, not a complete curriculum. Explore in any
            order.
          </Text>
        </Stack>
      </Surface>
      {kanjiThemes.map((theme) => (
        <section key={theme.id} aria-labelledby={`kanji-theme-${theme.id}`}>
          <Text variant="heading" id={`kanji-theme-${theme.id}`}>
            {theme.label}
          </Text>
          <ul className="kanji-theory__catalog" aria-label={theme.label}>
            {kanjiCollections[theme.id].map((character) => (
              <li key={character.id}>
                <Link
                  className="kanji-theory__card"
                  to="/kanji/$kanjiId"
                  params={{ kanjiId: character.id }}
                  aria-label={`${character.glyph} · ${character.meaning}`}
                >
                  <span className="kanji-theory__glyph" lang="ja">
                    {character.glyph}
                  </span>
                  <span>{character.meaning}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <KanjiSources />
      <Link className="ns-button" data-variant="secondary" to="/practice">
        Explore Kanji practice
      </Link>
    </Stack>
  );
}
