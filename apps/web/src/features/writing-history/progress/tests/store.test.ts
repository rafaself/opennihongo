import { describe, expect, it, vi } from "vitest";
import { createWritingHistoryProgressStore } from "../store";

function repository() {
  return {
    load: vi
      .fn()
      .mockResolvedValue({ lastChapterId: null, completedChapterIds: [] }),
    position: vi.fn().mockImplementation((id: string) =>
      Promise.resolve({
        lastChapterId: id,
        completedChapterIds: [],
      }),
    ),
    complete: vi.fn().mockImplementation((id: string) =>
      Promise.resolve({
        lastChapterId: id,
        completedChapterIds: [id],
      }),
    ),
  };
}

describe("reading progress coordination", () => {
  it("loads once, announces changes and keeps the latest visible position during saves", async () => {
    const adapter = repository();
    const store = createWritingHistoryProgressStore(adapter);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    await Promise.all([store.load(), store.load()]);
    expect(adapter.load).toHaveBeenCalledOnce();
    let finish: (value: {
      lastChapterId: string;
      completedChapterIds: string[];
    }) => void = () => {};
    adapter.position.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    store.visit("manyogana");
    store.markRead("manyogana");
    store.visit("hiragana");
    expect(store.getSnapshot().progress.lastChapterId).toBe("hiragana");
    await vi.waitFor(() => {
      expect(adapter.position).toHaveBeenCalledWith("manyogana");
    });
    finish({
      lastChapterId: "manyogana",
      completedChapterIds: ["adopting-kanji"],
    });
    await vi.waitFor(() => {
      expect(store.getSnapshot().saving).toBe(false);
    });
    expect(store.getSnapshot().progress).toEqual({
      lastChapterId: "hiragana",
      completedChapterIds: ["manyogana", "adopting-kanji"],
    });
    expect(adapter.complete).toHaveBeenCalledWith("manyogana");
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("retains failed saves and later operations until an explicit retry", async () => {
    const adapter = repository();
    const store = createWritingHistoryProgressStore(adapter);
    await store.load();
    adapter.complete.mockRejectedValueOnce(new Error("blocked"));
    store.markRead("before-writing");
    await vi.waitFor(() => {
      expect(store.getSnapshot().error).toBe("save");
    });
    store.visit("adopting-kanji");
    expect(store.getSnapshot().progress.completedChapterIds).toEqual([
      "before-writing",
    ]);
    expect(adapter.position).not.toHaveBeenCalled();
    await store.retry();
    expect(adapter.complete).toHaveBeenCalledTimes(2);
    expect(adapter.position).toHaveBeenCalledWith("adopting-kanji");
    expect(store.getSnapshot().error).toBeNull();
  });

  it("retries synchronous adapter failures without leaving a stale pending operation", async () => {
    const adapter = repository();
    adapter.load.mockImplementationOnce(() => {
      throw new Error("unavailable");
    });
    const store = createWritingHistoryProgressStore(adapter);
    await store.load();
    await store.retry();
    expect(store.getSnapshot().error).toBeNull();
    adapter.complete.mockImplementationOnce(() => {
      throw new Error("unavailable");
    });
    store.markRead("hiragana");
    await vi.waitFor(() => {
      expect(store.getSnapshot().error).toBe("save");
    });
    await store.retry();
    expect(adapter.complete).toHaveBeenCalledTimes(2);
    expect(store.getSnapshot()).toMatchObject({ saving: false, error: null });
  });

  it("retries a failed read before saving and merges existing completions", async () => {
    const adapter = repository();
    adapter.load.mockRejectedValueOnce(new Error("unavailable"));
    const store = createWritingHistoryProgressStore(adapter);
    await store.load();
    expect(store.getSnapshot()).toMatchObject({ ready: true, error: "load" });
    store.markRead("hiragana");
    adapter.load.mockResolvedValueOnce({
      lastChapterId: "katakana",
      completedChapterIds: ["manyogana"],
    });
    await store.retry();
    expect(store.getSnapshot().progress).toEqual({
      lastChapterId: "hiragana",
      completedChapterIds: ["hiragana", "manyogana"],
    });
    expect(adapter.complete).toHaveBeenCalledWith("hiragana");
  });
});
