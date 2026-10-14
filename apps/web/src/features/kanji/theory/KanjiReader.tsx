import {
  kanjiTheoryCharacters,
  type KanjiTheoryCharacter,
} from "@opennihongo/content";
import { Stack, Surface, Text } from "@opennihongo/ui";
import { Link } from "@tanstack/react-router";
import { readAppPreferences } from "../../../app/preferences";
import { KanjiSources } from "./KanjiSources";
import { KanjiCheck } from "./KanjiCheck";

export function KanjiReader({ lesson }: { lesson: KanjiTheoryCharacter }) {
  const { character } = lesson;
  const index = kanjiTheoryCharacters.findIndex(
    (entry) => entry.character.id === character.id,
  );
  const previous = kanjiTheoryCharacters[index - 1]?.character;
  const next = kanjiTheoryCharacters[index + 1]?.character;
  const { showRomaji } = readAppPreferences();

  return (
    <Stack className="kanji-theory kanji-theory--reader" gap="8">
      <header>
        <Link className="kanji-theory__back" to="/kanji">
          All Kanji
        </Link>
        <Text color="secondary" variant="label">
          Character {index + 1} of {kanjiTheoryCharacters.length}
        </Text>
        <Text variant="display">
          <span lang="ja">{character.glyph}</span> · {character.meaning}
        </Text>
      </header>
      <section aria-labelledby="kanji-readings-title">
        <Surface className="kanji-theory__unit">
          <Stack gap="4">
            <Text id="kanji-readings-title" variant="heading">
              Common readings
            </Text>
            <dl className="kanji-theory__readings">
              <div>
                <dt>On readings · 音読み</dt>
                <dd lang="ja">{character.onReadings.join(" · ")}</dd>
              </div>
              <div>
                <dt>Kun readings · 訓読み</dt>
                <dd lang="ja">{character.kunReadings.join(" · ")}</dd>
              </div>
            </dl>
            <Text color="secondary">
              These are common reference readings. The word determines which
              reading you use; the list is not exhaustive.
            </Text>
          </Stack>
        </Surface>
      </section>
      <section aria-labelledby="kanji-word-title">
        <Surface className="kanji-theory__unit">
          <Stack gap="4">
            <Text id="kanji-word-title" variant="heading">
              A word to remember
            </Text>
            <Text as="p" className="kanji-theory__word">
              <span lang="ja">{character.example.text}</span>
            </Text>
            <Text as="p" lang="ja">
              {character.example.reading}
            </Text>
            {showRomaji && (
              <Text as="p" color="secondary">
                {character.example.romaji}
              </Text>
            )}
            <Text>{character.example.meaning}</Text>
            <Text color="secondary">
              Learn this whole word together with its reading and meaning.
            </Text>
          </Stack>
        </Surface>
      </section>
      <section aria-labelledby="kanji-checks-title">
        <Stack gap="5">
          <div>
            <Text variant="heading" id="kanji-checks-title">
              Try the idea
            </Text>
            <Text variant="caption" color="secondary" as="p">
              Optional · No scores or saved results
            </Text>
          </div>
          {lesson.checks.map((check) => (
            <KanjiCheck key={check.kind} check={check} />
          ))}
        </Stack>
      </section>
      <Link
        className="ns-button"
        data-variant="secondary"
        to="/practice/kanji/$game/setup"
        params={{ game: "reading" }}
        search={{
          kanji: {
            themes: [character.theme],
            ids: [character.id],
            difficulty: "easy",
            focus: "readings",
            fast: false,
          },
        }}
      >
        Practice this character
      </Link>
      <KanjiSources />
      <nav
        className="kanji-theory__navigation"
        aria-label="Kanji characters navigation"
      >
        {previous && (
          <Link
            className="ns-button"
            data-variant="secondary"
            to="/kanji/$kanjiId"
            params={{ kanjiId: previous.id }}
          >
            Previous: <span lang="ja">{previous.glyph}</span>
          </Link>
        )}
        {next ? (
          <Link
            className="ns-button"
            data-variant="primary"
            to="/kanji/$kanjiId"
            params={{ kanjiId: next.id }}
          >
            Next: <span lang="ja">{next.glyph}</span>
          </Link>
        ) : (
          <Link className="ns-button" data-variant="primary" to="/practice">
            Explore Kanji practice
          </Link>
        )}
      </nav>
    </Stack>
  );
}
