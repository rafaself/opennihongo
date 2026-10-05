import type { ParticleLesson } from "../types";
import { cite, example, p } from "./authoring";

export const foundationParticles: readonly ParticleLesson[] = [
  {
    id: "wa",
    glyph: "は",
    reading: "wa",
    title: "は: set the topic",
    role: "Topic",
    minutes: 3,
    summary: "Give the listener a topic, then say something about it.",
    paragraphs: [
      "Imagine putting a small label on the conversation: ‘about this…’. は follows a word or phrase and presents it as the topic. The rest of the sentence tells the listener something about that topic.",
      "In 私はコーヒーを飲みます, 私 means ‘I’. は makes me the topic, while を gives coffee a different job. The two particles connect different parts of the same sentence. は is written with the kana は, but its particle pronunciation is wa.",
    ],
    note: "は does not mean ‘is’. In お茶はおいしいです, おいしいです supplies the description. は can also express contrast, and the choice between は and が depends on the conversation. These examples introduce a useful starting point, not a rule for every sentence.",
    relatedIds: ["ga", "wo"],
    examples: [
      example(
        "wa-coffee",
        "Talking about myself",
        [
          "私",
          p(
            "wa",
            "は",
            "Marks 私 as the topic: this sentence tells you something about me.",
          ),
          "コーヒー",
          p("wo", "を", "Marks コーヒー as what is being drunk."),
          "飲みます。",
        ],
        "Watashi wa kōhī o nomimasu.",
        "I drink coffee.",
        "You are describing one of your habits. The sentence is about you.",
      ),
      example(
        "wa-tea",
        "Talking about tea",
        [
          "お茶",
          p(
            "wa",
            "は",
            "Makes お茶 the topic, then describes the tea as delicious.",
          ),
          "おいしいです。",
        ],
        "Ocha wa oishii desu.",
        "The tea is delicious.",
        "The tea is already part of the conversation. You say something about it.",
      ),
    ],
    check: {
      prompt:
        "You want to introduce what a sentence is about. Which particle marks that topic in these examples?",
      options: [
        {
          particleId: "wa",
          explanation:
            "は presents a topic. What follows says something about that topic.",
        },
        {
          particleId: "wo",
          explanation:
            "を marks an object in the action examples, rather than introducing a topic.",
        },
        {
          particleId: "no",
          explanation:
            "の connects nouns, such as ‘my book’. It is not the topic marker here.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 3, L3-14: N1はN2です; Lesson 5, L5-26: NをV-ます",
    ),
  },
  {
    id: "ga",
    glyph: "が",
    reading: "ga",
    title: "が: identify who or what",
    role: "Subject",
    minutes: 3,
    summary:
      "Identify the person or thing being described, appearing, or doing something.",
    paragraphs: [
      "You look into a room and notice a cat. 猫がいます introduces what is there: a cat. が follows 猫 and marks the person or thing whose presence is being described. This role is commonly called the subject.",
      "が is also useful when asking or answering who or what: だれが来ますか asks who is coming. Focus on the whole question and its situation, rather than trying to translate が into one English word.",
    ],
    note: "は and が are not interchangeable labels for ‘is’. は can set the topic or a contrast; が marks a subject, and it can help identify who or what. The same English translation may conceal different Japanese focus. Subjects are not always people doing an action: 猫がいます describes existence.",
    relatedIds: ["wa", "ni"],
    examples: [
      example(
        "ga-cat",
        "Noticing a cat",
        [
          "部屋",
          p("ni", "に", "Gives the room as the location where the cat is."),
          "猫",
          p(
            "ga",
            "が",
            "Identifies 猫, the cat whose presence is being introduced.",
          ),
          "います。",
        ],
        "Heya ni neko ga imasu.",
        "There is a cat in the room.",
        "Someone asks what is in the room. You introduce the cat.",
      ),
      example(
        "ga-who",
        "Asking who",
        [
          "だれ",
          p(
            "ga",
            "が",
            "Marks だれ (‘who’) as the person you want to identify.",
          ),
          "来ます",
          p("ka", "か", "Makes this polite sentence a question."),
          "。",
        ],
        "Dare ga kimasu ka.",
        "Who is coming?",
        "You want to find out which person is coming.",
      ),
    ],
    check: {
      prompt:
        "In 猫がいます (‘there is a cat’), which particle marks the cat whose presence is being described?",
      options: [
        {
          particleId: "ga",
          explanation: "が marks 猫, the subject of this existence sentence.",
        },
        {
          particleId: "wo",
          explanation:
            "を would mark an object in an action pattern. います describes a living thing being present.",
        },
        {
          particleId: "de",
          explanation:
            "で can mark where an activity happens. It does not mark the cat here.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 7, L7-24: [place]にNがあります; Lesson 8, L8-18: [person]は[place]にいます",
    ),
  },
  {
    id: "wo",
    glyph: "を",
    reading: "o",
    title: "を: mark the object",
    role: "Object",
    minutes: 3,
    summary: "Show what someone eats, drinks, reads, or otherwise acts on.",
    paragraphs: [
      "Picture an action with something involved: drinking water, reading a book, eating rice. In these patterns, を follows that thing and connects it to the action. 水を飲みます tells you what is drunk: water.",
      "The verb supplies the action, so learning the particle together with a useful verb is helpful. 本を読みます is ‘read a book’. を does not tell you who is reading; the reader can be supplied by the situation or another part of the sentence.",
    ],
    note: "The particle を is pronounced o in ordinary modern speech. You may see ‘wo’ in typing conventions or romanization charts. This lesson introduces direct objects; を also occurs in other patterns, such as routes and places left behind, which need their own examples.",
    relatedIds: ["wa", "ga"],
    examples: [
      example(
        "wo-water",
        "Drinking water",
        [
          "水",
          p("wo", "を", "Marks 水 as the thing being drunk."),
          "飲みます。",
        ],
        "Mizu o nomimasu.",
        "I drink water.",
        "The conversation makes the drinker clear. Focus on what is being drunk.",
      ),
      example(
        "wo-book",
        "Reading a book",
        ["本", p("wo", "を", "Marks 本 as what is being read."), "読みます。"],
        "Hon o yomimasu.",
        "I read a book.",
        "A book is the object of the reading action.",
      ),
    ],
    check: {
      prompt:
        "You want to say ‘drink water’. Which particle links 水 to 飲みます as the thing being drunk?",
      options: [
        {
          particleId: "ga",
          explanation:
            "が marks a subject. This prompt asks for the object of 飲みます.",
        },
        {
          particleId: "wo",
          explanation: "水を飲みます uses を to mark water as what is drunk.",
        },
        {
          particleId: "no",
          explanation:
            "の connects nouns. Here we need to connect water to a drinking action.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 5, L5-26: NをV-ます; Lesson 18, L18-19: relationship between verbs and particles",
    ),
  },
];
