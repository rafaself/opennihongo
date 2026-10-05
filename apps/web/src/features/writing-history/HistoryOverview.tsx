import { Link } from "@tanstack/react-router";
import { Progress, Surface } from "@opennihongo/ui";
import { writingHistoryChapters } from "@opennihongo/content";
import { useWritingHistoryProgress } from "./progress/ProgressProvider";
import {
  getHistoryResumeChapter,
  getKnownHistoryCompletions,
} from "./progress/resume";

export function HistoryOverview() {
  const { progress, ready } = useWritingHistoryProgress();
  const completed = getKnownHistoryCompletions(progress);
  const resume = getHistoryResumeChapter(progress);
  const finished = completed.length === writingHistoryChapters.length;
  return (
    <section aria-labelledby="history-overview-title">
      <header className="history-intro">
        <p className="history-eyebrow">Before you learn the characters</p>
        <h1 id="history-overview-title">Japanese writing system history</h1>
        <p>
          How did one language come to use kanji, hiragana, and katakana
          together? Follow the connections in {writingHistoryChapters.length}{" "}
          short visual chapters.
        </p>
        <p>
          Explore at your own pace. Every chapter is open, and there is nothing
          to memorize or pass.
        </p>
        <div aria-hidden="true" className="history-overview-glyphs" lang="ja">
          <span>安</span>
          <span>→</span>
          <span>あ</span>
          <span>加</span>
          <span>→</span>
          <span>カ</span>
        </div>
      </header>
      <Surface className="history-course-progress" elevation="card">
        <div>
          <h2>
            {finished
              ? `All ${String(writingHistoryChapters.length)} chapters read`
              : "Your reading journey"}
          </h2>
          <p>
            {completed.length} of {writingHistoryChapters.length} chapters read
          </p>
          <Progress
            aria-label="Chapters read"
            value={completed.length}
            max={writingHistoryChapters.length}
          />
        </div>
        {ready && (
          <Link
            className="ns-button"
            data-variant="primary"
            to="/writing-history/$chapterId"
            params={{ chapterId: resume.id }}
          >
            {finished
              ? "Revisit history"
              : progress.lastChapterId !== null || completed.length > 0
                ? "Continue reading"
                : "Start reading"}
          </Link>
        )}
      </Surface>
      <ol className="history-chapter-list">
        {writingHistoryChapters.map((chapter, index) => (
          <li key={chapter.id}>
            <Link
              className="history-chapter-card"
              to="/writing-history/$chapterId"
              params={{ chapterId: chapter.id }}
            >
              <span className="history-chapter-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2>{chapter.title}</h2>
                <p>{chapter.summary}</p>
                <span className="history-caption">
                  {chapter.durationMinutes.min}–{chapter.durationMinutes.max}{" "}
                  min ·{" "}
                  {completed.includes(chapter.id) ? "Read" : "Ready to explore"}
                </span>
              </div>
              <span aria-hidden="true" className="history-chapter-open">
                →
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
