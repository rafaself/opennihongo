import { chapter, cite } from "./authoring";

export const foundationsChapters = [
  chapter(
    "before-writing",
    "Japanese before writing",
    "Begin with a message that needs to outlive the person speaking it.",
    [
      {
        kind: "explanation",
        title: "A message for someone who is not here",
        paragraphs: [
          "Imagine you need to tell a friend where to meet you tomorrow. If they are beside you, you can say it. If they are far away, someone might carry the message. But how could you leave the exact words behind for a person who will arrive after you have gone? This imagined situation gives us a useful starting question: how would you write Japanese if Japanese characters did not exist yet?",
          "Japanese already existed as a spoken language before an established tradition of writing it developed. People could speak, sing, tell stories, and share knowledge without a Japanese writing system. Writing brought another possibility: putting language into visible signs that other people could read later.",
        ],
        references: cite("rekihaku", "Prologue; formation of literate culture"),
      },
      {
        kind: "diagram",
        title: "How would you write Japanese without Japanese characters?",
        nodes: [
          {
            id: "speech",
            label: "Spoken Japanese",
            detail: "Words and stories can be shared aloud.",
          },
          {
            id: "record",
            label: "A lasting record",
            detail: "Writing lets a message travel beyond its speaker.",
          },
          {
            id: "choice",
            label: "Choose signs",
            detail: "Which visible signs could represent those words?",
          },
        ],
        edges: [
          { from: "speech", to: "record", label: "A new need" },
          { from: "record", to: "choice", label: "A problem to solve" },
        ],
        references: cite("rekihaku", "Characters and life culture"),
      },
      {
        kind: "explanation",
        title: "A picture is a start, but words do more",
        paragraphs: [
          "Think back to the meeting message. A drawing of a river might suggest a place, but would it say ‘tomorrow,’ ‘after the rain,’ or ‘please wait for me’? Pictures can communicate, yet a shared writing system can represent the wording and relationships of a message much more precisely.",
          "Readers also need a convention they recognize. A mark that means something only to its maker is difficult for someone else to interpret. The historical challenge was therefore larger than choosing attractive shapes: writers needed ways to connect visible signs with a language people already spoke. This is a thought experiment, not a reconstruction of one particular ancient message.",
        ],
        references: cite("rekihaku", "Formation and use of literate culture"),
      },
      {
        kind: "explanation",
        title: "Borrow a useful tool",
        paragraphs: [
          "The solution did not have to begin with inventing a whole set of letters. Across the sea, Chinese characters were already part of a long writing tradition. Through contact with continental East Asia, people in Japan encountered both written objects and people who knew how to read and write them.",
          "That offered a powerful starting point, but also a puzzle. Borrowing a writing system does not mean that the language you speak becomes the language it was developed for. Japanese writers would have to adapt the available tools. The next chapter follows the people, texts, and everyday uses that made those tools increasingly important.",
        ],
        references: cite(
          "rekihaku",
          "Transmission of characters; use of characters",
        ),
      },
      {
        kind: "note",
        title: "History has gaps",
        paragraphs: [
          "Not having an established writing tradition is different from having no culture or complex language. We also should not mistake the earliest surviving written object for the first time anyone used writing.",
        ],
        references: cite(
          "rekihaku",
          "Outline of exhibition; archaeological evidence",
        ),
      },
    ],
  ),
  chapter(
    "adopting-kanji",
    "Adopting Chinese characters",
    "Follow people, religious texts, and wooden tablets into a growing written culture.",
    [
      {
        kind: "explanation",
        title: "A writing tradition travels",
        paragraphs: [
          "Imagine receiving an object with unfamiliar marks on it. Seeing the marks would not automatically teach you how to read them. You would need someone who understood the language and writing practices behind them. That distinction matters when we talk about the characters called kanji — 漢字 — whose roots lie in Chinese writing.",
          "Written culture spread through sustained contact with continental East Asia. People and kingdoms on the Korean peninsula were important participants in those exchanges. Objects bearing characters, knowledgeable writers, and texts carried more than shapes: they carried skills and ways of using writing.",
          "Government needed records and communication; Buddhist learning involved texts to read and copy. These settings helped create reasons to train writers and keep written materials. Encountering characters and establishing regular writing practices were connected developments, rather than one event shared by everyone in Japan.",
        ],
        references: cite(
          "rekihaku",
          "Outline; prologue; religion and characters; epilogue",
        ),
      },
      {
        kind: "diagram",
        title: "Exchange creates a need for adaptation",
        nodes: [
          {
            id: "japanese",
            label: "Spoken Japanese",
            detail: "A language already used by its speakers.",
          },
          {
            id: "chinese",
            label: "Chinese written culture",
            detail: "Characters, texts, and ways of using writing.",
          },
          {
            id: "adapt",
            label: "Adaptation",
            detail: "Make the adopted tools serve Japanese.",
          },
        ],
        edges: [
          { from: "japanese", to: "adapt", label: "Local language" },
          { from: "chinese", to: "adapt", label: "Cultural exchange" },
        ],
        references: cite("rekihaku", "Transmission and use of characters"),
      },
      {
        kind: "explanation",
        title: "A message on a strip of wood",
        paragraphs: [
          "One tangible trace of this growing written culture is the mokkan: a narrow wooden tablet with writing on it. Such tablets were used in ancient Japan, and excavations at the former Heijō Palace in Nara and other sites have brought them back into view. Writing belonged to material objects that people handled, not only to beautiful books.",
          "A tablet could even be reused. When its writing was no longer needed, the surface could be shaved away to make room for another message. This small practical detail makes the distant past easier to imagine: someone prepared a surface, wrote something another reader needed, and later cleared it for another use.",
          "A surviving tablet gives us evidence of writing in a particular setting. It cannot tell us the first day anyone in Japan encountered characters. Many contacts and practices lie behind the objects that happen to survive.",
        ],
        references: cite(
          "mokkan",
          "Mokkan glossary entry; Japanese and English descriptions",
        ),
      },
      {
        kind: "timeline",
        title: "Several kinds of contact",
        entries: [
          {
            label: "Encounter",
            detail: "Characters appear on objects and in exchanges.",
          },
          {
            label: "Transmission",
            detail:
              "People able to read and write, along with religious and other texts, convey knowledge through continental connections.",
          },
          {
            label: "Established practice",
            detail:
              "Writing supports government and religious activity, as well as practical records on materials such as wooden tablets.",
          },
        ],
        references: cite(
          "rekihaku",
          "Outline; rule by characters; religion and characters",
        ),
      },
      {
        kind: "note",
        title: "No single arrival date",
        paragraphs: [
          "These stages overlapped. A familiar story or an early artifact can illuminate part of the history, but cannot supply one precise date when all of Japan suddenly adopted kanji.",
        ],
        references: cite("rekihaku", "Outline of exhibition"),
      },
    ],
  ),
  chapter(
    "adapting-writing",
    "Writing a different language",
    "A sign for an idea cannot, by itself, capture every word and ending in a sentence.",
    [
      {
        kind: "explanation",
        title: "A tool made for another language",
        paragraphs: [
          "Having access to Chinese characters did not immediately give Japanese speakers a ready-made way to write everything they said. The characters had developed in the context of Chinese. Japanese has different sound patterns and different ways of building words and sentences, including endings attached to words.",
          "A reader could study how to understand a Chinese text, while a writer faced a different question: how could these same written forms record Japanese? The challenge involved the language behind the page, not just the appearance of its characters.",
        ],
        references: cite("hasegawa", "Chapter 4, introduction and section 4.1"),
      },
      {
        kind: "diagram",
        title: "Two useful sides of a character",
        nodes: [
          {
            id: "character",
            label: "A Chinese character",
            detail: "A written form associated with meanings and readings.",
          },
          {
            id: "meaning",
            label: "Use its meaning",
            detail: "Connect the sign with a Japanese word or idea.",
          },
          {
            id: "sound",
            label: "Use its sound",
            detail: "Borrow a reading to represent part of a Japanese word.",
          },
        ],
        edges: [
          { from: "character", to: "meaning", label: "Meaning-based use" },
          { from: "character", to: "sound", label: "Phonetic use" },
        ],
        references: cite("takada", "Section 2; shape, sound and meaning"),
      },
      {
        kind: "explanation",
        title: "The idea is only part of the message",
        paragraphs: [
          "Think of a message about drinking. Naming the action is useful, but a full sentence also tells you who is drinking, what they drink, and how the words fit together. The same basic action can appear in different word forms. A writing practice needs some way to deal with that detail.",
          "In the modern Japanese sentence you will explore later, one kanji carries part of the word for ‘drink,’ while hiragana writes the rest of the verb form and the grammatical particles. Early writers did not already have this familiar modern solution. They experimented with the characters available to them.",
          "That helps explain why both meaning and sound mattered. A character could connect to a Japanese word through its meaning, or a writer could use a reading to represent a piece of the spoken word. Try following the two branches in the diagram above.",
        ],
        references: cite(
          "irodori",
          "Lesson 3, page 18; modern script roles used as a comparison",
        ),
      },
      {
        kind: "explanation",
        title: "More than one experiment",
        paragraphs: [
          "Some practices helped readers interpret texts written in Chinese. Other practices put Japanese words into writing, using meaning, sound, or combinations of both. A page of Chinese characters could therefore involve different languages and different reading strategies. These approaches developed alongside one another.",
          "The important next step is simple: a character could be useful even when its meaning was not the point. If its reading supplied the sound a writer needed, it could act as a sound sign. The next chapter follows that possibility into the world of Japanese poetry.",
        ],
        references: cite(
          "rekihaku",
          "Are 蚫 and 畠 Japanese characters?; use of characters",
        ),
      },
      {
        kind: "note",
        title: "A simplified comparison",
        paragraphs: [
          "Meaning and sound are useful lenses, not a complete description of every early text. We will follow phonetic use because it makes the later development of kana easier to understand.",
        ],
        references: cite("takada", "Section 2; origins of hiragana"),
      },
    ],
  ),
  chapter(
    "manyogana",
    "Man’yōgana: borrowing sounds",
    "Poetry helps reveal why recording the sounds of Japanese mattered.",
    [
      {
        kind: "explanation",
        title: "Look at what a character is doing",
        paragraphs: [
          "Imagine trying to keep a poem someone has spoken. Recording its general idea would preserve something, but the chosen words, sounds, and rhythm also belong to the poem. Writing Japanese phonetically offered a way to record those words using characters that already existed.",
          "Man’yōgana — 万葉仮名 — is a name used for Chinese characters employed to represent Japanese sounds. In that role, a character is selected for a reading rather than for the meaning of the message. The written shape may still look like a full kanji, even though it is doing a sound-bearing job.",
          "The name is associated with the Man’yōshū poetry collection. Phonetic use was not confined to that collection, and it was not one alphabet invented at a single moment. Understanding the job of a character matters more here than learning a list of substitutions.",
        ],
        references: cite(
          "takada",
          "Section 2; definition and development of Man’yōgana",
        ),
      },
      {
        kind: "character-comparison",
        title: "One form, different jobs",
        characterIds: ["kanji-an"],
        mode: "phonetic-use",
        meaningExplanation: "A meaning associated with this character.",
        soundExplanation:
          "A borrowed sound in this example, not its usual modern dictionary reading.",
        introduction:
          "Switch between meaning and sound. Here 安 illustrates how a character could contribute /a/ in phonetic writing. This is a teaching example, not a claim that its usual modern reading is simply ‘a’.",
        references: cite("mext", "Man’yōgana and hiragana source table"),
      },
      {
        kind: "explanation",
        title: "A poetry collection with many voices",
        paragraphs: [
          "The Man’yōshū brings together poems associated with people from different walks of life, including members of the court, officials, and soldiers. Love, travel, grief, and encounters with the landscape all appear in the collection. Its voices remind us that the history of writing is also a history of people trying to preserve experiences.",
          "The poems were recorded with Chinese characters before the familiar modern kana conventions. Meaning-based and phonetic uses could appear together; the collection is not simply a long text written in one uniform sound code. A reader needed to understand how the characters were being used in context.",
          "Now try the comparison above. When 安 supplies /a/ in our example, the reader is looking for a sound, rather than inserting the character’s meaning into the poem. Once a character serves that phonetic role, its shape can change while its useful sound-bearing job continues. That is the connection we follow toward kana.",
        ],
        references: [
          ...cite("manyoshu", "Sections 2–3; the collection and its writing"),
          ...cite("mext", "Man’yōgana and hiragana source table"),
        ],
      },
      {
        kind: "diagram",
        title: "The bridge to kana",
        nodes: [
          {
            id: "kanji",
            label: "Chinese characters",
            detail: "Written forms with meanings and readings.",
          },
          {
            id: "manyogana",
            label: "Man’yōgana",
            detail: "Use characters to represent Japanese sounds.",
          },
          {
            id: "kana",
            label: "Kana development",
            detail:
              "Cursive forms and abbreviations become useful sound signs.",
          },
        ],
        edges: [
          { from: "kanji", to: "manyogana", label: "Phonetic use" },
          { from: "manyogana", to: "kana", label: "Changing written forms" },
        ],
        references: cite("mext", "Origins of hiragana and katakana"),
      },
      {
        kind: "note",
        title: "You do not need to memorize these mappings",
        paragraphs: [
          "Different characters could represent the same sound. Early sound distinctions also do not map perfectly onto modern Japanese. For now, remember the idea of borrowing sounds; the next chapters show what happened to the shapes.",
        ],
        references: cite("takada", "Section 2; multiple forms for one sound"),
      },
    ],
  ),
];
