import {
  completeWritingHistoryChapter,
  loadWritingHistoryProgress,
  saveWritingHistoryPosition,
  type WritingHistoryProgress,
} from "@opennihongo/persistence";

type Repository = Readonly<{
  load: () => Promise<WritingHistoryProgress>;
  position: (id: string) => Promise<WritingHistoryProgress>;
  complete: (id: string) => Promise<WritingHistoryProgress>;
}>;
type Snapshot = Readonly<{
  progress: WritingHistoryProgress;
  ready: boolean;
  saving: boolean;
  error: "load" | "save" | null;
}>;

/** Keep optimistic reading state and retryable operations across chapter navigation. */
export function createWritingHistoryProgressStore(
  repository: Repository = {
    load: loadWritingHistoryProgress,
    position: saveWritingHistoryPosition,
    complete: completeWritingHistoryChapter,
  },
) {
  let snapshot: Snapshot = {
    progress: { lastChapterId: null, completedChapterIds: [] },
    ready: false,
    saving: false,
    error: null,
  };
  const listeners = new Set<() => void>();
  const queue: { kind: "position" | "complete"; chapterId: string }[] = [];
  let loaded = false;
  let loading: Promise<void> | undefined;
  let writing: Promise<void> | undefined;
  const update = (patch: Partial<Snapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => {
      listener();
    });
  };
  const merge = (saved: WritingHistoryProgress): WritingHistoryProgress => ({
    lastChapterId: snapshot.progress.lastChapterId ?? saved.lastChapterId,
    completedChapterIds: [
      ...new Set([
        ...snapshot.progress.completedChapterIds,
        ...saved.completedChapterIds,
      ]),
    ],
  });

  async function flush() {
    if (writing) return writing;
    if (!loaded || snapshot.error !== null || queue.length === 0) return;
    update({ saving: true });
    writing = Promise.resolve().then(async () => {
      try {
        for (let operation = queue[0]; operation; operation = queue[0]) {
          const saved = await repository[operation.kind](operation.chapterId);
          queue.shift();
          update({ progress: merge(saved) });
        }
      } catch {
        update({ error: "save" });
      } finally {
        writing = undefined;
        update({ saving: false });
      }
    });
    return writing;
  }
  function load(): Promise<void> {
    if (loading) return loading;
    if (loaded) return Promise.resolve();
    loading = Promise.resolve().then(async () => {
      try {
        const saved = await repository.load();
        loaded = true;
        update({ progress: merge(saved), ready: true, error: null });
      } catch {
        update({ ready: true, error: "load" });
      } finally {
        loading = undefined;
      }
    });
    return loading;
  }
  function enqueue(kind: "position" | "complete", chapterId: string) {
    update({
      progress: {
        lastChapterId: chapterId,
        completedChapterIds:
          kind === "complete"
            ? [
                ...new Set([
                  ...snapshot.progress.completedChapterIds,
                  chapterId,
                ]),
              ]
            : snapshot.progress.completedChapterIds,
      },
    });
    queue.push({ kind, chapterId });
    void flush();
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    load,
    visit: (chapterId: string) => {
      enqueue("position", chapterId);
    },
    markRead: (chapterId: string) => {
      enqueue("complete", chapterId);
    },
    async retry() {
      update({ error: null });
      await load();
      await flush();
    },
  };
}
