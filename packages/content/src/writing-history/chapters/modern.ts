import { chapter, cite } from "./authoring";

export const modernHistoryChapters = [
  chapter(
    "multiple-scripts",
    "Why several scripts coexist",
    "An ordinary sentence about coffee brings centuries of adaptation together.",
    [
      {
        kind: "explanation",
        title: "Look ahead to a modern sentence",
        paragraphs: [
          "A beginner’s textbook might introduce a sentence about drinking coffee. Some characters have many strokes, others curve, and others look more angular. After following the history of kana, that mixture can begin to look less mysterious: modern Japanese often places kanji, hiragana, and katakana in the same sentence.",
          "This chapter takes a brief look ahead to that modern result. We will then return to historical variation, because the familiar shapes and conventions were not settled as soon as kana developed. For now, use the highlights to see how the scripts cooperate in one ordinary line.",
        ],
        references: cite("irodori", "Lesson 3, page 18; Japanese characters"),
      },
      {
        kind: "script-example",
        title: "Three scripts in one sentence",
        sentence: "私はコーヒーを飲みます。",
        translation: "I drink coffee.",
        tokens: [
          {
            text: "私",
            script: "kanji",
            explanation: "A kanji writing the word for ‘I’.",
          },
          {
            text: "は",
            script: "hiragana",
            explanation: "Hiragana writing a grammatical particle.",
          },
          {
            text: "コ",
            script: "katakana",
            explanation: "Part of the katakana spelling of kōhī, ‘coffee’.",
          },
          {
            text: "ー",
            script: "mark",
            explanation:
              "A long-vowel mark, used here with katakana. It is not a separate katakana syllable.",
          },
          {
            text: "ヒ",
            script: "katakana",
            explanation: "Part of the katakana spelling of kōhī, ‘coffee’.",
          },
          {
            text: "ー",
            script: "mark",
            explanation: "Another long-vowel mark in コーヒー.",
          },
          {
            text: "を",
            script: "hiragana",
            explanation: "Hiragana writing a grammatical particle.",
          },
          {
            text: "飲",
            script: "kanji",
            explanation: "The kanji in the verb ‘drink’.",
          },
          {
            text: "みます",
            script: "hiragana",
            explanation: "Hiragana completing the verb form.",
          },
          { text: "。", script: "mark", explanation: "Sentence punctuation." },
        ],
        references: cite("irodori", "Lesson 3, page 18; common script roles"),
      },
      {
        kind: "explanation",
        title: "Follow the sentence in three passes",
        paragraphs: [
          "First, highlight kanji. 私 writes the word for ‘I,’ and 飲 contributes to the verb for drinking. Next, highlight hiragana. は and を show grammatical relationships, while みます completes the verb form. You do not need to learn the grammar yet; notice that the small connecting pieces are part of the message too.",
          "Now highlight katakana. コ and ヒ belong to the spelling of kōhī, ‘coffee,’ a borrowed word. The two ー signs lengthen the preceding vowels. These long-vowel marks work with the spelling here, but they are not another script or independent katakana syllables. The final 。 is punctuation.",
          "Compare this with the problem from chapter three. A writer needs to record more than a few main ideas. The sentence needs words, sounds, grammatical connections, and a complete verb form. Mixed writing offers conventional ways of representing those different parts together.",
        ],
        references: cite("irodori", "Lesson 3, page 18; common script roles"),
      },
      {
        kind: "explanation",
        title: "Common uses leave room for choices",
        paragraphs: [
          "The script highlights are a guide, not three sealed boxes. Hiragana can write whole words, including words that also have kanji spellings. Katakana is common for borrowed words and foreign names, but can also be used for effects such as emphasis. The choice depends on the word, the reader, and the context.",
          "Even ‘I’ can be written in hiragana as わたし. The existence of that spelling does not make 私 unnecessary. Japanese writers have several resources available, and familiar conventions help readers interpret the choices. As you learn, start with the common patterns rather than trying to predict every possible spelling.",
        ],
        references: cite(
          "kokugakuin",
          "Modern script uses; katakana for emphasis and borrowed words",
        ),
      },
      {
        kind: "explanation",
        title: "An accumulated system",
        paragraphs: [
          "Kana did not replace kanji. Writers continued using characters for words while kana provided convenient ways to represent sounds and grammatical material. Different communities, purposes, and kinds of text encouraged different written styles; the modern balance developed over time.",
          "The sentence you just explored was not designed by one person choosing three sets of symbols. It reflects centuries of adaptation and changing conventions. Next, we will step back from this familiar modern result and see that even the kana themselves once offered a much wider choice of shapes.",
        ],
        references: cite("takada", "Section 2; changing hiragana conventions"),
      },
    ],
  ),
  chapter(
    "variation",
    "Variation and standardization",
    "Why an old handwritten page can look unfamiliar even when you know its sounds.",
    [
      {
        kind: "explanation",
        title: "One sound, several written forms",
        paragraphs: [
          "An old handwritten page can be surprising even after you have learned modern あ. A shape representing the same sound might look quite different. That does not necessarily mean you have encountered a new sound: for much of hiragana’s history, writers had several forms available for one sound.",
          "Different source characters could supply related sound signs, and different ways of writing one source could also produce distinct forms. Historical hiragana forms outside today’s usual set are often called hentaigana — 変体仮名. The source character behind a kana form is its jibo — 字母.",
          "These names let us ask two useful questions: ‘Which form am I looking at?’ and ‘Which character is it associated with?’ They describe a wider history of hiragana, rather than an additional modern script you need to master before beginning kana.",
        ],
        references: cite("takada", "Section 2; what hentaigana are"),
      },
      {
        kind: "character-comparison",
        title: "Three historical alternatives for /a/",
        characterIds: ["variant-a-an", "variant-a-ai", "variant-a-a"],
        mode: "variants",
        introduction:
          "Compare alternatives associated with 安, 愛, and 阿. They share a sound in this example, but they are not three consecutive steps toward あ. The displayed font forms are representative historical variants.",
        references: cite("hentaigana", "Row あ; U+1B002, U+1B003, U+1B004"),
      },
      {
        kind: "explanation",
        title: "Variation could help a reader, too",
        paragraphs: [
          "More shapes did not always mean random decoration. Research on historical kana describes conventions in which a form could be preferred at the beginning of a word, within a word, or for a grammatical particle. Such choices could give a familiar reader clues about how to interpret the line.",
          "Those conventions varied across texts and periods. The three /a/ forms above introduce the range of possibilities; they do not show a universal rule about where each form belongs. For now, notice that writing choices can have a function as well as a visual style.",
          "This also explains why historical handwriting can take study to read. Knowing today’s sound chart is helpful, but it does not automatically supply the older forms and conventions. Your beginner track will use the usual modern kana; historical examples are here to show how that familiar set fits into a larger story.",
        ],
        references: cite(
          "takada",
          "Section 2; functional differences among kana forms",
        ),
      },
      {
        kind: "timeline",
        title: "Conventions become more uniform",
        entries: [
          {
            label: "Many alternatives",
            detail:
              "Writers use several forms for a sound, sometimes with differences in function or style.",
          },
          {
            label: "Printing and education",
            detail:
              "Printing already favors a narrower range. Around the turn of the twentieth century, elementary education specifies a smaller set of taught forms.",
          },
          {
            label: "Familiar modern forms",
            detail:
              "A smaller standard set becomes usual in everyday writing; other forms continue in specialized contexts.",
          },
        ],
        references: cite(
          "takada",
          "Section 2; printing, elementary education and continued use",
        ),
      },
      {
        kind: "note",
        title: "Standardization did not erase the past",
        paragraphs: [
          "A school can teach a consistent set without making every older form disappear. Educational rules concerned what children were taught; they did not instantly ban other forms from society. Historical forms continued in contexts such as traditional shop names and calligraphy. Standardization changed ordinary expectations, while traces of the wider tradition remained.",
          "Variation in shape is also different from historical spelling. An old text may use familiar-looking kana in spelling conventions that differ from modern ones. This introduction focuses on the shapes and their sources.",
        ],
        references: cite(
          "takada",
          "Section 2; educational rules and continuing uses",
        ),
      },
    ],
  ),
  chapter(
    "modern-writing",
    "Modern Japanese writing",
    "See how borrowed characters, two kana paths, and changing conventions meet today.",
    [
      {
        kind: "explanation",
        title: "Follow the connections",
        paragraphs: [
          "At the start of this journey, we imagined a spoken message with no ready-made Japanese characters to record it. The story that followed involved borrowed tools and local adaptation: Chinese characters brought a writing tradition, and Japanese writers found ways to work with their meanings and sounds.",
          "Man’yōgana made phonetic use especially visible. Cursive forms and abbreviations contributed to two kana paths, while kanji continued to be used. Writers combined these resources in changing ways; printing and education later helped narrow ordinary kana conventions.",
          "Read the diagram by following its branches, not by imagining one script disappearing each time the next appears. Different writing practices overlapped. What we call modern Japanese writing is a shared result of those developments, rather than the final item in a series of total replacements.",
        ],
        references: cite("rekihaku", "Use of characters; individual paths"),
      },
      {
        kind: "diagram",
        title: "A branching history, a shared present",
        nodes: [
          {
            id: "chinese",
            label: "Chinese written culture",
            detail:
              "Characters and practices travel through cultural exchange.",
          },
          {
            id: "adapt",
            label: "Adaptation to Japanese",
            detail: "Writers work with meanings, readings, and local language.",
          },
          {
            id: "kanji",
            label: "Continuing kanji use",
            detail:
              "Kanji remain part of writing throughout later developments.",
          },
          {
            id: "phonetic",
            label: "Man’yōgana",
            detail: "Phonetic uses of Chinese characters.",
          },
          { id: "hiragana", label: "Hiragana", detail: "Cursive development." },
          {
            id: "katakana",
            label: "Katakana",
            detail: "Abbreviation and annotation practices.",
          },
          {
            id: "mixed",
            label: "Mixed writing",
            detail: "Kanji and kana coexist in changing conventions.",
          },
          {
            id: "modern",
            label: "Modern Japanese",
            detail: "Standardization helps establish familiar forms and uses.",
          },
        ],
        edges: [
          { from: "chinese", to: "adapt", label: "Exchange" },
          { from: "adapt", to: "kanji", label: "Meaning and readings" },
          { from: "adapt", to: "phonetic", label: "Represent sounds" },
          { from: "phonetic", to: "hiragana", label: "Cursive forms" },
          { from: "phonetic", to: "katakana", label: "Abbreviated forms" },
          { from: "kanji", to: "mixed", label: "Continued use" },
          { from: "hiragana", to: "mixed", label: "Coexistence" },
          { from: "katakana", to: "mixed", label: "Coexistence" },
          { from: "mixed", to: "modern", label: "Changing standards" },
        ],
        references: cite("mext", "Man’yōgana and kana development"),
      },
      {
        kind: "script-example",
        title: "And sometimes, Latin letters",
        sentence: "東京 / Tōkyō",
        translation: "Tokyo, shown in kanji and rōmaji.",
        tokens: [
          {
            text: "東京",
            script: "kanji",
            explanation: "The place name in kanji.",
          },
          {
            text: " / ",
            script: "mark",
            explanation: "A separator in this comparison.",
          },
          {
            text: "Tōkyō",
            script: "romaji",
            explanation:
              "Rōmaji uses Latin letters to represent Japanese. You encounter it in learning materials and some signs or names.",
          },
        ],
        references: cite(
          "irodori",
          "Lesson 3, page 18; Japanese characters and romanized signage",
        ),
      },
      {
        kind: "explanation",
        title: "A familiar name, another way to write it",
        paragraphs: [
          "The comparison above adds rōmaji: Latin letters used to represent Japanese. The place name Tokyo can appear as 東京 and, in the romanization shown here, Tōkyō. The long-vowel marks over the letters belong to that romanization; you will also encounter spellings without them.",
          "Rōmaji is useful in settings such as introductory learning materials and signage. It gives another way to represent Japanese, but it does not by itself show the original kanji or kana spelling. Knowing a romanized name and recognizing the characters on a Japanese sign are related but different skills.",
          "Think of all the resources now on the page: kanji connect words with character spellings, hiragana records sounds and many grammatical pieces, katakana has familiar uses such as borrowed words, and Latin letters appear in some contexts. Their roles have common patterns, with room for variation. You will learn those patterns a little at a time.",
        ],
        references: cite(
          "irodori",
          "Lesson 3, page 18; scripts and romanized signage",
        ),
      },
      {
        kind: "explanation",
        title: "Ready to explore the characters",
        paragraphs: [
          "You do not need to remember dates, people’s names, or historical mappings to continue. Take three connections with you: writing can be borrowed and adapted; kana have roots in earlier character use; and several scripts can work together in one sentence. Those connections will help the next steps feel less arbitrary.",
          "Start with the Kana chart if you want to explore the whole sound system, or the first-vowels lesson if you prefer a small set to practice. When you meet あ and ア, you have already seen that they took different historical paths. Their origins can offer a useful connection, while practice helps you recognize the modern forms themselves.",
        ],
        references: cite(
          "irodori",
          "Lesson 3, page 18; scripts used in Japanese",
        ),
      },
    ],
  ),
];
