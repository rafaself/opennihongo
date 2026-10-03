import { expect, it } from "vitest";
import { cardStackSessionProfile } from "../src";
import { randomWithoutReplacementSelectionStrategyId } from "@opennihongo/core";

it("declares ten single-source cards for reusable recall sessions", () => {
  expect(cardStackSessionProfile).toEqual({
    id: "practice.cards",
    targetSessionSize: 10,
    exerciseMix: [{ type: "flashcard", count: 10 }],
    selectionStrategyId: randomWithoutReplacementSelectionStrategyId,
  });
});
