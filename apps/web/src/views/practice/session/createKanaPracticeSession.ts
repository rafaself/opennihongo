import {
  generateMatchingExercise,
  generateTypedAnswerExercise,
  normalizeKanaAnswer,
  SeededRandomSource,
  shuffle,
  type Exercise,
  type ExerciseSession,
} from "@opennihongo/core";
import {
  kanaPracticeSessionProfiles,
  type KanaChartScript,
  type KanaChartSectionId,
  type KanaPracticeMode,
} from "@opennihongo/content";
import {
  getKanaPracticeItemCount,
  getKanaPracticeTiles,
} from "./kanaPracticeContent";

export type KanaPracticeOptions = Readonly<{
  mode: KanaPracticeMode;
  script: KanaChartScript;
  category: KanaChartSectionId;
  revision: number;
}>;

/** Selects one distinct batch before generating the chosen game. */
export function createKanaPracticeSession({
  mode,
  script,
  category,
  revision,
}: KanaPracticeOptions): ExerciseSession {
  const sessionId = `kana-practice:${mode}:${script}:${category}:${String(revision)}`;
  const random = new SeededRandomSource(sessionId);
  const candidates = shuffle(getKanaPracticeTiles(script, category), random);
  const readings = new Set<string>();
  const eligible =
    mode === "reading"
      ? candidates
      : candidates.filter(({ romanization }) => {
          const reading = normalizeKanaAnswer(romanization);
          if (readings.has(reading)) return false;
          readings.add(reading);
          return true;
        });
  const selected = eligible.slice(
    0,
    getKanaPracticeItemCount(mode, script, category),
  );
  const exercises: Exercise[] = [];
  if (mode === "reading") {
    for (const tile of selected) {
      const exercise = generateTypedAnswerExercise(
        [
          {
            id: tile.id,
            prompt: { text: tile.glyph },
            acceptedAnswers: [tile.romanization],
          },
        ],
        { exerciseId: `${sessionId}:${tile.id}` },
        random,
      );
      exercises.push(
        Object.freeze({
          ...exercise,
          prompt: Object.freeze(exercise.prompt),
          acceptedAnswers: Object.freeze(exercise.acceptedAnswers),
          sourceItemIds: Object.freeze(exercise.sourceItemIds),
        }),
      );
    }
  } else {
    const exercise = generateMatchingExercise(
      selected.map((tile) => ({
        id: tile.id,
        left: tile.romanization,
        right: tile.glyph,
      })),
      { exerciseId: `${sessionId}:matching`, pairCount: selected.length },
      random,
    );
    exercises.push(
      Object.freeze({
        ...exercise,
        config: Object.freeze(exercise.config),
        pairs: Object.freeze(exercise.pairs.map((pair) => Object.freeze(pair))),
        sourceItemIds: Object.freeze(exercise.sourceItemIds),
        leftOrder: Object.freeze(exercise.leftOrder),
        rightOrder: Object.freeze(exercise.rightOrder),
      }),
    );
  }

  return Object.freeze({
    id: sessionId,
    profileId: kanaPracticeSessionProfiles[mode].id,
    exercises: Object.freeze(exercises),
  });
}
