/**
 * Stable identifiers for learning and exercise domain entities.
 *
 * IDs identify entities across content and exercise generation. They must not
 * depend on presentation order, UI state, array positions, or generated asset
 * paths.
 */
export type LearningItemId = string;

export type ExerciseId = string;

export type MatchingPairId = string;

export type ExerciseSessionId = string;

export type SessionProfileId = string;

export type ItemSelectionStrategyId = string;

/** Identifies one completed exercise occurrence; reuse it when retrying a save. */
export type LearningRecordId = string;
