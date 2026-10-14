import { beginnerKanji, type KanjiPracticeGame } from "@opennihongo/content";
import { normalizeJapaneseReading } from "@opennihongo/core";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ExercisePracticeView } from "../../../views/practice/interaction/ExercisePracticeView";
import { CardStackView } from "../../../views/practice/cards/CardStackView";
import { readAppPreferences } from "../../../app/preferences";
import {
  createKanjiSession,
  getKanjiCards,
} from "../../../features/kanji/session/createKanjiSession";
import {
  normalizeKanjiSearch,
  kanjiConfigurationId,
  getKanjiSummary,
} from "../../../features/kanji/session/options";
import { useMemo } from "react";
import "../../../features/kanji/kanji.css";

export function KanjiPracticePage({ game }: { game: KanjiPracticeGame }) {
  const from =
    game === "reading"
      ? "/practice/kanji/reading"
      : game === "matching"
        ? "/practice/kanji/matching"
        : game === "quiz"
          ? "/practice/kanji/quiz"
          : "/practice/kanji/cards";
  const search = useSearch({ from });
  const options = useMemo(
    () => normalizeKanjiSearch(search.kanji),
    [search.kanji],
  );
  const navigate = useNavigate();
  const onChangeOptions = () => {
    void navigate({
      to: "/practice/kanji/$game/setup",
      params: { game },
      search,
    });
  };
  const showRomaji = readAppPreferences().showRomaji;
  const cards = useMemo(
    () => getKanjiCards(options, showRomaji),
    [options, showRomaji],
  );
  const configurationId = `kanji:${game}:${kanjiConfigurationId(options)}`;
  if (game === "cards")
    return (
      <CardStackView
        key={configurationId}
        collectionId={configurationId}
        title="Kanji cards"
        items={cards}
        search={search}
        difficulty={options.difficulty}
        length={getKanjiSummary(game, options).count}
        onChangeOptions={onChangeOptions}
      />
    );
  return (
    <ExercisePracticeView
      className="kanji-session"
      key={configurationId}
      reading={game === "reading"}
      difficulty={options.difficulty}
      fast={game === "quiz" && options.fast}
      search={search}
      createSession={(revision, sessionId) =>
        createKanjiSession(game, options, revision, sessionId)
      }
      normalizeAnswer={normalizeJapaneseReading}
      scriptLabel="Kanji"
      onChangeOptions={onChangeOptions}
      presentation={(exercise) => {
        const item = beginnerKanji.find(
          ({ id }) => id === exercise.sourceItemIds[0],
        );
        if (exercise.type === "matching")
          return {
            leftLabel: "English meanings",
            rightLabel: "Kanji characters",
          };
        const reading =
          exercise.type === "typed-answer" ||
          exercise.options.find(({ id }) => id === exercise.correctOptionId)
            ?.text === item?.example.reading;
        return {
          instruction:
            exercise.type === "typed-answer"
              ? "Read this word"
              : reading
                ? "Choose the word reading"
                : "Choose the Kanji meaning",
          inputLabel: `Type the Kana or romaji reading for ${exercise.prompt.text}`,
          ...(reading && item ? { supportingText: item.example.meaning } : {}),
          ...(item ? { speechText: item.example.pronunciation.text } : {}),
        };
      }}
    />
  );
}
