import { kanaBeginnerWords } from "@opennihongo/content";
import type { FlashcardSourceItem } from "@opennihongo/core";
import type { KanaPracticeSelection } from "../session/kanaPracticeSelection";
import { getKanaPracticeTiles } from "../session/kanaPracticeContent";

export type CardStackItem = FlashcardSourceItem &
  Readonly<{ pronunciationText?: string }>;

export function getKanaCards(
  selection: KanaPracticeSelection,
): readonly CardStackItem[] {
  return getKanaPracticeTiles(selection).map((tile) => ({
    id: tile.id,
    front: { text: tile.glyph, lang: "ja" },
    back: { text: tile.romanization },
    pronunciationText: tile.speechText,
  }));
}

export function getWordCards(showRomaji = true): readonly CardStackItem[] {
  return kanaBeginnerWords.map((word) => ({
    id: word.id,
    front: { text: word.hiragana, lang: "ja" },
    back: {
      text: word.englishMeaning,
      ...(showRomaji ? { supportingText: word.romanization } : {}),
      lang: "en",
    },
    pronunciationText: word.pronunciation.text,
  }));
}
