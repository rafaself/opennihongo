import { Link } from "@tanstack/react-router";
import { Stack, Surface, Text } from "@opennihongo/ui";
import { writingHistoryChapters } from "@opennihongo/content";
import "./WelcomeView.css";

const learningPaths = [
  {
    id: "history",
    glyph: "文",
    title: "Discover the story",
    description:
      "Why does Japanese have more than one writing system? Follow the story behind the characters.",
    detail: `${String(writingHistoryChapters.length)} short chapters · No quizzes`,
    action: "Explore writing history",
    to: "/writing-history",
  },
  {
    id: "kana",
    glyph: "あ",
    title: "Meet the characters",
    description:
      "Get to know hiragana and katakana. Explore their shapes and listen to how they sound.",
    detail: "Hiragana & katakana · A sound at a time",
    action: "Explore the Kana chart",
    to: "/kana",
  },
  {
    id: "practice",
    glyph: "語",
    title: "Make it stick",
    description:
      "Turn a little curiosity into a little confidence, with short sessions that fit your day.",
    detail: "Characters & words · At your own pace",
    action: "Start practicing",
    to: "/practice",
  },
] as const;

export function WelcomeView() {
  return (
    <div className="welcome-home">
      <section aria-labelledby="welcome-title" className="welcome-hero">
        <Stack className="welcome-copy" gap="6">
          <div className="welcome-greeting">
            <span className="welcome-greeting__japanese" lang="ja">
              こんにちは
            </span>
            <Text color="secondary" variant="label">
              Hello, and welcome
            </Text>
          </div>
          <Text className="welcome-title" id="welcome-title" variant="display">
            <span>A little Japanese.</span> <span>A little every day.</span>
          </Text>
          <Text className="welcome-introduction" color="secondary">
            Every character has a story. Every small step counts. Make yourself
            at home, follow your curiosity, and find your way into Japanese.
          </Text>
          <p className="welcome-reassurance">
            <span aria-hidden="true" />
            Your pace. Your own little learning space.
          </p>
        </Stack>

        <div aria-hidden="true" className="welcome-illustration">
          <div className="welcome-sun" />
          <img
            alt=""
            className="welcome-kitsune"
            height="108"
            src={`${import.meta.env.BASE_URL}kitsune.svg`}
            width="108"
          />
          <div className="welcome-kana-paper">
            <span className="welcome-paper-label" lang="ja">
              ひらがな
            </span>
            <span className="welcome-paper-glyph" lang="ja">
              あ
            </span>
            <span className="welcome-paper-reading">a</span>
          </div>
          <span className="welcome-seal" lang="ja">
            日本語
          </span>
          <span className="welcome-illustration-caption">
            It all starts with a little あ.
          </span>
        </div>
      </section>

      <section aria-labelledby="welcome-paths-title" className="welcome-paths">
        <div className="welcome-paths__heading">
          <Text id="welcome-paths-title" variant="heading">
            Find your first step
          </Text>
          <Text color="secondary" variant="label" as="p">
            Start wherever you feel comfortable.
          </Text>
        </div>
        <ol aria-label="Ways to learn" className="welcome-path-list">
          {learningPaths.map((path, index) => (
            <li key={path.id}>
              <Surface className="welcome-path" elevation="interactive">
                <div className="welcome-path__top">
                  <span className="welcome-path__number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  {path.id === "history" && (
                    <span className="welcome-path__suggestion">Start here</span>
                  )}
                  <span
                    aria-hidden="true"
                    className="welcome-path__glyph"
                    lang="ja"
                  >
                    {path.glyph}
                  </span>
                </div>
                <Text as="h3" className="welcome-path__title" variant="heading">
                  {path.title}
                </Text>
                <Text className="welcome-path__description" color="secondary">
                  {path.description}
                </Text>
                <Text
                  className="welcome-path__detail"
                  color="secondary"
                  variant="caption"
                >
                  {path.detail}
                </Text>
                <Link
                  className="ns-button welcome-path__action"
                  data-variant={path.id === "history" ? "primary" : "secondary"}
                  to={path.to}
                >
                  {path.action}
                </Link>
              </Surface>
            </li>
          ))}
        </ol>
      </section>
      <Surface className="welcome-kanji">
        <span className="welcome-kanji__glyph" lang="ja" aria-hidden="true">
          漢
        </span>
        <Stack gap="2">
          <Text variant="heading">Find meaning in the characters</Text>
          <Text color="secondary">
            Meet 30 beginner Kanji through their shapes, readings, and everyday
            words.
          </Text>
        </Stack>
        <Link className="ns-button" data-variant="secondary" to="/kanji">
          Explore Kanji
        </Link>
      </Surface>
      <Surface className="welcome-particles">
        <span className="welcome-particles__glyph" lang="ja" aria-hidden="true">
          は
        </span>
        <Stack gap="2">
          <Text variant="heading">Ready to connect the words?</Text>
          <Text color="secondary">
            Meet the small particles that help Japanese sentences make sense.
          </Text>
        </Stack>
        <Link className="ns-button" data-variant="secondary" to="/particles">
          Explore Japanese particles
        </Link>
      </Surface>
    </div>
  );
}
