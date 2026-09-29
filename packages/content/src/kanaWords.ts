import type { KanaWordId } from "@opennihongo/core";
import type { KanaWordContent } from "./kana";

function word<const Id extends KanaWordId>(
  id: Id,
  hiragana: string,
  romanization: string,
): KanaWordContent & Readonly<{ id: Id }> {
  return {
    id,
    hiragana,
    romanization,
    pronunciation: { text: hiragana },
  };
}

export const kanaBeginnerWords = [
  word("kana.word.soto", "そと", "soto"),
  word("kana.word.hato", "はと", "hato"),
  word("kana.word.sato", "さと", "sato"),
  word("kana.word.mimi", "みみ", "mimi"),
  word("kana.word.neko", "ねこ", "neko"),
] as const;
