import { Card } from "@opennihongo/ui";
import { Link } from "@tanstack/react-router";
import type { PracticeSearch } from "../../../app/practiceSearch";

export function CardStackGameCard({
  count,
  search,
}: {
  count: number;
  search: PracticeSearch;
}) {
  return (
    <Card as="article" className="practice-hub__game">
      <span aria-hidden="true" className="practice-hub__art">
        <span lang="ja">ねこ</span>
        <span>↻</span>
      </span>
      <h3>Word cards</h3>
      <p>Recall each word’s meaning, flip the card, and rate your recall.</p>
      <p className="practice-hub__eyebrow">{count} cards · Recall and reveal</p>
      <Link
        className="ns-button practice-hub__play"
        data-variant="primary"
        to="/practice/words/cards"
        search={search}
      >
        Play word cards
      </Link>
    </Card>
  );
}
