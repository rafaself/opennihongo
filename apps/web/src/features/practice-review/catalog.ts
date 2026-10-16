import {
  kanjiTheoryCharacters,
  kanjiTheoryIntroduction,
  kanaCharacterCharts,
  kanjiPracticeProfiles,
  kanaPracticeSessionProfiles,
} from "@opennihongo/content";

export type ReadingItem = Readonly<{
  id: string;
  subject: "kana" | "kanji";
  prompt: string;
  reading: string;
  speechText: string;
  explanation: string;
}>;
export const readingItems: readonly ReadingItem[] = [
  ...Object.values(kanaCharacterCharts).flatMap(({ sections }) =>
    sections.flatMap((section) =>
      section.rows.flatMap((row) =>
        row.flatMap((tile) =>
          tile
            ? [
                {
                  id: tile.id,
                  subject: "kana" as const,
                  prompt: tile.glyph,
                  reading: tile.romanization,
                  speechText: tile.speechText,
                  explanation: section.description,
                },
              ]
            : [],
        ),
      ),
    ),
  ),
  ...kanjiTheoryCharacters.map(({ character: item, checks }) => ({
    id: item.id,
    subject: "kanji" as const,
    prompt: item.example.text,
    reading: `${item.example.reading} · ${item.example.romaji}`,
    speechText: item.example.pronunciation.text,
    explanation:
      checks
        .find((check) => check.kind === "reading")
        ?.options.find((option) => option.id === item.id)?.explanation ??
      kanjiTheoryIntroduction.paragraphs[0],
  })),
];
export const readingProfiles = {
  kana: kanaPracticeSessionProfiles.reading.id,
  kanji: kanjiPracticeProfiles.reading.id,
};
export function findReadingItem(id: string) {
  return readingItems.find((item) => item.id === id);
}
