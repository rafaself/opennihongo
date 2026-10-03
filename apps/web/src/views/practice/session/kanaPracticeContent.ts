import {
  kanaPracticeDifficulties,
  kanaPracticeGames,
  type KanaPracticeGame,
} from "@opennihongo/content";
import { normalizeKanaAnswer } from "@opennihongo/core";
import type { PracticeSearch } from "../../../app/practiceSearch";
import { getKanaPracticeTiles } from "./kanaPracticeSelection";
export { getKanaPracticeTiles } from "./kanaPracticeSelection";

export function matchingBoardSizes(
  count: number,
  maximum: number,
): readonly number[] {
  const boards: number[] = [];
  for (let remaining = count; remaining > 0;) {
    const size = Math.min(maximum, remaining);
    boards.push(size);
    remaining -= size;
  }
  if (boards.length > 1 && boards[boards.length - 1] === 1) {
    boards[boards.length - 2] = (boards[boards.length - 2] ?? 0) - 1;
    boards[boards.length - 1] = 2;
  }
  return boards;
}

export function getKanaPracticeSummary(
  game: KanaPracticeGame,
  options: PracticeSearch,
) {
  const tiles = getKanaPracticeTiles(options);
  const distinct = new Set(
    tiles.map(({ romanization }) => normalizeKanaAnswer(romanization)),
  ).size;
  const requested = options.length ?? kanaPracticeGames[game].defaultLength;
  const available =
    game === "matching" || game === "quiz" ? distinct : tiles.length;
  const count = Math.min(requested, available);
  const preset = kanaPracticeDifficulties[options.difficulty];
  const error =
    tiles.length === 0
      ? "Select at least one character to start."
      : (game === "quiz" || game === "matching") && distinct < 2
        ? "Select characters with at least two distinct readings."
        : "";
  return {
    count,
    requested,
    available,
    distinct,
    choices: Math.min(preset.quizChoices, distinct),
    boards:
      game === "matching"
        ? matchingBoardSizes(count, preset.matchingPairs)
        : [],
    canStart: error === "",
    error,
  };
}
