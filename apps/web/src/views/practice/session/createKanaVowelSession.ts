import { hiraganaVowels, kanaVowelLessonProfile } from "@opennihongo/content";
import {
  buildExerciseSession,
  generateTypedAnswerExercise,
  orderedSelectionStrategy,
  SeededRandomSource,
} from "@opennihongo/core";

/** Composition only: the content profile and core builder own the lesson sequence. */
export function createKanaVowelSession(sessionId: string) {
  return buildExerciseSession<(typeof hiraganaVowels)[number]>({
    sessionId,
    profile: kanaVowelLessonProfile,
    eligibleItems: hiraganaVowels,
    selectionStrategy: orderedSelectionStrategy,
    sourceAdapters: {
      "typed-answer": (item) => ({
        id: item.id,
        prompt: { text: item.glyph },
        acceptedAnswers: [item.romanization],
      }),
    },
    generators: { "typed-answer": generateTypedAnswerExercise },
    random: new SeededRandomSource("kana-lesson:vowels"),
  });
}
