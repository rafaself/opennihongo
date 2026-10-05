import type { HistoryChapter, HistoryReference, HistoryUnit } from "../types";

export const cite = (
  sourceId: string,
  locator: string,
): readonly HistoryReference[] => [{ sourceId, locator }];
export function chapter(
  id: string,
  title: string,
  summary: string,
  units: readonly HistoryUnit[],
): HistoryChapter {
  return { id, title, summary, durationMinutes: { min: 2, max: 4 }, units };
}
