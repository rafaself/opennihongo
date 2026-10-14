import type { KanjiCharacterContent } from "./character";
import { numbersKanji } from "./numbers";
import { natureKanji } from "./nature";
import { peopleKanji } from "./people";
export type { KanjiCharacterContent, KanjiThemeId, KanjiId } from "./character";

export const kanjiThemes = [
  { id: "numbers", label: "Numbers" },
  { id: "nature", label: "Nature" },
  { id: "people", label: "People and basics" },
] as const;

export const kanjiCollections = {
  numbers: numbersKanji,
  nature: natureKanji,
  people: peopleKanji,
} as const;

/** Independently authored starter material; common readings checked against the Bunka Joyo table. */
export const beginnerKanji: readonly KanjiCharacterContent[] =
  Object.values(kanjiCollections).flat();
