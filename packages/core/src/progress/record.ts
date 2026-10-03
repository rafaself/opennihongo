import type { LearningRecord } from "./types";
import { assertLearningRecord } from "./validation";

/** Snapshot once at completion; callers provide identity and time, never the UI state. */
export function createLearningRecord(input: LearningRecord): LearningRecord {
  assertLearningRecord(input);
  return Object.freeze({
    id: input.id,
    sessionId: input.sessionId,
    profileId: input.profileId,
    occurredAt: new Date(input.occurredAt).toISOString(),
    result: Object.freeze({
      exerciseId: input.result.exerciseId,
      outcome: input.result.outcome,
      attempts: input.result.attempts,
      sourceItemResults: Object.freeze(
        input.result.sourceItemResults.map((item) =>
          Object.freeze({
            sourceItemId: item.sourceItemId,
            outcome: item.outcome,
          }),
        ),
      ),
    }),
  });
}
