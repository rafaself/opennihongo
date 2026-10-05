import type { ParticleLesson } from "../types";
import { cite, example, p } from "./authoring";

export const connectionParticles: readonly ParticleLesson[] = [
  {
    id: "no",
    glyph: "の",
    reading: "no",
    title: "の: connect two nouns",
    role: "Noun connection",
    minutes: 3,
    summary:
      "Describe one noun through another: whose book, what kind, or which connection.",
    paragraphs: [
      "Imagine two labels joined together. In 私の本, 私 (‘I’) helps describe 本 (‘book’): my book. の connects the nouns, with the description coming before the noun it describes.",
      "Possession is only one possible connection. 日本語の本 means a Japanese-language book, or a book about Japanese depending on context. の links 日本語 and 本 without saying that a language literally owns a book.",
    ],
    note: "Do not replace every の with English ‘of’ or an apostrophe. The relationship comes from the nouns and their context. This lesson focuses on noun connections; の has other grammatical uses that need separate explanations.",
    relatedIds: ["wa", "to"],
    examples: [
      example(
        "no-mine",
        "Whose book?",
        [
          "これ",
          p("wa", "は", "Makes ‘this’ the topic."),
          "私",
          p("no", "の", "Connects 私 to 本: the book belongs to me."),
          "本です。",
        ],
        "Kore wa watashi no hon desu.",
        "This is my book.",
        "You explain who owns the book in front of you.",
      ),
      example(
        "no-language",
        "A kind of book",
        [
          "日本語",
          p(
            "no",
            "の",
            "Connects 日本語 to 本, describing a book associated with Japanese.",
          ),
          "本です。",
        ],
        "Nihongo no hon desu.",
        "It is a Japanese-language book.",
        "You are describing the book’s language. The situation supplies what ‘it’ refers to.",
      ),
    ],
    check: {
      prompt: "Which particle joins 私 and 本 to form ‘my book’?",
      options: [
        {
          particleId: "no",
          explanation: "私の本 uses の to connect the owner to the book.",
        },
        {
          particleId: "wo",
          explanation:
            "を would connect an object to an action, rather than make this noun phrase.",
        },
        {
          particleId: "ka",
          explanation:
            "か marks a question in the polite sentence patterns here.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 4, L4-20: N1のN2; Pre-Intermediate, Lesson 15, L15-26: noun relationships",
    ),
  },
  {
    id: "to",
    glyph: "と",
    reading: "to",
    title: "と: join nouns or do something together",
    role: "And / with",
    minutes: 3,
    summary: "List nouns together, or name the person sharing an activity.",
    paragraphs: [
      "On a small shopping list, パンと牛乳 joins bread and milk. と sits between the nouns and lists those items together. The rest of a sentence can then give that list a job, such as the objects you buy.",
      "After a person, と can mean doing something with that person. 友だちと話します describes talking with a friend. In a longer sentence, another particle can explain where the conversation happens.",
    ],
    note: "These are two uses of と, rather than one English translation that fits everywhere. Joining nouns with と is not a general way to join any two Japanese sentences. Quoting words and other uses of と are topics for later lessons.",
    relatedIds: ["no", "de", "wo"],
    examples: [
      example(
        "to-shopping",
        "Two things to buy",
        [
          "パン",
          p("to", "と", "Joins パン and 牛乳 as the two listed items."),
          "牛乳",
          p(
            "wo",
            "を",
            "Marks the bread-and-milk list as what is being bought.",
          ),
          "買います。",
        ],
        "Pan to gyūnyū o kaimasu.",
        "I buy bread and milk.",
        "You say which two items you are buying.",
      ),
      example(
        "to-friend",
        "With a friend",
        [
          "友だち",
          p("to", "と", "Names 友だち as the person you talk with."),
          "話します。",
        ],
        "Tomodachi to hanashimasu.",
        "I talk with a friend.",
        "You describe the person sharing the conversation.",
      ),
    ],
    check: {
      prompt: "Which particle joins パン and 牛乳 to list ‘bread and milk’?",
      options: [
        {
          particleId: "ni",
          explanation:
            "に supplies a destination or location in the examples here, rather than joining this list.",
        },
        {
          particleId: "to",
          explanation: "パンと牛乳 lists bread and milk together.",
        },
        {
          particleId: "ga",
          explanation:
            "が can mark a subject, but does not join these two nouns into a list.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 4, L4-18: N1とN2; Lesson 11, L11-22: [person]と[place]でV-ます",
    ),
  },
];
