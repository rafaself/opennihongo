import { describe, expect, it } from "vitest";
import { selectReadingReview, type LearningRecord } from "../../src/index";
import { record } from "../progress/fixtures";

const options = { profileId: "reading", eligibleItemIds: ["kana.a", "kana.i"] };
function completion(
  id: string,
  outcome: "correct" | "incorrect",
  response: "answered" | "skipped" = "answered",
  assistance: "none" | "hint" | "audio" | "hint-and-audio" = "none",
): LearningRecord {
  return record({
    id,
    profileId: "reading",
    result: {
      exerciseId: id,
      attempts: 1,
      outcome,
      sourceItemResults: [{ sourceItemId: "kana.a", outcome }],
    },
    evidence: {
      exerciseType: "typed-answer",
      items: [{ sourceItemId: "kana.a", response, assistance }],
    },
  });
}
describe("reading review evidence", () => {
  it.each([
    ["incorrect", "answered", "none", "incorrect"],
    ["incorrect", "skipped", "audio", "skipped"],
    ["correct", "answered", "hint", "assisted"],
    ["correct", "answered", "audio", "assisted"],
    ["correct", "answered", "hint-and-audio", "assisted"],
  ] as const)(
    "explains %s / %s / %s",
    (outcome, response, assistance, reason) => {
      expect(
        selectReadingReview(
          [completion("one", outcome, response, assistance)],
          options,
        ),
      ).toEqual([
        {
          itemId: "kana.a",
          reason,
          lastPracticedAt: "2026-10-03T12:00:00.000Z",
        },
      ]);
    },
  );
  it("uses latest evidence independently of load order and deduplicates identity", () => {
    const wrong = completion("one", "incorrect");
    const right = {
      ...completion("two", "correct"),
      occurredAt: "2026-10-04T12:00:00Z",
    };
    expect(selectReadingReview([right, wrong, wrong], options)).toEqual([]);
    expect(selectReadingReview([wrong, right], options)).toEqual([]);
  });
  it("resolves equal timestamps by record identity deterministically", () => {
    expect(
      selectReadingReview(
        [completion("a", "correct"), completion("b", "incorrect")],
        options,
      )[0]?.reason,
    ).toBe("incorrect");
    expect(
      selectReadingReview(
        [completion("b", "incorrect"), completion("a", "correct")],
        options,
      )[0]?.reason,
    ).toBe("incorrect");
  });
  it("preserves uncertainty in historical incorrect records", () => {
    const input = completion("one", "incorrect");
    const legacy = { ...input };
    delete legacy.evidence;
    expect(selectReadingReview([legacy], options)[0]?.reason).toBe(
      "historical-incorrect",
    );
    expect(
      selectReadingReview(
        [
          {
            ...legacy,
            result: {
              ...legacy.result,
              outcome: "correct",
              sourceItemResults: [
                { sourceItemId: "kana.a", outcome: "correct" },
              ],
            },
          },
        ],
        options,
      ),
    ).toEqual([]);
  });
  it("ignores other profiles, removed content and self reported recall", () => {
    const input = completion("one", "incorrect");
    expect(
      selectReadingReview([{ ...input, profileId: "other" }], options),
    ).toEqual([]);
    expect(
      selectReadingReview([input], { ...options, eligibleItemIds: [] }),
    ).toEqual([]);
    expect(
      selectReadingReview(
        [
          {
            ...input,
            evidence: {
              exerciseType: "flashcard",
              items: [
                {
                  sourceItemId: "kana.a",
                  response: "self-reported",
                  assistance: "none",
                },
              ],
            },
          },
        ],
        options,
      ),
    ).toEqual([]);
  });
  it("sorts oldest evidence first with a stable item tie break", () => {
    const a = completion("one", "incorrect");
    const i = {
      ...completion("two", "incorrect"),
      result: {
        ...a.result,
        sourceItemResults: [
          { sourceItemId: "kana.i", outcome: "incorrect" as const },
        ],
      },
      evidence: {
        exerciseType: "typed-answer" as const,
        items: [
          {
            sourceItemId: "kana.i",
            response: "answered" as const,
            assistance: "none" as const,
          },
        ],
      },
    };
    expect(
      selectReadingReview([i, a], options).map((item) => item.itemId),
    ).toEqual(["kana.a", "kana.i"]);
    expect(
      selectReadingReview(
        [{ ...i, occurredAt: "2026-10-02T12:00:00Z" }, a],
        options,
      ).map((item) => item.itemId),
    ).toEqual(["kana.i", "kana.a"]);
  });
  it("rejects conflicting record identities", () => {
    expect(() =>
      selectReadingReview(
        [completion("one", "incorrect"), completion("one", "correct")],
        options,
      ),
    ).toThrow("Conflicting learning record identity");
  });
});
