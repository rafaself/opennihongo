import type { KanaCharacterCategory, KanaScript } from "./kana";
import { hiraganaSyllabary } from "./kanaSyllabary";

export type KanaChartScript = KanaScript;

export type KanaChartSectionId = KanaCharacterCategory;

export type KanaChartTile = Readonly<{
  id: string;
  glyph: string;
  romanization: string;
  speechText: string;
}>;

export type KanaChartRow = readonly (KanaChartTile | null)[];

export type KanaChartSection = Readonly<{
  id: KanaChartSectionId;
  title: string;
  description: string;
  rows: readonly KanaChartRow[];
}>;

export type KanaCharacterChart = Readonly<{
  script: KanaChartScript;
  heading: string;
  description: string;
  sections: readonly KanaChartSection[];
}>;

type KanaSeed = Readonly<{
  glyph: string;
  romanization: string;
  speechText: string;
}>;

type KanaSeedRow = readonly (KanaSeed | null)[];

function seed(
  glyph: string,
  romanization: string,
  speechText = glyph,
): KanaSeed {
  return { glyph, romanization, speechText };
}

const basicReadingRows: readonly (readonly (string | null)[])[] = [
  ["a", "i", "u", "e", "o"],
  ["ka", "ki", "ku", "ke", "ko"],
  ["sa", "shi", "su", "se", "so"],
  ["ta", "chi", "tsu", "te", "to"],
  ["na", "ni", "nu", "ne", "no"],
  ["ha", "hi", "fu", "he", "ho"],
  ["ma", "mi", "mu", "me", "mo"],
  ["ya", null, "yu", null, "yo"],
  ["ra", "ri", "ru", "re", "ro"],
  ["wa", null, null, null, "wo"],
  ["n", null, null, null, null],
];

function basicRows(): readonly KanaSeedRow[] {
  const charactersByReading = new Map(
    hiraganaSyllabary.map((character) => [character.romanization, character]),
  );

  return basicReadingRows.map((row) =>
    row.map((reading) => {
      if (reading === null) {
        return null;
      }

      const character = charactersByReading.get(reading);
      if (!character) {
        throw new Error(`Missing basic Hiragana reading: ${reading}`);
      }

      const romanization =
        character.romanization === "wo" ? "o" : character.romanization;
      return seed(character.glyph, romanization, character.pronunciation.text);
    }),
  );
}

const dakutenRows: readonly KanaSeedRow[] = [
  [
    seed("が", "ga"),
    seed("ぎ", "gi"),
    seed("ぐ", "gu"),
    seed("げ", "ge"),
    seed("ご", "go"),
  ],
  [
    seed("ざ", "za"),
    seed("じ", "ji"),
    seed("ず", "zu"),
    seed("ぜ", "ze"),
    seed("ぞ", "zo"),
  ],
  [
    seed("だ", "da"),
    seed("ぢ", "ji"),
    seed("づ", "zu"),
    seed("で", "de"),
    seed("ど", "do"),
  ],
  [
    seed("ば", "ba"),
    seed("び", "bi"),
    seed("ぶ", "bu"),
    seed("べ", "be"),
    seed("ぼ", "bo"),
  ],
  [
    seed("ぱ", "pa"),
    seed("ぴ", "pi"),
    seed("ぷ", "pu"),
    seed("ぺ", "pe"),
    seed("ぽ", "po"),
  ],
];

const combinationRows: readonly KanaSeedRow[] = [
  [seed("きゃ", "kya"), seed("きゅ", "kyu"), seed("きょ", "kyo")],
  [seed("ぎゃ", "gya"), seed("ぎゅ", "gyu"), seed("ぎょ", "gyo")],
  [seed("しゃ", "sha"), seed("しゅ", "shu"), seed("しょ", "sho")],
  [seed("じゃ", "ja"), seed("じゅ", "ju"), seed("じょ", "jo")],
  [seed("ちゃ", "cha"), seed("ちゅ", "chu"), seed("ちょ", "cho")],
  [seed("にゃ", "nya"), seed("にゅ", "nyu"), seed("にょ", "nyo")],
  [seed("ひゃ", "hya"), seed("ひゅ", "hyu"), seed("ひょ", "hyo")],
  [seed("びゃ", "bya"), seed("びゅ", "byu"), seed("びょ", "byo")],
  [seed("ぴゃ", "pya"), seed("ぴゅ", "pyu"), seed("ぴょ", "pyo")],
  [seed("みゃ", "mya"), seed("みゅ", "myu"), seed("みょ", "myo")],
  [seed("りゃ", "rya"), seed("りゅ", "ryu"), seed("りょ", "ryo")],
];

