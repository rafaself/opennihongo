import type { ParticleLesson } from "../types";
import { cite, example, p } from "./authoring";

export const placeParticles: readonly ParticleLesson[] = [
  {
    id: "ni",
    glyph: "に",
    reading: "ni",
    title: "に: point to a destination or location",
    role: "Destination / location",
    minutes: 3,
    summary: "Connect a place to going there or to someone being there.",
    paragraphs: [
      "Imagine an arrow pointing to a place. With 行きます (‘go’), に marks the destination: 学校に行きます means going to school. The particle follows the place; the verb tells you how that place relates to the sentence.",
      "Now imagine a pin on a map rather than a journey. With います (‘be present’, for people and animals), に can locate someone: 猫は部屋にいます. The room is where the cat is, rather than a place where an activity is taking place.",
    ],
    note: "に has several jobs, including certain time expressions and recipients. These examples focus on destinations and existence. Avoid the shortcut ‘に means in’: the English wording changes with the verb. Compare the room in 猫は部屋にいます with the school in 学校で勉強します.",
    relatedIds: ["de", "he", "ga"],
    examples: [
      example(
        "ni-school",
        "A destination",
        [
          "学校",
          p("ni", "に", "Marks 学校 as the destination of 行きます."),
          "行きます。",
        ],
        "Gakkō ni ikimasu.",
        "I go to school.",
        "You describe where you are going.",
      ),
      example(
        "ni-room",
        "Where the cat is",
        [
          "猫",
          p(
            "wa",
            "は",
            "Sets the cat as the topic: you are explaining where it is.",
          ),
          "部屋",
          p("ni", "に", "Locates the cat in 部屋, the room, with います."),
          "います。",
        ],
        "Neko wa heya ni imasu.",
        "The cat is in the room.",
        "The cat is already being discussed. You tell someone its location.",
      ),
    ],
    check: {
      prompt:
        "In 猫は部屋にいます, which particle follows the room to show the cat’s location with います?",
      options: [
        {
          particleId: "ni",
          explanation: "に marks the location in this います pattern.",
        },
        {
          particleId: "de",
          explanation:
            "で marks the place of an activity in the examples here. This sentence describes the cat being present.",
        },
        {
          particleId: "wo",
          explanation:
            "を marks an object in action patterns, not the room in this existence sentence.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 8, L8-18: [person]は[place]にいます; Lesson 13, L13-23–24: destinations and に uses; Lesson 18, L18-19: particle summary",
    ),
  },
  {
    id: "de",
    glyph: "で",
    reading: "de",
    title: "で: place an activity or show a means",
    role: "Activity / means",
    minutes: 3,
    summary: "Say where an activity happens or how it is carried out.",
    paragraphs: [
      "Put an activity inside a setting: studying at school, eating at a café. で follows the place where the action happens. 学校で勉強します connects school to the studying activity, rather than making school a destination.",
      "で also introduces a means or method. バスで行きます describes going by bus. The same particle can answer different questions: ‘where does the activity happen?’ or ‘by what means?’. The word and verb around it help you decide.",
    ],
    note: "Compare 学校に行きます (‘go to school’) and 学校で勉強します (‘study at school’). The place name stays the same, but its relationship to the verb changes. に and で are not two spellings of a general English ‘at’. This is an introductory contrast, not a complete list of either particle’s uses.",
    relatedIds: ["ni", "wo"],
    examples: [
      example(
        "de-school",
        "A place for an action",
        [
          "学校",
          p("de", "で", "Marks 学校 as where the studying activity happens."),
          "勉強します。",
        ],
        "Gakkō de benkyō shimasu.",
        "I study at school.",
        "You describe the setting of an activity.",
      ),
      example(
        "de-bus",
        "A way to travel",
        [
          "バス",
          p("de", "で", "Marks バス as the means of transportation."),
          "学校",
          p(
            "ni",
            "に",
            "Marks 学校 as the destination, a different job from the bus’s で.",
          ),
          "行きます。",
        ],
        "Basu de gakkō ni ikimasu.",
        "I go to school by bus.",
        "The bus is how you travel; school is where you go.",
      ),
    ],
    check: {
      prompt:
        "Which particle follows 学校 when you want to give the place where 勉強します (‘study’) happens?",
      options: [
        {
          particleId: "ni",
          explanation:
            "に marks a destination with 行きます or a location with an existence verb. This prompt is about the setting of studying.",
        },
        {
          particleId: "de",
          explanation:
            "学校で勉強します uses で for the place of the activity.",
        },
        {
          particleId: "ga",
          explanation:
            "が identifies a subject; this prompt asks for the place of an activity.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 8, L8-18: [place]でV-ます; Lesson 13, L13-25: transportation; Elementary 1, Lesson 9, L9-18: Nで (means)",
    ),
  },
  {
    id: "he",
    glyph: "へ",
    reading: "e",
    title: "へ: give a direction",
    role: "Direction",
    minutes: 3,
    summary:
      "Point a journey toward a place, with a special particle pronunciation.",
    paragraphs: [
      "Imagine facing toward your next stop. へ follows a place and gives the direction of movement. 京都へ行きます describes going to Kyoto. You also meet へ with verbs for coming and returning.",
      "The written kana is へ, but this particle is pronounced e. Read 京都へ as Kyōto e. A kana chart’s usual ‘he’ reading and this particle pronunciation belong to different uses of the same written character.",
    ],
    note: "With a going expression, に and へ can both be possible: 京都に行きます and 京都へ行きます. に can present the destination and へ the direction. Do not assume one makes a travel sentence wrong, or that ‘direction’ means you will never arrive. に has other uses where へ cannot simply replace it.",
    relatedIds: ["ni"],
    examples: [
      example(
        "he-kyoto",
        "Going to Kyoto",
        [
          "京都",
          p(
            "he",
            "へ",
            "Gives 京都 as the direction of the journey. Read this particle e.",
          ),
          "行きます。",
        ],
        "Kyōto e ikimasu.",
        "I go to Kyoto.",
        "You describe a journey toward Kyoto.",
      ),
      example(
        "he-home",
        "Returning home",
        [
          "家",
          p("he", "へ", "Points the returning movement toward 家, home."),
          "帰ります。",
        ],
        "Ie e kaerimasu.",
        "I return home.",
        "帰ります describes returning. へ supplies the direction.",
      ),
    ],
    check: {
      prompt:
        "Which particle in 京都へ行きます is written へ but pronounced e?",
      options: [
        {
          particleId: "he",
          explanation: "へ is pronounced e when it is this direction particle.",
        },
        {
          particleId: "ni",
          explanation:
            "に can also mark a destination, but its written form and pronunciation are ni.",
        },
        {
          particleId: "de",
          explanation:
            "で is pronounced de and can mark an activity’s place or means.",
        },
      ],
    },
    references: cite(
      "Starter, Lesson 18, L18-18: [place]へ行きます; L18-19: particle summary",
    ),
  },
];
