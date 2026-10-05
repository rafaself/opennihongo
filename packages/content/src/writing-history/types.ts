import type { LearningItemId } from "@opennihongo/core";

export type HistoryReference = Readonly<{ sourceId: string; locator: string }>;
export type HistorySource = Readonly<{
  id: string;
  title: string;
  institution: string;
  url: string;
  accessedOn: string;
}>;
export type HistoricalCharacter = Readonly<{
  id: string;
  glyph: string;
  script: "kanji" | "hiragana" | "katakana";
  form: "modern" | "historical-variant";
  reading: string;
  summary: string;
  semanticHint?: string;
  learningItemId?: LearningItemId;
  relatedIds: readonly string[];
  references: readonly HistoryReference[];
  origins: readonly Readonly<{
    sourceCharacterId: string;
    phoneticContext: string;
    transformation: "cursive" | "abbreviation";
    confidence: "well-supported" | "uncertain";
    pedagogicalSimplification: boolean;
    caveat: string;
    componentHint?: string;
    references: readonly HistoryReference[];
  }>[];
}>;
export type HistoryDiagramNode = Readonly<{
  id: string;
  label: string;
  detail: string;
}>;
type UnitBase = Readonly<{
  title: string;
  references: readonly HistoryReference[];
}>;
export type HistoryUnit = UnitBase &
  (
    | Readonly<{ kind: "explanation"; paragraphs: readonly string[] }>
    | Readonly<{
        kind: "diagram";
        nodes: readonly HistoryDiagramNode[];
        edges: readonly Readonly<{ from: string; to: string; label: string }>[];
      }>
    | (Readonly<{
        kind: "character-comparison";
        characterIds: readonly string[];
        introduction: string;
      }> &
        (
          | Readonly<{ mode: "origins" | "variants" }>
          | Readonly<{
              mode: "phonetic-use";
              meaningExplanation: string;
              soundExplanation: string;
            }>
        ))
    | Readonly<{
        kind: "script-example";
        sentence: string;
        translation: string;
        tokens: readonly Readonly<{
          text: string;
          script: "kanji" | "hiragana" | "katakana" | "romaji" | "mark";
          explanation: string;
        }>[];
      }>
    | Readonly<{
        kind: "timeline";
        entries: readonly Readonly<{ label: string; detail: string }>[];
      }>
    | Readonly<{ kind: "note"; paragraphs: readonly string[] }>
  );
export type HistoryChapter = Readonly<{
  id: string;
  title: string;
  summary: string;
  durationMinutes: Readonly<{ min: number; max: number }>;
  units: readonly HistoryUnit[];
}>;
export type WritingHistoryCatalog = Readonly<{
  chapters: readonly HistoryChapter[];
  characters: readonly HistoricalCharacter[];
  sources: readonly HistorySource[];
}>;
