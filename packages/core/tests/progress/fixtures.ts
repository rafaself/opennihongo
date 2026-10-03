import type { LearningRecord } from "../../src/index";

export function record(
  overrides: Partial<LearningRecord> = {},
): LearningRecord {
  return {
    id: "record-1",
    sessionId: "session-1",
    profileId: "profile-1",
    occurredAt: "2026-10-03T12:00:00.000Z",
    result: {
      exerciseId: "exercise-1",
      outcome: "partially-correct",
      attempts: 7,
      sourceItemResults: [
        { sourceItemId: "kana.hiragana.a", outcome: "correct" },
        { sourceItemId: "word.cat", outcome: "incorrect" },
      ],
    },
    ...overrides,
  };
}
