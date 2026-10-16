import { expect, it } from "vitest";
import { readBaseline, readRecord } from "../schema";

it.each([null, 1, { schemaVersion: 9 }])(
  "rejects invalid storage envelopes",
  (value) => {
    expect(() => readRecord(value)).toThrow("invalid or unsupported schema");
  },
);
it("rejects unsupported baseline provenance", () => {
  expect(() => readBaseline({ schemaVersion: 1, origin: "unknown" })).toThrow(
    "baseline origin is invalid",
  );
});

import { storedRecord } from "../schema";
import { resultRecord } from "../../../tests/historyFixture";

it("reads legacy records unchanged and versions explicit evidence separately", () => {
  const legacy = storedRecord(resultRecord);
  expect(legacy.schemaVersion).toBe(1);
  expect(readRecord(legacy)).toEqual(resultRecord);
  const record = {
    ...resultRecord,
    evidence: {
      exerciseType: "typed-answer" as const,
      items: resultRecord.result.sourceItemResults.map((item) => ({
        sourceItemId: item.sourceItemId,
        response: "answered" as const,
        assistance: "none" as const,
      })),
    },
  };
  const stored = storedRecord(record);
  expect(stored.schemaVersion).toBe(2);
  expect(readRecord(stored)).toEqual(record);
  expect(() => readRecord({ ...stored, schemaVersion: 1 })).toThrow(
    "evidence version",
  );
  expect(() => readRecord({ ...legacy, schemaVersion: 2 })).toThrow(
    "evidence version",
  );
});
it("does not change baseline versions when record envelopes evolve", () => {
  expect(() => readBaseline({ schemaVersion: 2 })).toThrow(
    "invalid or unsupported schema",
  );
});
