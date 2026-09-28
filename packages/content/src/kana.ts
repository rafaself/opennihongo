import type { LearningItemId } from "@opennihongo/core";

export type KanaScript = "hiragana" | "katakana";

/**
 * Content groups used by the existing Kana chart to organize authored forms.
 */
export type KanaCharacterCategory =
  "basic" | "dakuten" | "combinations" | "small-tsu" | "long-vowels";

/** Spoken text for pronunciation fallback and semantic audio lookup. */
export type KanaPronunciation = Readonly<{
  /** Text to pronounce; audio assets are resolved by the item's stable ID. */
  text: string;
}>;

/** Authored Kana forms used by the character chart and character lessons. */
export type KanaCharacterContent = Readonly<{
  id: LearningItemId;
  script: KanaScript;
  glyph: string;
  romanization: string;
  category: KanaCharacterCategory;
  pronunciation: KanaPronunciation;
}>;

/** Authored beginner vocabulary used by Kana practice. */
export type KanaWordContent = Readonly<{
  id: LearningItemId;
  hiragana: string;
  romanization: string;
  pronunciation: KanaPronunciation;
}>;
