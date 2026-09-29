import { normalizeKanaAnswer } from "./answer";
import type {
  KanaChoiceExercise,
  KanaPairAnswer,
  KanaTypedAnswerExercise,
  KanaWord,
} from "./types";

export function validateKanaChoiceAnswer(
  exercise: KanaChoiceExercise,
  answer: string,
): boolean {
  const normalizedAnswer = normalizeKanaAnswer(answer);
  const isAvailableChoice = exercise.choices.some(
    (choice) => normalizeKanaAnswer(choice) === normalizedAnswer,
  );

  return (
    isAvailableChoice &&
    normalizedAnswer === normalizeKanaAnswer(exercise.answer)
  );
}

export function scoreKanaChoiceAnswer(
  exercise: KanaChoiceExercise,
  answer: string,
): number {
  return validateKanaChoiceAnswer(exercise, answer) ? 1 : 0;
}

export function validateKanaTypedAnswer(
  exercise: KanaTypedAnswerExercise,
  answer: string,
): boolean {
  return normalizeKanaAnswer(answer) === normalizeKanaAnswer(exercise.answer);
}

export function scoreKanaTypedAnswer(
  exercise: KanaTypedAnswerExercise,
  answer: string,
): number {
  return validateKanaTypedAnswer(exercise, answer) ? 1 : 0;
}

export function scoreKanaMatchingAnswer(
  pairs: readonly Pick<KanaWord, "hiragana" | "romaji">[],
  answers: readonly KanaPairAnswer[],
): number {
  const expectedByRomaji = new Map(
    pairs.map((pair) => [
      normalizeKanaAnswer(pair.romaji),
      normalizeKanaAnswer(pair.hiragana),
    ]),
  );
  const scoredRomaji = new Set<string>();
  let score = 0;

  for (const answer of answers) {
    const romaji = normalizeKanaAnswer(answer.romaji);
    const expectedHiragana = expectedByRomaji.get(romaji);

    if (
      !scoredRomaji.has(romaji) &&
      expectedHiragana !== undefined &&
      expectedHiragana === normalizeKanaAnswer(answer.hiragana)
    ) {
      score += 1;
    }

    scoredRomaji.add(romaji);
  }

  return score;
}

export function validateKanaMatchingAnswer(
  pairs: readonly Pick<KanaWord, "hiragana" | "romaji">[],
  answers: readonly KanaPairAnswer[],
): boolean {
  return (
    answers.length === pairs.length &&
    scoreKanaMatchingAnswer(pairs, answers) === pairs.length
  );
}
