import {
  buildExerciseSession,
  generateMatchingExercise,
  generateTypedAnswerExercise,
  normalizeKanaAnswer,
  randomWithoutReplacementSelectionStrategy,
  SeededRandomSource,
  shuffle,
  type Exercise,
  type ExerciseSession,
  type SessionProfile,
} from "@opennihongo/core";
import {
  kanaPracticeSessionProfiles,
  type KanaPracticeMode,
} from "@opennihongo/content";
import type { PracticeSearch } from "../../../app/practiceSearch";
import {
  getKanaPracticeSummary,
  getKanaPracticeTiles,
} from "./kanaPracticeContent";
import { createKanaQuizExercises } from "./createKanaQuizExercises";

export type KanaPracticeOptions = PracticeSearch &
  Readonly<{ mode: KanaPracticeMode; revision: number }>;
export type KanaPracticeExercise = Exclude<Exercise, { type: "flashcard" }>;
export type KanaPracticeSession = Omit<ExerciseSession, "exercises"> &
  Readonly<{ exercises: readonly KanaPracticeExercise[] }>;

export function kanaPracticeConfigurationId(options: PracticeSearch) {
  return JSON.stringify({
    scripts: [...options.scripts].sort(),
    categories: [...options.categories].sort(),
    characterIds:
      options.characterIds === undefined
        ? undefined
        : [...options.characterIds].sort(),
    difficulty: options.difficulty,
    length: options.length,
    direction: options.direction,
  });
}

/** One seeded batch, with unique readings for answer-option games. */
export function createKanaPracticeSession(
  options: KanaPracticeOptions,
  sessionId: string,
): KanaPracticeSession {
  const { mode, revision, direction } = options;
  const summary = getKanaPracticeSummary(mode, options);
  if (!summary.canStart) throw new Error(summary.error);
  const seed = `kana-practice:${mode}:${kanaPracticeConfigurationId(options)}:${String(revision)}`;
  const random = new SeededRandomSource(seed);
  const candidates = shuffle(getKanaPracticeTiles(options), random);
  const eligible =
    mode === "reading" ? candidates : selectDistinctReadings(candidates);

  if (mode === "quiz") {
    const selected = eligible.slice(0, summary.count);
    return Object.freeze({
      id: sessionId,
      profileId: kanaPracticeSessionProfiles[mode].id,
      exercises: Object.freeze(
        createKanaQuizExercises(
          selected,
          eligible,
          direction,
          sessionId,
          random,
          summary.choices,
        ),
      ),
    });
  }

  const profile = createSessionProfile(mode, summary.count, summary.boards);
  const session = buildExerciseSession<KanaPracticeTile>({
    sessionId,
    profile,
    eligibleItems: eligible,
    selectionStrategy: randomWithoutReplacementSelectionStrategy,
    sourceAdapters:
      mode === "reading"
        ? {
            "typed-answer": (tile) => ({
              id: tile.id,
              prompt: { text: tile.glyph },
              acceptedAnswers: [tile.romanization],
            }),
          }
        : {
            matching: (tile) => ({
              id: tile.id,
              left: tile.romanization,
              right: tile.glyph,
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
      session.exercises.filter(
        (exercise): exercise is KanaPracticeExercise =>
          exercise.type !== "flashcard",
      ),
    ),
  });
}

type KanaPracticeTile = ReturnType<typeof getKanaPracticeTiles>[number];

function selectDistinctReadings<Tile extends { romanization: string }>(
  tiles: readonly Tile[],
): Tile[] {
  const readings = new Set<string>();
  return tiles.filter(({ romanization }) => {
    const reading = normalizeKanaAnswer(romanization);
    if (readings.has(reading)) return false;
    readings.add(reading);
    return true;
  });
}

function createSessionProfile(
  mode: "reading" | "matching",
  itemCount: number,
  boardSizes: readonly number[],
): SessionProfile {
  if (mode === "reading") {
    return {
      ...kanaPracticeSessionProfiles.reading,
      targetSessionSize: itemCount,
      exerciseMix: [{ type: "typed-answer", count: itemCount }],
    };
  }
  const exerciseMix = boardSizes.map((pairCount) => ({
    type: "matching" as const,
    count: 1,
    config: { pairCount },
  }));
  return {
    ...kanaPracticeSessionProfiles.matching,
    targetSessionSize: exerciseMix.length,
    exerciseMix,
  };
}
