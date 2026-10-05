import type { ParticleLesson } from "../types";
import { cite, example, p } from "./authoring";

export const conversationParticles: readonly ParticleLesson[] = [
  {
    id: "mo",
    glyph: "も",
    reading: "mo",
    title: "も: add another to the idea",
    role: "Also / too",
    minutes: 3,
    summary:
      "Include another person or thing in something already being discussed.",
    paragraphs: [
      "Someone says they are a student. You are a student too: 私も学生です. も follows 私 and adds you to the same idea. Its meaning depends on that earlier connection, whether spoken or understood.",
      "You can also extend an action to another thing. After discussing drinking coffee, お茶も飲みます adds tea: I drink tea too. Listen for what is being added, rather than treating も as an unrelated decoration.",
    ],
    note: "In these examples, も takes the place of は or を: 私も, お茶も. Do not insert はも or をも into these patterns. Other particles can combine with も in other constructions, such as にも; this first lesson does not cover every combination.",
    relatedIds: ["wa", "wo"],
    examples: [
      example(
        "mo-student",
        "Me too",
        [
          "私",
          p(
            "mo",
            "も",
            "Adds 私 to the already-discussed idea of being a student.",
          ),
          "学生です。",
        ],
        "Watashi mo gakusei desu.",
        "I am a student too.",
        "Another person has just said they are a student. You share that fact.",
      ),
      example(
        "mo-tea",
        "Tea as well",
        [
          "お茶",
          p("mo", "も", "Adds お茶 to the drinks already being discussed."),
          "飲みます。",
        ],
        "Ocha mo nomimasu.",
        "I drink tea too.",
        "Coffee has already been mentioned. You also drink tea.",
      ),
    ],
    check: {
      prompt:
        "Someone has said they are a student. Which particle after 私 adds ‘I am a student too’?",
      options: [
        {
          particleId: "wa",
          explanation:
            "は introduces a topic; it does not itself supply the ‘too’ connection requested here.",
        },
        {
          particleId: "mo",
          explanation:
            "私も学生です adds you to the same fact: you are a student too.",
        },
        {
          particleId: "no",
          explanation:
            "の connects nouns, rather than adding another person to this statement.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 3, L3-16–17: Nも; Lesson 18, L18-18: adding another object with も",
    ),
  },
  {
    id: "ka",
    glyph: "か",
    reading: "ka",
    title: "か: ask a polite question",
    role: "Question",
    minutes: 3,
    summary:
      "Turn a polite statement into a question by adding a marker at the end.",
    paragraphs: [
      "Start with 学生です: someone is a student. Add か at the end and it becomes 学生ですか: are they a student? The situation can make the person clear, so a pronoun is not always needed.",
      "か also works after a polite verb: お茶を飲みますか asks whether someone drinks tea. Keep the other particles in place; か gives the whole sentence the job of asking a question.",
    ],
    note: "This lesson uses polite です and ます questions. Casual questions can work differently, including rising intonation without か. Do not assume that adding か to every casual statement produces the same friendly question. A written question mark is not the particle itself.",
    relatedIds: ["wa", "ga", "wo"],
    examples: [
      example(
        "ka-student",
        "Asking about someone",
        [
          "学生です",
          p("ka", "か", "Makes the polite statement 学生です into a question."),
          "。",
        ],
        "Gakusei desu ka.",
        "Are you a student?",
        "You are speaking to someone, so the person you mean is clear.",
      ),
      example(
        "ka-tea",
        "Asking about a habit",
        [
          "お茶",
          p(
            "wo",
            "を",
            "Marks tea as what is drunk. Its job stays the same inside a question.",
          ),
          "飲みます",
          p("ka", "か", "Makes the whole polite verb sentence a question."),
          "。",
        ],
        "Ocha o nomimasu ka.",
        "Do you drink tea?",
        "You ask someone about tea as a usual drink, rather than making a statement.",
      ),
    ],
    check: {
      prompt:
        "Which particle can you add after 学生です to make this polite sentence a question?",
      options: [
        {
          particleId: "ka",
          explanation:
            "学生ですか is the polite question form in this example.",
        },
        {
          particleId: "wo",
          explanation:
            "を marks an object in the action examples. It is not the question ending here.",
        },
        {
          particleId: "mo",
          explanation:
            "も adds ‘also’ after a word or phrase; it does not supply this question ending.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 3, L3-16: Sか; Lesson 5, L5-25: polite and casual verb questions",
    ),
  },
];
