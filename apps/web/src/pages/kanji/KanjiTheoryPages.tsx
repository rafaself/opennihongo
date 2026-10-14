import { getKanjiTheoryCharacter } from "@opennihongo/content";
import { Outlet, useParams } from "@tanstack/react-router";
import { KanjiOverview } from "../../features/kanji/theory/KanjiOverview";
import { KanjiReader } from "../../features/kanji/theory/KanjiReader";
import { NotFoundPage } from "../NotFoundPage";
import "../../features/kanji/theory/kanjiTheory.css";

export function KanjiSectionPage() {
  return <Outlet />;
}
export function KanjiOverviewPage() {
  return <KanjiOverview />;
}
export function KanjiCharacterPage() {
  const { kanjiId } = useParams({ from: "/kanji/$kanjiId" });
  const lesson = getKanjiTheoryCharacter(kanjiId);
  return lesson ? (
    <KanjiReader key={lesson.character.id} lesson={lesson} />
  ) : (
    <NotFoundPage />
  );
}
