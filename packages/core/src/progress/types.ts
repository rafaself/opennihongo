import type { ExerciseResult } from "../exercises/result";
import type { ExerciseType } from "../exercises/index";
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
  evidence?: PracticeEvidence;
}>;

/** Help requested before completion; this does not assert that audio was heard. */
export type PracticeAssistance = "none" | "hint" | "audio" | "hint-and-audio";
export type PracticeItemEvidence = Readonly<{
  sourceItemId: LearningItemId;
  response: "answered" | "skipped" | "self-reported";
  assistance: PracticeAssistance;
}>;
export type PracticeEvidence = Readonly<{
  exerciseType: ExerciseType;
  items: readonly PracticeItemEvidence[];
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
