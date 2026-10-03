import {
  buildExerciseSession,
  generateMatchingExercise,
  generateTypedAnswerExercise,
  normalizeKanaAnswer,
  randomWithoutReplacementSelectionStrategy,
  SeededRandomSource,
  shuffle,
  type ExerciseSession,
  type SessionProfile,
} from "@opennihongo/core";
import {
  kanaPracticeSessionProfiles,
  type KanaChartScript,
  type KanaChartSectionId,
  type KanaChartTile,
  type KanaPracticeMode,
  type KanaQuizDirection,
} from "@opennihongo/content";
import {
  getKanaPracticeItemCount,
  getKanaPracticeTiles,
} from "./kanaPracticeContent";
import { createKanaQuizExercises } from "./createKanaQuizExercises";

export type KanaPracticeOptions = Readonly<{
  mode: KanaPracticeMode;
  script: KanaChartScript;
  category: KanaChartSectionId;
  revision: number;
  direction?: KanaQuizDirection;
}>;

/** Builds generated exercise data before the practice view renders. */
export function createKanaPracticeSession({
  mode,
  script,
  category,
  revision,
  direction = "random",
}: KanaPracticeOptions): ExerciseSession {
  const sessionId = `kana-practice:${mode}:${script}:${category}:${String(revision)}${mode === "quiz" ? `:${direction}` : ""}`;
  const random = new SeededRandomSource(sessionId);
  const tiles = getKanaPracticeTiles(script, category);

  if (mode === "quiz") {
    // Quiz distractors and balanced directions depend on the full category pool.
    const candidates = shuffle(tiles, random);
    const eligible = selectDistinctReadings(candidates);
    const selected = eligible.slice(
      0,
      getKanaPracticeItemCount(mode, script, category),
    );
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
        ),
      ),
    });
  }

  const eligible = mode === "reading" ? tiles : selectDistinctReadings(tiles);
  const itemCount = getKanaPracticeItemCount(mode, script, category);
  const profile = createSessionProfile(mode, itemCount);

  if (itemCount === 0) {
    return Object.freeze({
      id: sessionId,
      profileId: profile.id,
      exercises: Object.freeze([]),
    });
  }

  return buildExerciseSession<KanaChartTile>({
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
}

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
): SessionProfile {
  if (mode === "reading") {
    return {
      ...kanaPracticeSessionProfiles.reading,
      targetSessionSize: itemCount,
      exerciseMix: [{ type: "typed-answer", count: itemCount }],
    };
  }
  return {
    ...kanaPracticeSessionProfiles.matching,
    exerciseMix: [
      { type: "matching", count: 1, config: { pairCount: itemCount } },
    ],
  };
}
