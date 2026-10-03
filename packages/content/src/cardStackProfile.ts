import {
  randomWithoutReplacementSelectionStrategyId,
  type SessionProfile,
} from "@opennihongo/core";

/** Maximum stack size; smaller collections use every distinct authored item. */
export const cardStackSessionProfile = {
  id: "practice.cards",
  targetSessionSize: 10,
  exerciseMix: [{ type: "flashcard", count: 10 }],
  selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
} as const satisfies SessionProfile;
