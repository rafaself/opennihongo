import { foundationsChapters } from "./chapters/foundations";
import { kanaHistoryChapters } from "./chapters/kana";
import { modernHistoryChapters } from "./chapters/modern";
import { historicalCharacters } from "./characters";
import { writingHistorySources } from "./sources";
import type { HistoryChapter, WritingHistoryCatalog } from "./types";

export const writingHistoryChapters: readonly HistoryChapter[] = [
  ...foundationsChapters,
  ...kanaHistoryChapters,
  ...modernHistoryChapters,
];
export const writingHistoryCatalog: WritingHistoryCatalog = {
  chapters: writingHistoryChapters,
  characters: historicalCharacters,
  sources: writingHistorySources,
};
export function getWritingHistoryChapter(id: string) {
  return writingHistoryChapters.find((chapter) => chapter.id === id);
}
export function getHistoricalCharacter(id: string) {
  return historicalCharacters.find((character) => character.id === id);
}
