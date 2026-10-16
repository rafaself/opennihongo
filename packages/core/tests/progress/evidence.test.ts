import { describe, expect, it } from "vitest";
import { assertLearningRecord, createLearningRecord } from "../../src/index";
import { record } from "./fixtures";

const items = [
  { sourceItemId: "kana.hiragana.a", response: "answered", assistance: "hint" },
  { sourceItemId: "word.cat", response: "skipped", assistance: "audio" },
] as const;
const evidence = { exerciseType: "typed-answer", items } as const;

describe("explicit completion evidence", () => {
  it("snapshots help requests and skips without changing correctness", () => {
    const input = { ...record(), evidence };
    const saved = createLearningRecord(input);
    expect(saved).toEqual(input);
    expect(saved.evidence).not.toBe(evidence);
    expect(saved.evidence?.items).not.toBe(items);
    expect(Object.isFrozen(saved.evidence)).toBe(true);
    expect(Object.isFrozen(saved.evidence?.items)).toBe(true);
    expect(Object.isFrozen(saved.evidence?.items[0])).toBe(true);
    expect(Object.isFrozen(items[0])).toBe(false);
  });

  it.each(["none", "hint", "audio", "hint-and-audio"] as const)(
    "accepts an answered reading with %s assistance",
    (assistance) => {
      expect(() => {
        assertLearningRecord({
          ...record(),
          evidence: {
            ...evidence,
            items: [{ ...items[0], assistance }, items[1]],
          },
        });
      }).not.toThrow();
    },
  );

  it("copies only documented evidence fields into saved history", () => {
    const extra = {
      ...evidence,
      items: [{ ...items[0], rawAnswer: "private input" }, items[1]],
    };
    expect(
      createLearningRecord({ ...record(), evidence: extra }).evidence,
    ).toEqual(evidence);
  });

  it("keeps self-reported recall separate from assessed answers", () => {
    const saved = createLearningRecord({
      ...record(),
      evidence: {
        exerciseType: "flashcard",
        items: items.map((item) => ({
          ...item,
          response: "self-reported" as const,
        })),
      },
    });
    expect(saved.evidence?.items.map((item) => item.response)).toEqual([
      "self-reported",
      "self-reported",
    ]);
  });

  it.each(["matching", "multiple-choice"] as const)(
    "supports explicit answered and skipped items in %s",
    (exerciseType) => {
      expect(() => {
        assertLearningRecord({
          ...record(),
          evidence: { ...evidence, exerciseType },
        });
      }).not.toThrow();
    },
  );

  it("preserves historical records without assigning new evidence", () => {
    expect(createLearningRecord(record())).toEqual(record());
    expect(createLearningRecord(record()).evidence).toBeUndefined();
  });

  it.each([
    null,
    [],
    "unknown",
    {},
    { ...evidence, exerciseType: "unknown" },
    { ...evidence, items: null },
    { ...evidence, items: [] },
    { ...evidence, items: [items[0]] },
    { ...evidence, items: [null, items[1]] },
    {
      ...evidence,
      items: [{ ...items[0], sourceItemId: "unknown" }, items[1]],
    },
    { ...evidence, items: [items[0], items[0]] },
    { ...evidence, items: [{ ...items[0], response: "unknown" }, items[1]] },
    {
      ...evidence,
      items: [{ ...items[0], response: "self-reported" }, items[1]],
    },
    { ...evidence, items: [{ ...items[0], response: "skipped" }, items[1]] },
    { ...evidence, items: [{ ...items[0], assistance: "unknown" }, items[1]] },
    { ...evidence, exerciseType: "flashcard" },
  ])("rejects incomplete, contradictory, or ambiguous evidence", (value) => {
    expect(() => {
      assertLearningRecord({ ...record(), evidence: value });
    }).toThrow("Invalid learning record");
  });
});
