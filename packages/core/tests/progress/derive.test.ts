import { describe, expect, it } from "vitest";
import { deriveItemProgress } from "../../src/index";
import { record } from "./fixtures";

describe("item progress from immutable evidence", () => {
  const baseline = {
    itemId: "kana.hiragana.a",
    correctCount: 3,
    incorrectCount: 2,
    lastPracticedAt: "2026-09-01T00:00:00.000Z",
  };
  it("derives all items and combines irrecoverable baseline totals", () => {
    expect(deriveItemProgress([record()], [baseline])).toEqual([
      {
        itemId: "kana.hiragana.a",
        correctCount: 4,
        incorrectCount: 2,
        completedCount: 6,
        lastPracticedAt: "2026-10-03T12:00:00.000Z",
      },
      {
        itemId: "word.cat",
        correctCount: 0,
        incorrectCount: 1,
        completedCount: 1,
        lastPracticedAt: "2026-10-03T12:00:00.000Z",
      },
    ]);
  });
  it("counts repeated completions, not the exercise's interaction count", () => {
    const second = record({
      id: "record-2",
      occurredAt: "2026-10-02T12:00:00.000Z",
    });
    const expected = deriveItemProgress([record(), second]);
    expect(expected).toEqual(deriveItemProgress([second, record()]));
    expect(expected[0]).toMatchObject({
      correctCount: 2,
      completedCount: 2,
      lastPracticedAt: record().occurredAt,
    });
  });
  it("orders item identities consistently across input item order", () => {
    expect(
      deriveItemProgress([
        record({
          result: {
            ...record().result,
            sourceItemResults: [...record().result.sourceItemResults].reverse(),
          },
        }),
      ]),
    ).toEqual(deriveItemProgress([record()]));
  });
  it("does not double count identical records and rejects conflicting IDs", () => {
    expect(deriveItemProgress([record(), record()])).toEqual(
      deriveItemProgress([record()]),
    );
    expect(() =>
      deriveItemProgress([record(), record({ sessionId: "other" })]),
    ).toThrow("Conflicting learning record");
  });
  it("retains newer baseline activity and normalizes timestamp offsets", () => {
    expect(
      deriveItemProgress(
        [record()],
        [{ ...baseline, lastPracticedAt: "2027-01-01T01:00:00+01:00" }],
      )[0]?.lastPracticedAt,
    ).toBe("2027-01-01T00:00:00.000Z");
    expect(deriveItemProgress([], [baseline])[0]?.completedCount).toBe(5);
    expect(deriveItemProgress([])).toEqual([]);
  });
  it("rejects duplicate baseline identities and unsafe counter totals", () => {
    expect(() => deriveItemProgress([], [baseline, baseline])).toThrow(
      "Duplicate item progress baseline",
    );
    expect(() =>
      deriveItemProgress(
        [record()],
        [
          {
            ...baseline,
            correctCount: Number.MAX_SAFE_INTEGER,
            incorrectCount: 0,
          },
        ],
      ),
    ).toThrow("Progress counts exceed");
  });
});
