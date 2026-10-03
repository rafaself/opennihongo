import type { ExerciseResult } from "../exercises/result";
import type {
  ExerciseSessionId,
  LearningItemId,
  LearningRecordId,
  SessionProfileId,
} from "../ids";

/** Immutable evidence from one completed exercise, including incorrect outcomes. */
export type LearningRecord = Readonly<{
  id: LearningRecordId;
  sessionId: ExerciseSessionId;
  profileId: SessionProfileId;
  occurredAt: string;
  result: ExerciseResult;
}>;

/** Irrecoverable historical totals imported once; not fabricated exercise history. */
export type ItemProgressBaseline = Readonly<{
  itemId: LearningItemId;
  correctCount: number;
  incorrectCount: number;
  lastPracticedAt: string;
}>;

/** Derived evidence, without a mastery threshold or exercise-specific policy. */
export type ItemProgress = ItemProgressBaseline &
  Readonly<{ completedCount: number }>;
