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
