export type KanjiThemeId = "numbers" | "nature" | "people";
export type KanjiId = `kanji.character.u${string}`;
export type KanjiCharacterContent = Readonly<{
  id: KanjiId;
  glyph: string;
  theme: KanjiThemeId;
  meaning: string;
  onReadings: readonly string[];
  kunReadings: readonly string[];
  example: Readonly<{
    text: string;
    reading: string;
    romaji: string;
    romajiVariants: readonly string[];
    meaning: string;
    pronunciation: Readonly<{ audioId: KanjiId; text: string }>;
  }>;
}>;

export function character(
  glyph: string,
  theme: KanjiThemeId,
  meaning: string,
  onReadings: readonly string[],
  kunReadings: readonly string[],
  text: string,
  reading: string,
  romaji: string,
  exampleMeaning: string,
  romajiVariants: readonly string[] = [],
): KanjiCharacterContent {
  const id: KanjiId = `kanji.character.u${glyph.charCodeAt(0).toString(16)}`;
  return {
    id,
    glyph,
    theme,
    meaning,
    onReadings,
    kunReadings,
    example: {
      text,
      reading,
      romaji,
      meaning: exampleMeaning,
      romajiVariants,
      pronunciation: { audioId: id, text: reading },
    },
  };
}
