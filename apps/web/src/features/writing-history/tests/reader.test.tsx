import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "../../../app/router";
import { writingHistoryChapters } from "@opennihongo/content";

const storage = vi.hoisted(() => ({
  progress: {
    lastChapterId: null as string | null,
    completedChapterIds: [] as string[],
  },
  load: vi.fn(),
  position: vi.fn(),
  complete: vi.fn(),
}));
vi.mock("@opennihongo/persistence", () => ({
  loadWritingHistoryProgress: storage.load,
  saveWritingHistoryPosition: storage.position,
  completeWritingHistoryChapter: storage.complete,
  appendLearningRecord: vi.fn().mockResolvedValue(undefined),
  loadLearningHistory: vi
    .fn()
    .mockResolvedValue({ records: [], baselines: [] }),
}));
beforeEach(() => {
  storage.progress = { lastChapterId: null, completedChapterIds: [] };
  storage.load
    .mockReset()
    .mockImplementation(() => Promise.resolve(storage.progress));
  storage.position.mockReset().mockImplementation((id: string) => {
    storage.progress = { ...storage.progress, lastChapterId: id };
    return Promise.resolve(storage.progress);
  });
  storage.complete.mockReset().mockImplementation((id: string) => {
    storage.progress = {
      lastChapterId: id,
      completedChapterIds: [
        ...new Set([...storage.progress.completedChapterIds, id]),
      ],
    };
    return Promise.resolve(storage.progress);
  });
});
afterEach(cleanup);

describe("writing history reader", () => {
  it("revisits chapter one after all explicit completions and keeps direct URLs authoritative", async () => {
    const user = userEvent.setup();
    storage.progress = {
      lastChapterId: "hiragana",
      completedChapterIds: writingHistoryChapters.map(({ id }) => id),
    };
    render(<RouterProvider router={router} />);
    await router.navigate({ to: "/writing-history" });
    await screen.findByRole("link", { name: "Revisit history" });
    expect(screen.getByText("9 of 9 chapters read")).toBeTruthy();
    await user.click(screen.getByRole("link", { name: "Revisit history" }));
    await screen.findByRole("heading", {
      name: "Japanese before writing",
      level: 1,
    });
    await router.navigate({
      to: "/writing-history/$chapterId",
      params: { chapterId: "modern-writing" },
    });
    await screen.findByRole("heading", {
      name: "Modern Japanese writing",
      level: 1,
    });
    expect(
      screen.getByRole("heading", { name: "All 9 chapters read" }),
    ).toBeTruthy();
    expect(storage.complete).not.toHaveBeenCalled();
  });

  it("reports a failed initial load while allowing reading and restores it with Retry", async () => {
    const user = userEvent.setup();
    storage.load.mockRejectedValueOnce(new Error("unavailable"));
    storage.progress = {
      lastChapterId: "hiragana",
      completedChapterIds: ["before-writing", "future-chapter"],
    };
    render(<RouterProvider router={router} />);
    await router.navigate({
      to: "/writing-history/$chapterId",
      params: { chapterId: "variation" },
    });
    await screen.findByRole("alert");
    expect(
      screen.getByText(/Saved reading progress could not be loaded/),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name: "Variation and standardization",
        level: 1,
      }),
    ).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: "Retry saving progress" }),
    );
    await vi.waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
    expect(storage.progress.completedChapterIds).toEqual([
      "before-writing",
      "future-chapter",
    ]);
    await user.click(screen.getByRole("link", { name: "All chapters" }));
    await screen.findByText("1 of 9 chapters read");
    expect(
      screen
        .getByRole("link", { name: "Continue reading" })
        .getAttribute("href"),
    ).toContain("variation");
  });
  it("opens from Home and reads a chapter without automatically completing it", async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);
    await router.navigate({ to: "/" });
    await user.click(
      await screen.findByRole("link", { name: "Explore writing history" }),
    );
    await screen.findByRole("heading", {
      name: "Japanese writing system history",
      level: 1,
    });
    expect(screen.getByText("0 of 9 chapters read")).toBeTruthy();
    await user.click(screen.getByRole("link", { name: "Start reading" }));
    await screen.findByRole("heading", {
      name: "Japanese before writing",
      level: 1,
    });
    expect(storage.complete).not.toHaveBeenCalled();
    expect(document.title).toBe("Japanese before writing · OpenNihongo");
    expect(
      within(screen.getByRole("navigation", { name: "Primary navigation" }))
        .getByRole("link", { name: "Writing history" })
        .getAttribute("aria-current"),
    ).toBe("page");
    await user.click(
      screen.getByRole("button", { name: "Mark as read and continue" }),
    );
    await screen.findByRole("heading", {
      name: "Adopting Chinese characters",
      level: 1,
    });
    await user.click(screen.getByRole("link", { name: "All chapters" }));
    await screen.findByText("1 of 9 chapters read");
    expect(
      screen
        .getByRole("link", { name: "Continue reading" })
        .getAttribute("href"),
    ).toContain("adopting-kanji");
  });
  it("opens arbitrary chapter links, revisits freely and offers the character-learning paths", async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);
    await router.navigate({
      to: "/writing-history/$chapterId",
      params: { chapterId: "modern-writing" },
    });
    await screen.findByRole("heading", {
      name: "Modern Japanese writing",
      level: 1,
    });
    expect(
      screen
        .getByRole("link", { name: "Explore the Kana chart" })
        .getAttribute("href"),
    ).toBe("/kana");
    expect(
      screen
        .getByRole("link", { name: "Start the first-vowels lesson" })
        .getAttribute("href"),
    ).toBe("/practice/kana/vowels");
    await user.click(screen.getByRole("button", { name: "Mark as read" }));
    await screen.findByText("Chapter read");
    expect(screen.queryByText("All 9 chapters read")).toBeNull();
    await user.click(screen.getByRole("link", { name: /Previous chapter/ }));
    await screen.findByRole("heading", {
      name: "Variation and standardization",
      level: 1,
    });
    expect(storage.progress.completedChapterIds).toEqual(["modern-writing"]);
  });
  it("preserves failed completion across chapter navigation and retries", async () => {
    const user = userEvent.setup();
    render(<RouterProvider router={router} />);
    await router.navigate({
      to: "/writing-history/$chapterId",
      params: { chapterId: "before-writing" },
    });
    await screen.findByRole("button", { name: "Mark as read and continue" });
    storage.complete.mockRejectedValueOnce(new Error("unavailable"));
    await user.click(
      screen.getByRole("button", { name: "Mark as read and continue" }),
    );
    await screen.findByRole("heading", {
      name: "Adopting Chinese characters",
      level: 1,
    });
    await screen.findByRole("alert");
    await user.click(
      screen.getByRole("button", { name: "Retry saving progress" }),
    );
    await vi.waitFor(() => {
      expect(screen.queryByRole("alert")).toBeNull();
    });
    expect(storage.progress.completedChapterIds).toEqual(["before-writing"]);
  });
  it("uses the existing not-found page for unknown chapters", async () => {
    render(<RouterProvider router={router} />);
    await router.navigate({
      to: "/writing-history/$chapterId",
      params: { chapterId: "unknown" },
    });
    await screen.findByText("This page doesn't exist.");
  });
});
