import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { appendLearningRecord, loadLearningHistory } from "../../index";
import {
  clearDatabase,
  putRaw,
  resultRecord,
} from "../../../tests/historyFixture";

beforeEach(async () => {
  vi.unstubAllGlobals();
  await clearDatabase();
});

describe("generic learning history", () => {
  it("stores multi-item evidence and targets item and session reads", async () => {
    expect(await loadLearningHistory()).toEqual({ records: [], baselines: [] });
    await appendLearningRecord(resultRecord);
    await appendLearningRecord({ ...resultRecord, id: "r2", sessionId: "s2" });
    expect(
      (await loadLearningHistory({ itemId: "word.cat" })).records,
    ).toHaveLength(2);
    expect(
      (await loadLearningHistory({ sessionId: "session-1" })).records,
    ).toEqual([resultRecord]);
    expect((await loadLearningHistory({ itemId: "unknown" })).records).toEqual(
      [],
    );
  });
  it("is idempotent under concurrent writes and rejects conflicting record identity", async () => {
    await Promise.all([
      appendLearningRecord(resultRecord),
      appendLearningRecord(resultRecord),
    ]);
    expect((await loadLearningHistory()).records).toEqual([resultRecord]);
    await expect(
      appendLearningRecord({ ...resultRecord, sessionId: "other" }),
    ).rejects.toThrow("Conflicting learning record");
    expect((await loadLearningHistory()).records).toEqual([resultRecord]);
  });
  it("rejects ambiguous item outcomes before writing", async () => {
    const item = resultRecord.result.sourceItemResults[0];
    if (item === undefined) throw new Error("Expected a source item");
    await expect(
      appendLearningRecord({
        ...resultRecord,
        result: {
          ...resultRecord.result,
          sourceItemResults: [item, item],
        },
      }),
    ).rejects.toThrow("Invalid learning record");
    expect((await loadLearningHistory()).records).toEqual([]);
  });
  it.each([
    { schemaVersion: 9, record: resultRecord },
    { schemaVersion: 1, record: { ...resultRecord, occurredAt: "bad" } },
    { schemaVersion: 1, record: resultRecord, sourceItemIds: ["different"] },
  ])("surfaces invalid or unsupported stored records", async (value) => {
    await putRaw("learningRecords", value);
    await expect(loadLearningHistory()).rejects.toThrow();
  });
  it("reports unavailable IndexedDB", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(loadLearningHistory()).rejects.toThrow(
      "Local progress storage is unavailable",
    );
  });
});
