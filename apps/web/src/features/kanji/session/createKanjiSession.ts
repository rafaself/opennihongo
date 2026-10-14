import {
  kanjiPracticeProfiles,
  type KanjiPracticeGame,
  type KanjiCharacterContent,
} from "@opennihongo/content";
import {
  buildExerciseSession,
  generateMatchingExercise,
  generateTypedAnswerExercise,
  generateMultipleChoiceExercise,
  randomWithoutReplacementSelectionStrategy,
  SeededRandomSource,
  shuffle,
  type SessionProfile,
} from "@opennihongo/core";
import type { GradedPracticeSession } from "../../../views/practice/interaction/ExercisePracticeView";
import type { CardStackItem } from "../../../views/practice/cards/cardStackContent";
import {
  getKanjiItems,
  getKanjiSummary,
  kanjiConfigurationId,
  type KanjiPracticeSearch,
} from "./options";

export function createKanjiSession(
  mode: Exclude<KanjiPracticeGame, "cards">,
  options: KanjiPracticeSearch,
  revision: number,
  sessionId: string,
): GradedPracticeSession {
  const summary = getKanjiSummary(mode, options);
  if (!summary.canStart) throw new Error(summary.error);
  const random = new SeededRandomSource(
    `kanji:${mode}:${kanjiConfigurationId(options)}:${String(revision)}`,
  );
  const pool = getKanjiItems(options);
  if (mode === "quiz") {
    const targets = shuffle(pool, random).slice(0, summary.count);
    const firstMeaning = random.next() < 0.5;
    const meanings = shuffle(
      targets.map((_, index) =>
        options.focus === "mixed"
          ? (index % 2 === 0) === firstMeaning
          : options.focus === "meanings",
      ),
      random,
    );
    const exercises = targets.map((item, index) => {
      const meaning = meanings[index];
      const answer = (source: typeof item) =>
        meaning ? source.meaning : source.example.reading;
      const seen = new Set([answer(item)]);
      const distractors = shuffle(
        pool.filter(({ id }) => id !== item.id),
        random,
      )
        .filter((source) => {
          const text = answer(source);
          if (seen.has(text)) return false;
          seen.add(text);
          return true;
        })
        .slice(0, summary.choices - 1);
      const exercise = generateMultipleChoiceExercise(
        [
          {
            id: item.id,
            prompt: { text: meaning ? item.glyph : item.example.text },
            correctOptionId: item.id,
            options: [item, ...distractors].map((source) => ({
              id: source.id,
              text: answer(source),
            })),
          },
        ],
        { exerciseId: `${sessionId}:${item.id}` },
        random,
      );
      return Object.freeze({
        ...exercise,
        prompt: Object.freeze(exercise.prompt),
        options: Object.freeze(
          exercise.options.map((option) => Object.freeze(option)),
        ),
        sourceItemIds: Object.freeze(exercise.sourceItemIds),
      });
    });
    return Object.freeze({
      id: sessionId,
      profileId: kanjiPracticeProfiles.quiz.id,
      exercises: Object.freeze(exercises),
    });
  }
  const profile: SessionProfile =
    mode === "reading"
      ? {
          ...kanjiPracticeProfiles.reading,
          targetSessionSize: summary.count,
          exerciseMix: [{ type: "typed-answer", count: summary.count }],
        }
      : {
          ...kanjiPracticeProfiles.matching,
          targetSessionSize: summary.boards.length,
          exerciseMix: summary.boards.map((pairCount) => ({
            type: "matching",
            count: 1,
            config: { pairCount },
          })),
        };
  const session = buildExerciseSession<KanjiCharacterContent>({
    sessionId,
    profile,
    eligibleItems: pool,
    selectionStrategy: randomWithoutReplacementSelectionStrategy,
    sourceAdapters:
      mode === "reading"
        ? {
            "typed-answer": (item) => ({
              id: item.id,
              prompt: { text: item.example.text },
              acceptedAnswers: [
                item.example.reading,
                item.example.romaji,
                ...item.example.romajiVariants,
              ],
            }),
          }
        : {
            matching: (item) => ({
              id: item.id,
              left: item.meaning,
              right: item.glyph,
            }),
          },
    generators:
      mode === "reading"
        ? { "typed-answer": generateTypedAnswerExercise }
        : { matching: generateMatchingExercise },
    random,
  });
  return Object.freeze({
    ...session,
    exercises: Object.freeze(
      session.exercises.filter((exercise) => exercise.type !== "flashcard"),
    ),
  });
}

export function getKanjiCards(
  options: KanjiPracticeSearch,
  showRomaji: boolean,
): readonly CardStackItem[] {
  return getKanjiItems(options).map((item) => ({
    id: item.id,
    front: { text: item.glyph, supportingText: item.example.text, lang: "ja" },
    back: {
      text: item.meaning,
      lang: "en",
      supportingText: `On: ${item.onReadings.join(" · ")}\nKun: ${item.kunReadings.join(" · ")}\n${item.example.text} → ${item.example.reading}${showRomaji ? ` (${item.example.romaji})` : ""} · ${item.example.meaning}`,
    },
    pronunciationText: item.example.pronunciation.text,
    pronunciationLabel: item.example.text,
  }));
}
