import { describe, expect, it } from "vitest";
import {
  assertLearningRecord,
  assertItemProgressBaseline,
  createLearningRecord,
} from "../../src/index";
import { record } from "./fixtures";

describe("learning record boundary", () => {
  it("snapshots and freezes the completed result without mutating its input", () => {
    const input = record();
    const saved = createLearningRecord(input);
    expect(saved).toEqual(input);
    expect(saved).not.toBe(input);
    expect(saved.result).not.toBe(input.result);
    expect(Object.isFrozen(saved)).toBe(true);
    expect(Object.isFrozen(saved.result)).toBe(true);
    expect(Object.isFrozen(saved.result.sourceItemResults)).toBe(true);
    expect(Object.isFrozen(saved.result.sourceItemResults[0])).toBe(true);
  });

  it.each(["id", "sessionId", "profileId", "occurredAt"])(
    "rejects invalid %s",
    (key) => {
      expect(() => {
        assertLearningRecord({ ...record(), [key]: " " });
      }).toThrow("Invalid learning record");
    },
  );
  it.each([null, [], 1, {}])("rejects malformed records", (value) => {
    expect(() => {
      assertLearningRecord(value);
    }).toThrow("Invalid learning record");
  });
  it.each([
    null,
    { ...record().result, exerciseId: "" },
    { ...record().result, attempts: -1 },
    { ...record().result, attempts: 1.5 },
    { ...record().result, outcome: "unknown" },
    { ...record().result, sourceItemResults: [] },
    { ...record().result, sourceItemResults: null },
    { ...record().result, sourceItemResults: [null] },
    {
      ...record().result,
      sourceItemResults: [{ sourceItemId: "", outcome: "correct" }],
    },
    {
      ...record().result,
      sourceItemResults: [{ sourceItemId: "item", outcome: "partial" }],
    },
    {
      ...record().result,
      sourceItemResults: [
        { sourceItemId: "item", outcome: "correct" },
        { sourceItemId: "item", outcome: "incorrect" },
      ],
    },
    { ...record().result, outcome: "correct" },
  ])("rejects invalid or ambiguous results", (result) => {
    expect(() => {
      assertLearningRecord({ ...record(), result });
    }).toThrow("Invalid learning record");
  });
  it.each(["correct", "incorrect"] as const)(
    "accepts %s outcomes including zero-attempt skips",
    (outcome) => {
      expect(() => {
        assertLearningRecord(
          record({
            result: {
              exerciseId: "e",
              attempts: 0,
              outcome,
              sourceItemResults: [{ sourceItemId: "item", outcome }],
            },
          }),
        );
      }).not.toThrow();
    },
  );

  it.each([
    null,
    {},
    {
      itemId: "",
      correctCount: 0,
      incorrectCount: 0,
      lastPracticedAt: "2026-01-01",
    },
    {
      itemId: "item",
      correctCount: -1,
      incorrectCount: 0,
      lastPracticedAt: "2026-01-01",
    },
    {
      itemId: "item",
      correctCount: 0,
      incorrectCount: Infinity,
      lastPracticedAt: "2026-01-01",
    },
    {
      itemId: "item",
      correctCount: Number.MAX_SAFE_INTEGER,
      incorrectCount: 1,
      lastPracticedAt: "2026-01-01",
    },
    {
      itemId: "item",
      correctCount: 0,
      incorrectCount: 0,
      lastPracticedAt: "bad",
    },
  ])("rejects malformed baselines", (value) => {
    expect(() => {
      assertItemProgressBaseline(value);
    }).toThrow("Invalid item progress baseline");
  });
});
