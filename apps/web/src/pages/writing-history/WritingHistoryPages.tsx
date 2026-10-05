import { Outlet, useParams } from "@tanstack/react-router";
import { getWritingHistoryChapter } from "@opennihongo/content";
import { HistoryOverview } from "../../features/writing-history/HistoryOverview";
import { HistoryReader } from "../../features/writing-history/HistoryReader";
import { WritingHistoryProgressProvider } from "../../features/writing-history/progress/ProgressProvider";
import { NotFoundPage } from "../NotFoundPage";
import "../../features/writing-history/writing-history.css";

export function WritingHistorySectionPage() {
  return (
    <WritingHistoryProgressProvider>
      <Outlet />
    </WritingHistoryProgressProvider>
  );
}
export function WritingHistoryOverviewPage() {
  return <HistoryOverview />;
}
export function WritingHistoryChapterPage() {
  const { chapterId } = useParams({ from: "/writing-history/$chapterId" });
  const chapter = getWritingHistoryChapter(chapterId);
  return chapter ? <HistoryReader chapter={chapter} /> : <NotFoundPage />;
}
