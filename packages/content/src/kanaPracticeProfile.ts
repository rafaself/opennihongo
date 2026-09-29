import {
  randomWithoutReplacementSelectionStrategyId,
  type SessionProfile,
} from "@opennihongo/core";

/** Initial product configuration based on the current Kana practice cards. */
export const initialKanaPracticeSessionProfile = {
  id: "kana.practice.initial",
  targetSessionSize: 2,
  exerciseMix: [
    { type: "typed-answer", count: 1 },
    { type: "matching", count: 1, config: { pairCount: 5 } },
  ],
  selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
} as const satisfies SessionProfile;
