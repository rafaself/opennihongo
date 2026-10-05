import { chapter, cite } from "./authoring";

export const kanaHistoryChapters = [
  chapter(
    "hiragana",
    "The development of hiragana",
    "Follow flowing handwriting into the world of poems, letters, and diaries.",
    [
      {
        kind: "explanation",
        title: "Write the sound with a flowing shape",
        paragraphs: [
          "A character can look very different when it is carefully written stroke by stroke and when it is written in a flowing hand. With a brush, strokes can be connected, shortened, or reshaped through cursive writing. Characters used for Japanese sounds participated in these handwriting traditions too.",
          "Over time, increasingly cursive forms contributed to the shapes we recognize as hiragana — 平仮名. Their connection with sound-bearing Chinese characters remained important, even as the written signs became distinct from a full kanji. This was a gradual development, rather than someone replacing an entire alphabet in one sitting.",
        ],
        references: cite("mext", "Hiragana development"),
      },
      {
        kind: "character-comparison",
        title: "A source is hiding in the history",
        characterIds: [
          "hiragana-a",
          "hiragana-i",
          "hiragana-u",
          "hiragana-e",
          "hiragana-o",
          "hiragana-ka",
          "hiragana-sa",
          "hiragana-to",
        ],
        mode: "origins",
        introduction:
          "Explore eight examples, from 安 → あ to 止 → と. Choose a character, look for a resemblance, then read the origin explanation. The arrow summarizes cursive development across changing handwritten forms; it does not depict a literal one-step change or ask you to trace one typeface into another.",
        references: cite("jeed", "Chapter 7, Figure 15, page 119"),
      },
      {
        kind: "explanation",
        title: "A poem is also a piece of handwriting",
        paragraphs: [
          "In the Heian court, poems and letters were part of social life. The words mattered, and so did the way a writer put them on the page. A practiced hand could express refinement; the movement and arrangement of brush writing became part of the experience of reading.",
          "Picture the exchange of a short poem. This is an imagined scene, but it reflects the documented importance of such exchanges: the recipient encounters a person’s words through their handwriting. Kana belonged to a culture of literary expression and visual experimentation, not simply a race to write faster.",
          "Poetry, diaries, and narrative prose gave Japanese-language writing important settings. Court women played a prominent role in this literature, including Murasaki Shikibu, the author of The Tale of Genji. The social story helps us understand why hiragana flourished; it does not make one person or one group the inventor of the whole script.",
        ],
        references: cite(
          "met-calligraphy",
          "Court Calligraphy; Women’s Calligraphy and the Japanese Classics",
        ),
      },
      {
        kind: "explanation",
        title: "Why the connection matters",
        paragraphs: [
          "Return to 安 and あ. The source character was useful for its sound in this lineage. Its cursive descendants could keep that sound-bearing job as their shapes changed. Modern あ is therefore connected to earlier writing, even if the relationship is not obvious when you first see it in a font.",
          "The printed pairs leave out many intermediate hands and forms. You do not need to reconstruct every brush movement or memorize which kanji stands behind each hiragana. When you begin learning kana, keep the more useful connection: these shapes grew out of writing practices, and the sound role helped them become a script in their own right.",
        ],
        references: cite("takada", "Section 2; hiragana development"),
      },
      {
        kind: "note",
        title: "People and uses were diverse",
        paragraphs: [
          "Hiragana is often linked with women’s writing, and unequal access to Chinese-language education is part of that history. But men also wrote in kana. Ki no Tsurayuki’s Tosa Diary, for example, uses the voice of a female narrator. ‘Only women used hiragana’ would hide the variety of writers and literary choices involved.",
        ],
        references: cite(
          "frellesvig",
          "Chapter 6 summary; hiragana literature and Tosa Nikki",
        ),
      },
    ],
  ),
  chapter(
    "katakana",
    "The development of katakana",
    "A reader’s small notes helped give rise to a different kind of kana.",
    [
      {
        kind: "explanation",
        title: "Smaller signs beside a text",
        paragraphs: [
          "Now imagine a different page: a text written in Chinese, with small notes helping a reader work through it. The main text and the reader’s annotations have different jobs. One preserves the text being studied; the other can help with readings and interpretation.",
          "Reading and annotation practices supplied an important setting for the development of katakana — 片仮名. Abbreviated forms or portions of characters used phonetically could supply compact sound signs. Katakana’s history overlaps with hiragana’s, but follows a different path from increasingly cursive handwriting.",
        ],
        references: cite("mext", "Katakana development"),
      },
      {
        kind: "character-comparison",
        title: "Compare a character with a useful portion",
        characterIds: ["katakana-a", "katakana-ka"],
        mode: "origins",
        introduction:
          "Choose 阿 → ア or 加 → カ and read the component callout. A portion of a larger character becomes a useful sound sign. Modern typefaces make the comparison clear, but they do not reproduce historical annotation marks exactly.",
        references: cite("irodori", "Lesson 3, page 18; katakana origins"),
      },
      {
        kind: "diagram",
        title: "Two paths from Chinese characters",
        nodes: [
          {
            id: "source",
            label: "Characters used phonetically",
            detail: "Chinese-character forms supplying Japanese sounds.",
          },
          {
            id: "hiragana",
            label: "Hiragana",
            detail: "Develops through increasingly cursive writing.",
          },
          {
            id: "katakana",
            label: "Katakana",
            detail: "Develops through abbreviated forms and components.",
          },
        ],
        edges: [
          { from: "source", to: "hiragana", label: "Cursive transformation" },
          { from: "source", to: "katakana", label: "Abbreviation" },
        ],
        references: cite("mext", "Origins of hiragana and katakana"),
      },
      {
        kind: "explanation",
        title: "Room for a note, not another full character",
        paragraphs: [
          "Think about adding a pronunciation reminder beside a line you are studying. In this imagined example, a short sign is convenient because it has to sit alongside the main text. The reader does not need another full character explaining an idea; they need a clue to a sound or a reading.",
          "Abbreviation provides one way to make such a sign. The pair 加 → カ is especially easy to inspect: the modern katakana resembles part of its source character. Compare it with 加 → か from the previous chapter. The same source can be connected with two different outcomes because writers transformed it in different ways.",
          "That contrast is the heart of the story. Hiragana and katakana are historically related to Chinese-character use, but neither is simply a decorative version of the other. Their later modern roles grew from further changes in writing conventions; early annotation does not explain every present-day use of katakana.",
        ],
        references: [
          ...cite(
            "kokugakuin",
            "Historical academic and reading uses of katakana",
          ),
          ...cite("sng", "Shared source 加 for か and カ"),
        ],
      },
      {
        kind: "note",
        title: "A helpful example, not a rule for every shape",
        paragraphs: [
          "The comparison 加 → カ makes abbreviation especially easy to notice. Individual katakana histories can be more complicated, and not every modern character is an exact unchanged fragment of a modern kanji font. The two development paths are an introductory model.",
        ],
        references: cite(
          "sng",
          "Shared source 加 for hiragana か and katakana カ",
        ),
      },
    ],
  ),
];
