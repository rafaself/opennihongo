import {
  generateMatchingExercise,
  generateTypedAnswerExercise,
  randomWithoutReplacementSelectionStrategy,
  SeededRandomSource,
  buildExerciseSession,
} from "@opennihongo/core";
import {
  initialKanaPracticeSessionProfile,
  kanaBeginnerWords,
} from "@opennihongo/content";

/** Builds one reproducible practice session from the authored Kana profile. */
export function createKanaPracticeSession(revision: number) {
  const sessionId = `kana-practice:${String(revision)}`;

  return buildExerciseSession<(typeof kanaBeginnerWords)[number]>({
    sessionId,
    profile: initialKanaPracticeSessionProfile,
    eligibleItems: kanaBeginnerWords,
    selectionStrategy: randomWithoutReplacementSelectionStrategy,
    sourceAdapters: {
      "typed-answer": (word) => ({
        id: word.id,
        prompt: { text: word.hiragana },
        acceptedAnswers: [word.romanization],
      }),
      matching: (word) => ({
        id: word.id,
        left: word.romanization,
        right: word.hiragana,
      }),
    },
    generators: {
      "typed-answer": generateTypedAnswerExercise,
      matching: generateMatchingExercise,
    },
    random: new SeededRandomSource(sessionId),
  });
}

/** The first session is ready before the practice route renders. */
export const initialKanaPracticeSession = createKanaPracticeSession(0);
