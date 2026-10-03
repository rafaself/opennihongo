import { readAppPreferences } from "../../app/preferences";
import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CardStackView } from "../../views/practice/cards/CardStackView";
import {
  getKanaCards,
  getWordCards,
} from "../../views/practice/cards/cardStackContent";
import { getKanaPracticeSummary } from "../../views/practice/session/kanaPracticeContent";
import { kanaPracticeConfigurationId } from "../../views/practice/session/createKanaPracticeSession";

export function CardStackPage({ subject }: { subject: "kana" | "words" }) {
  const search = useSearch({
    from: subject === "kana" ? "/practice/kana/cards" : "/practice/words/cards",
  });
  const navigate = useNavigate();
  const showRomaji = readAppPreferences().showRomaji;
  const items = useMemo(
    () =>
      subject === "kana" ? getKanaCards(search) : getWordCards(showRomaji),
    [subject, search, showRomaji],
  );
  const collectionId =
    subject === "kana"
      ? `kana:${kanaPracticeConfigurationId(search)}`
      : "words:beginner";
  return (
    <CardStackView
      key={collectionId}
      collectionId={collectionId}
      items={items}
      search={search}
      title={subject === "kana" ? "Kana cards" : "Word cards"}
      {...(subject === "kana"
        ? {
            difficulty: search.difficulty,
            length: getKanaPracticeSummary("cards", search).count,
            onChangeOptions: () => {
              void navigate({
                to: "/practice/kana/$game/setup",
                params: { game: "cards" },
                search,
              });
            },
          }
        : {})}
    />
  );
}
