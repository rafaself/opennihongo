import type { KanaWordId } from "@opennihongo/core";
import type { KanaWordContent } from "./kana";

function word<const Id extends KanaWordId>(
  id: Id,
  hiragana: string,
  romanization: string,
  englishMeaning: string,
): KanaWordContent & Readonly<{ id: Id }> {
  return {
    id,
    hiragana,
    romanization,
    englishMeaning,
    pronunciation: { text: hiragana },
  };
}

export const kanaBeginnerWords = [
  word("kana.word.soto", "そと", "soto", "outside"),
  word("kana.word.hato", "はと", "hato", "pigeon"),
  word("kana.word.sato", "さと", "sato", "village"),
  word("kana.word.mimi", "みみ", "mimi", "ear"),
  word("kana.word.neko", "ねこ", "neko", "cat"),
] as const;