const smallTsuRows: readonly KanaSeedRow[] = [
  [
    seed("っ+k", "kk", "っか"),
    seed("っ+s", "ss", "っさ"),
    seed("っ+t", "tt", "った"),
    seed("っ+p", "pp", "っぱ"),
  ],
];

const hiraganaLongVowelRows: readonly KanaSeedRow[] = [
  [
    seed("ああ", "aa"),
    seed("いい", "ii"),
    seed("うう", "uu"),
    seed("ええ", "ee"),
    seed("おお", "oo"),
  ],
  [seed("えい", "ei"), seed("おう", "ou")],
];

const katakanaLongVowelRows: readonly KanaSeedRow[] = [
  [
    seed("あー", "aa"),
    seed("いー", "ii"),
    seed("うー", "uu"),
    seed("えー", "ee"),
    seed("おー", "oo"),
  ],
];

function toKatakana(text: string): string {
  return text.replace(/[\u3041-\u3096]/g, (character) =>
    String.fromCharCode(character.charCodeAt(0) + 0x60),
  );
}

function makeTile(
  script: KanaChartScript,
  sectionId: KanaChartSectionId,
  entry: KanaSeed,
): KanaChartTile {
  const glyph = script === "hiragana" ? entry.glyph : toKatakana(entry.glyph);
  const speechText =
    script === "hiragana" ? entry.speechText : toKatakana(entry.speechText);
  const romanization =
    script === "katakana" && entry.glyph === "を" ? "wo" : entry.romanization;

  return {
    id: `${script}.${sectionId}.${glyph}`,
    glyph,
    romanization,
    speechText,
  };
}

function makeSection(
  script: KanaChartScript,
  id: KanaChartSectionId,
  title: string,
  description: string,
  seedRows: readonly KanaSeedRow[],
): KanaChartSection {
  return {
    id,
    title:
      id === "small-tsu"
        ? `Small ${script === "hiragana" ? "っ" : "ッ"}`
        : title,
    description,
    rows: seedRows.map((row) =>
      row.map((entry) => (entry === null ? null : makeTile(script, id, entry))),
    ),
  };
}

function makeSections(
  script: KanaChartScript,
  longVowelRows: readonly KanaSeedRow[],
): readonly KanaChartSection[] {
  return [
    makeSection(
      script,
      "basic",
      "Basic characters",
      "The main characters in this writing system.",
      basicRows(),
    ),
    makeSection(
      script,
      "dakuten",
      "Dakuon and handakuon",
      "Add a mark to change the sound of a character.",
      dakutenRows,
    ),
    makeSection(
      script,
      "combinations",
      "Combinations",
      "Combine a character with a small kana to form a new sound.",
      combinationRows,
    ),
    makeSection(
      script,
      "small-tsu",
      "Small っ",
      "Double the consonant that follows.",
      smallTsuRows,
    ),
    makeSection(
      script,
      "long-vowels",
      "Long vowels",
      "Hold the vowel sound for longer.",
      longVowelRows,
    ),
  ];
}

export const kanaCharacterCharts: Readonly<
  Record<KanaChartScript, KanaCharacterChart>
> = {
  hiragana: {
    script: "hiragana",
    heading: "Let's learn Hiragana!",
    description: "Get to know the main Japanese writing system.",
    sections: makeSections("hiragana", hiraganaLongVowelRows),
  },
  katakana: {
    script: "katakana",
    heading: "Let's learn Katakana!",
    description:
      "Meet the characters used in words borrowed from other languages.",
    sections: makeSections("katakana", katakanaLongVowelRows),
  },
};
