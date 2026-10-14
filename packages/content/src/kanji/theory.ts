import { beginnerKanji, kanjiCollections } from "./content";
import type { KanjiCharacterContent, KanjiId } from "./character";

export type KanjiTheoryCheck = Readonly<{
  kind: "meaning" | "reading";
  title: string;
  prompt: string;
  correctOptionId: KanjiId;
  options: readonly Readonly<{
    id: KanjiId;
    label: string;
    explanation: string;
  }>[];
}>;

export type KanjiTheoryCharacter = Readonly<{
  character: KanjiCharacterContent;
  checks: readonly KanjiTheoryCheck[];
}>;

export const kanjiTheoryIntroduction = {
  summary:
    "Get to know 30 beginner Kanji through their meanings, readings, and a word you can use.",
  paragraphs: [
    "A Kanji character connects writing with meaning. Learn its shape together with a whole word, rather than treating it as a letter with one fixed sound.",
    "A character can have several readings. The reference lists common on readings in Katakana and kun readings in Hiragana. These are reference examples, not a rule that chooses the pronunciation of every word.",
    "Start with the example word and its complete Kana reading. For example, 十日 is read とおか: knowing ジュウ as a reading of 十 does not give you the reading of this word.",
  ],
} as const;

export const kanjiTheorySources = [
  {
    title: "Joyo Kanji reading table",
    institution: "Agency for Cultural Affairs",
    url: "https://www.bunka.go.jp/kokugo_nihongo/sisaku/joho/joho/kijun/naikaku/kanji/joyokanjisakuin/",
    note: "Common character readings; the starter selection and English glosses are authored for OpenNihongo.",
  },
  {
    title: "Marugoto: learning Kanji as vocabulary",
    institution: "The Japan Foundation",
    url: "https://marugoto.jpf.go.jp/en/teacher/resource/pre_intermediate/",
    note: "Kanji Word List: learn readings through words rather than isolated characters.",
  },
] as const;

function checks(character: KanjiCharacterContent): readonly KanjiTheoryCheck[] {
  const candidates = [
    character,
    ...kanjiCollections[character.theme]
      .filter(({ id }) => id !== character.id)
      .slice(0, 2),
  ].sort((left, right) => left.id.localeCompare(right.id));

  return [
    {
      kind: "meaning",
      title: "Connect shape and meaning",
      prompt: `Which meaning is associated with ${character.glyph}?`,
      correctOptionId: character.id,
      options: candidates.map((option) => ({
        id: option.id,
        label: option.meaning,
        explanation:
          option.id === character.id
            ? `${character.glyph} means ${character.meaning}. In ${character.example.text}, the word means ${character.example.meaning}.`
            : `${option.glyph} means ${option.meaning}. The character here is ${character.glyph}, meaning ${character.meaning}.`,
      })),
    },
    {
      kind: "reading",
      title: "Read the whole word",
      prompt: `How do you read ${character.example.text} (${character.example.meaning})?`,
      correctOptionId: character.id,
      options: candidates.map((option) => ({
        id: option.id,
        label: option.example.reading,
        explanation:
          option.id === character.id
            ? `${character.example.text} is read ${character.example.reading} and means ${character.example.meaning}. Keep this whole-word reading together with its meaning.`
            : `${option.example.reading} is the reading of ${option.example.text} (${option.example.meaning}). Here, ${character.example.text} is read ${character.example.reading}.`,
      })),
    },
  ];
}

export const kanjiTheoryCharacters: readonly KanjiTheoryCharacter[] =
  beginnerKanji.map((character) => ({ character, checks: checks(character) }));

export function getKanjiTheoryCharacter(
  id: string,
): KanjiTheoryCharacter | undefined {
  return kanjiTheoryCharacters.find(({ character }) => character.id === id);
}
