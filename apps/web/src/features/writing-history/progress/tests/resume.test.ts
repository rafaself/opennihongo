import { describe, expect, it } from "vitest";
import { getHistoryResumeChapter, getKnownHistoryCompletions } from "../resume";

describe("reading resume selection", () => {
  it("starts at the first chapter and resolves an unfinished last position", () => {
    expect(
      getHistoryResumeChapter({ lastChapterId: null, completedChapterIds: [] })
        .id,
    ).toBe("before-writing");
    expect(
      getHistoryResumeChapter({
        lastChapterId: "manyogana",
        completedChapterIds: [],
      }).id,
    ).toBe("manyogana");
  });
  it("continues after the completed last chapter and wraps to missed chapters", () => {
    expect(
      getHistoryResumeChapter({
        lastChapterId: "hiragana",
        completedChapterIds: ["hiragana"],
      }).id,
    ).toBe("katakana");
    expect(
      getHistoryResumeChapter({
        lastChapterId: "modern-writing",
        completedChapterIds: ["modern-writing", "before-writing"],
      }).id,
    ).toBe("adopting-kanji");
  });
  it("ignores unknown saved IDs and revisits a finished track from the beginning", () => {
    const completed = [
      "before-writing",
      "adopting-kanji",
      "adapting-writing",
      "manyogana",
      "hiragana",
      "katakana",
      "multiple-scripts",
      "variation",
      "modern-writing",
    ];
    expect(
      getHistoryResumeChapter({
        lastChapterId: "removed",
        completedChapterIds: ["removed", "before-writing"],
      }).id,
    ).toBe("adopting-kanji");
    expect(
      getKnownHistoryCompletions({
        lastChapterId: null,
        completedChapterIds: ["removed", "hiragana", "hiragana"],
      }),
    ).toEqual(["hiragana"]);
    expect(
      getHistoryResumeChapter({
        lastChapterId: "modern-writing",
        completedChapterIds: completed,
      }).id,
    ).toBe("before-writing");
  });
});
