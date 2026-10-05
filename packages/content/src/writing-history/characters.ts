import type { HistoricalCharacter, HistoryReference } from "./types";

const ref = (
  sourceId: string,
  locator: string,
): readonly HistoryReference[] => [{ sourceId, locator }];
const kanaCaveat =
  "A source-to-modern comparison summarizes a gradual history. These printed glyphs are not a reconstruction of every intermediate handwritten form.";
const phoneticContext =
  "Chinese characters used to represent Japanese sounds in the tradition commonly called Man’yōgana.";

function source(
  id: string,
  glyph: string,
  reading: string,
  semanticHint: string,
): HistoricalCharacter {
  return {
    id,
    glyph,
    reading,
    semanticHint,
    script: "kanji",
    form: "modern",
    summary:
      "A Chinese-character source shown in its modern printed form for comparison.",
    relatedIds: [],
    origins: [],
    references: ref(
      "hentaigana",
      "Source characters (jibo) in the Unicode list",
    ),
  };
}
function kana(
  id: string,
  glyph: string,
  reading: string,
  script: "hiragana" | "katakana",
  sourceCharacterId: string,
  sourceId: string,
  locator: string,
  componentHint?: string,
): HistoricalCharacter {
  return {
    id,
    glyph,
    reading,
    script,
    form: "modern",
    learningItemId: `kana.${script}.${reading}`,
    summary:
      script === "hiragana"
        ? "Developed through cursive forms of a character used phonetically."
        : "Developed through abbreviation of a character used in reading and annotation practices.",
    relatedIds: [sourceCharacterId],
    references: ref(sourceId, locator),
    origins: [
      {
        sourceCharacterId,
        phoneticContext,
        transformation: script === "hiragana" ? "cursive" : "abbreviation",
        confidence: "well-supported",
        pedagogicalSimplification: true,
        caveat: kanaCaveat,
        references: ref(sourceId, locator),
        ...(componentHint ? { componentHint } : {}),
      },
    ],
  };
}
function variant(
  id: string,
  glyph: string,
  sourceCharacterId: string,
): HistoricalCharacter {
  return {
    id,
    glyph,
    reading: "a",
    script: "hiragana",
    form: "historical-variant",
    summary:
      "One historical hiragana form associated with the sound /a/. This font supplies a representative glyph, not a facsimile of a particular manuscript.",
    relatedIds: ["hiragana-a", sourceCharacterId],
    references: ref("hentaigana", "Row あ; U+1B002, U+1B003 and U+1B004"),
    origins: [
      {
        sourceCharacterId,
        phoneticContext,
        transformation: "cursive",
        confidence: "well-supported",
        pedagogicalSimplification: true,
        caveat:
          "Different source characters and handwriting conventions could produce forms for the same sound. These are alternatives, not consecutive stages.",
        references: ref("hentaigana", "Row あ"),
      },
    ],
  };
}

export const historicalCharacters: readonly HistoricalCharacter[] = [
  source("kanji-an", "安", "a", "peace or ease"),
  source("kanji-i", "以", "i", "using or by means of"),
  source("kanji-ka", "加", "ka", "add"),
  source("kanji-a", "阿", "a", "a Chinese character also used phonetically"),
  source("kanji-ai", "愛", "a", "love"),
  source("kanji-u", "宇", "u", "a Chinese character also used phonetically"),
  source("kanji-e", "衣", "e", "a Chinese character also used phonetically"),
  source("kanji-o", "於", "o", "a Chinese character also used phonetically"),
  source("kanji-sa", "左", "sa", "a Chinese character also used phonetically"),
  source("kanji-to", "止", "to", "a Chinese character also used phonetically"),
  kana(
    "hiragana-a",
    "あ",
    "a",
    "hiragana",
    "kanji-an",
    "mext",
    "Table: 平仮名の成り立ち; 安 → あ",
  ),
  kana(
    "hiragana-i",
    "い",
    "i",
    "hiragana",
    "kanji-i",
    "mext",
    "Table: 平仮名の成り立ち; 以 → い",
  ),
  kana(
    "hiragana-u",
    "う",
    "u",
    "hiragana",
    "kanji-u",
    "jeed",
    "Chapter 7, Figure 15, page 119; 宇 → う",
  ),
  kana(
    "hiragana-e",
    "え",
    "e",
    "hiragana",
    "kanji-e",
    "jeed",
    "Chapter 7, Figure 15, page 119; 衣 → え",
  ),
  kana(
    "hiragana-o",
    "お",
    "o",
    "hiragana",
    "kanji-o",
    "jeed",
    "Chapter 7, Figure 15, page 119; 於 → お",
  ),
  kana(
    "hiragana-ka",
    "か",
    "ka",
    "hiragana",
    "kanji-ka",
    "jeed",
    "Chapter 7, Figure 15, page 119; 加 → か",
  ),
  kana(
    "hiragana-sa",
    "さ",
    "sa",
    "hiragana",
    "kanji-sa",
    "jeed",
    "Chapter 7, Figure 15, page 119; 左 → さ",
  ),
  kana(
    "hiragana-to",
    "と",
    "to",
    "hiragana",
    "kanji-to",
    "jeed",
    "Chapter 7, Figure 15, page 119; 止 → と",
  ),
  kana(
    "katakana-a",
    "ア",
    "a",
    "katakana",
    "kanji-a",
    "irodori",
    "Lesson 3, page 18; 阿 → ア",
    "Compare the right-hand portion of 阿 with ア. The shape is abbreviated and adjusted, rather than copied as an identical modern-font fragment.",
  ),
  kana(
    "katakana-ka",
    "カ",
    "ka",
    "katakana",
    "kanji-ka",
    "sng",
    "Shared source 加 for か and カ",
    "The left-hand portion of 加 provides the useful comparison with カ. This is a component explanation, not an exact typographic crop.",
  ),
  variant("variant-a-an", "𛀂", "kanji-an"),
  variant("variant-a-ai", "𛀃", "kanji-ai"),
  variant("variant-a-a", "𛀄", "kanji-a"),
];
