import {
  generateMatchingExercise,
  SeededRandomSource,
  type MatchingExercise,
} from "@opennihongo/core";
import {
  kanaBeginnerWords,
  beginnerWordReviewProfileId,
} from "@opennihongo/content";

export type WordsPracticeSession = Readonly<{
  id: string;
  profileId: string;
  rounds: readonly [MatchingExercise, MatchingExercise];
}>;

/** Creates both rounds from the authored words using one stable random order. */
export function createWordsPracticeSession(
  revision: number,
  sessionId: string,
): WordsPracticeSession {
  const random = new SeededRandomSource(`words-review:${String(revision)}`);
  const sourceItems = kanaBeginnerWords.map((word) => ({
    id: word.id,
    left: word.englishMeaning,
    right: word.hiragana,
  }));

  function createRound(roundId: "static" | "rolling"): MatchingExercise {
    return generateMatchingExercise(
      sourceItems,
      {
        exerciseId: `${sessionId}:${roundId}`,
        pairCount: sourceItems.length,
      },
      random,
    );
  }

  return {
    id: sessionId,
    profileId: beginnerWordReviewProfileId,
    rounds: [createRound("static"), createRound("rolling")],
  };
}
