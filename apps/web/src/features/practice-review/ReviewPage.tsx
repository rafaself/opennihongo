import { useEffect, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { loadLearningHistory } from "@opennihongo/persistence";
import { selectReadingReview, type ReadingReviewItem } from "@opennihongo/core";
import { kanaCharacterCharts, kanjiThemes } from "@opennihongo/content";
import { Button } from "@opennihongo/ui";
import { readingItems, readingProfiles, findReadingItem } from "./catalog";
import "./readingReview.css";
const reasons = {
  incorrect: "Latest reading was incorrect",
  skipped: "Skipped on the latest reading",
  assisted: "Correct with help requested",
  "historical-incorrect":
    "Historical incorrect result · skip and help details unavailable",
};
export function ReviewPage() {
  const search = useSearch({ from: "/practice/review" });
  const navigate = useNavigate();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    status: "loading" | "failed" | "ready";
    items: readonly ReadingReviewItem[];
  }>({ status: "loading", items: [] });
  useEffect(() => {
    let active = true;
    void loadLearningHistory()
      .then(({ records }) => {
        const items = (["kana", "kanji"] as const).flatMap((subject) =>
          selectReadingReview(records, {
            profileId: readingProfiles[subject],
            eligibleItemIds: readingItems
              .filter((item) => item.subject === subject)
              .map(({ id }) => id),
          }),
        );
        if (active) setState({ status: "ready", items });
      })
      .catch(() => {
        if (active) setState({ status: "failed", items: [] });
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const selected = state.items
    .filter(
      ({ itemId }) =>
        search.reviewIds === undefined || search.reviewIds.includes(itemId),
    )
    .map(({ itemId }) => itemId);
  function toggle(id: string, checked: boolean) {
    void navigate({
      to: "/practice/review",
      replace: true,
      search: {
        ...search,
        reviewIds: checked
          ? [...selected, id]
          : selected.filter((item) => item !== id),
      },
    });
  }
  function start(subject: "kana" | "kanji") {
    const ids = selected.filter(
      (id) => findReadingItem(id)?.subject === subject,
    );
    if (subject === "kana")
      void navigate({
        to: "/practice/kana/reading",
        search: {
          scripts: ["hiragana", "katakana"],
          categories: kanaCharacterCharts.hiragana.sections.map(({ id }) => id),
          characterIds: ids,
          difficulty: "standard",
          fast: false,
          length: 20,
        },
      });
    else
      void navigate({
        to: "/practice/kanji/reading",
        search: {
          kanji: {
            themes: kanjiThemes.map(({ id }) => id),
            ids,
            difficulty: "standard",
            focus: "readings",
            fast: false,
            length: 20,
          },
        },
      });
  }
  return (
    <section aria-labelledby="reading-review-title" className="reading-review">
      <h1 id="reading-review-title">Review saved readings</h1>
      <p>
        Revisit mistakes, skipped items, and readings completed with help from
        your latest Kana and Kanji practice on this device.
      </p>
      {state.status === "loading" ? (
        <p role="status">Loading saved readings…</p>
      ) : state.status === "failed" ? (
        <>
          <p role="alert">
            Saved readings could not be loaded. Your saved history has not been
            changed.
          </p>
          <Button
            onClick={() => {
              setState({ status: "loading", items: [] });
              setRevision((value) => value + 1);
            }}
          >
            Retry loading
          </Button>
        </>
      ) : state.items.length === 0 ? (
        <>
          <h2>No readings to review yet</h2>
          <p>
            Try a beginner reading session. New mistakes, skipped readings, and
            readings completed with help will appear here.
          </p>
        </>
      ) : (
        <>
          <ul>
            {state.items.map((entry) => {
              const item = findReadingItem(entry.itemId);
              if (!item) return null;
              return (
                <li key={entry.itemId}>
                  <label>
                    <input
                      type="checkbox"
                      checked={selected.includes(item.id)}
                      onChange={(event) => {
                        toggle(item.id, event.target.checked);
                      }}
                    />
                    <span>
                      <strong lang="ja">{item.prompt}</strong>
                      <span>
                        {item.subject === "kana" ? "Kana" : "Kanji"} ·{" "}
                        {item.reading}
                      </span>
                      <small>{reasons[entry.reason]}</small>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <div className="reading-review__actions">
            {(["kana", "kanji"] as const).map((subject) => {
              const count = selected.filter(
                (id) => findReadingItem(id)?.subject === subject,
              ).length;
              return (
                <Button
                  key={subject}
                  disabled={count === 0}
                  onClick={() => {
                    start(subject);
                  }}
                >
                  Practise selected {subject === "kana" ? "Kana" : "Kanji"} (
                  {count})
                </Button>
              );
            })}
          </div>
          <p className="reading-review__note">
            Selections stay in this page’s address when you reload. Each review
            session contains up to 20 selected readings.
          </p>
        </>
      )}
      <p className="reading-review__note">
        A correct reading without help removes an item from this list. Older
        results may not identify skips or requested help.
      </p>
      <Link className="ns-button" data-variant="secondary" to="/practice">
        Back to Practice
      </Link>
    </section>
  );
}
