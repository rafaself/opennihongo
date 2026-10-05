import { vi } from "vitest";

// Presentation tests isolate asynchronous device storage. Persistence is covered
// by repository integration tests and the browser record/reload journey.
vi.mock("@opennihongo/persistence", () => ({
  appendLearningRecord: vi.fn().mockResolvedValue(undefined),
  loadLearningHistory: vi
    .fn()
    .mockResolvedValue({ records: [], baselines: [] }),
  loadWritingHistoryProgress: vi
    .fn()
    .mockResolvedValue({ lastChapterId: null, completedChapterIds: [] }),
  saveWritingHistoryPosition: vi.fn().mockImplementation((chapterId: string) =>
    Promise.resolve({
      lastChapterId: chapterId,
      completedChapterIds: [],
    }),
  ),
  completeWritingHistoryChapter: vi
    .fn()
    .mockImplementation((chapterId: string) =>
      Promise.resolve({
        lastChapterId: chapterId,
        completedChapterIds: [chapterId],
      }),
    ),
}));
