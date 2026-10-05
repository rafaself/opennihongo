import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@opennihongo/ui";
import {
  writingHistoryChapters,
  type HistoryChapter,
} from "@opennihongo/content";
import { HistoryUnitView } from "./components/HistoryUnitView";
import { useWritingHistoryProgress } from "./progress/ProgressProvider";
import { getKnownHistoryCompletions } from "./progress/resume";

export function HistoryReader({ chapter }: { chapter: HistoryChapter }) {
  const { progress, ready, visit, markRead } = useWritingHistoryProgress();
  const navigate = useNavigate();
  const index = writingHistoryChapters.findIndex(({ id }) => id === chapter.id);
  const previous = writingHistoryChapters[index - 1];
  const next = writingHistoryChapters[index + 1];
  const read = progress.completedChapterIds.includes(chapter.id);
  const finished =
    getKnownHistoryCompletions(progress).length ===
    writingHistoryChapters.length;
  useEffect(() => {
    if (ready) visit(chapter.id);
  }, [chapter.id, ready, visit]);
  return (
    <article aria-labelledby="history-chapter-title">
      <Link className="history-back-link" to="/writing-history">
        All chapters
      </Link>
      <header className="history-intro">
        <p className="history-eyebrow">
          Chapter {index + 1} of {writingHistoryChapters.length} ·{" "}
          {chapter.durationMinutes.min}–{chapter.durationMinutes.max} min
        </p>
        <h1 id="history-chapter-title">{chapter.title}</h1>
        <p>{chapter.summary}</p>
        {read && <p className="history-read-status">Chapter read</p>}
      </header>
      <div className="history-units">
        {chapter.units.map((unit) => (
          <HistoryUnitView key={`${chapter.id}-${unit.title}`} unit={unit} />
        ))}
      </div>
      <footer className="history-reader-footer">
        <nav aria-label="Chapter navigation">
          {previous && (
            <Link
              className="history-back-link"
              to="/writing-history/$chapterId"
              params={{ chapterId: previous.id }}
            >
              Previous chapter: {previous.title}
            </Link>
          )}
          {next && (
            <Link
              className="history-back-link"
              to="/writing-history/$chapterId"
              params={{ chapterId: next.id }}
            >
              Next chapter: {next.title}
            </Link>
          )}
        </nav>
        <Button
          disabled={!ready}
          onClick={() => {
            markRead(chapter.id);
            if (next)
              void navigate({
                to: "/writing-history/$chapterId",
                params: { chapterId: next.id },
              });
          }}
        >
          {next ? "Mark as read and continue" : "Mark as read"}
        </Button>
        {!next && (
          <section
            className="history-next-steps"
            aria-label="Next learning steps"
          >
            <h2>
              {finished
                ? `All ${String(writingHistoryChapters.length)} chapters read`
                : "Explore the characters next"}
            </h2>
            <p>
              You can revisit any chapter whenever a character’s history sparks
              your curiosity.
            </p>
            <Link className="ns-button" data-variant="primary" to="/kana">
              Explore the Kana chart
            </Link>
            <Link
              className="ns-button"
              data-variant="secondary"
              to="/practice/kana/vowels"
            >
              Start the first-vowels lesson
            </Link>
          </section>
        )}
      </footer>
    </article>
  );
}
