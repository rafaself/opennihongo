import {
  hiraganaSyllabary,
  kanaPracticeSessionProfiles,
  kanaCharacterCharts,
  kanaBeginnerWords,
  katakanaSyllabary,
} from "@opennihongo/content";
import {
  generateMatchingExercise,
  generateTypedAnswerExercise,
  randomWithoutReplacementSelectionStrategyId,
  type SessionProfile,
} from "@opennihongo/core";
import { describe, expect, it } from "vitest";
import { getAudioAsset, getKanaChartAudioAsset } from "../manifest";

const supportedExerciseGenerators = {
  "typed-answer": generateTypedAnswerExercise,
  matching: generateMatchingExercise,
} as const;

const supportedSelectionStrategyIds = new Set([
  randomWithoutReplacementSelectionStrategyId,
]);

const supportedMatchingConfigKeys = new Set(["pairCount"]);

const authoredKanaIds = [
  ...hiraganaSyllabary.map(({ id }) => id),
  ...katakanaSyllabary.map(({ id }) => id),
  ...kanaBeginnerWords.map(({ id }) => id),
];

type ReferenceValidationInput = Readonly<{
  authoredLearningIds: readonly string[];
  profile: SessionProfile;
  requiredAudioIds: readonly string[];
  availablePracticeItemCount: number;
}>;

function findReferenceProblems({
  authoredLearningIds,
  profile,
  requiredAudioIds,
  availablePracticeItemCount,
}: ReferenceValidationInput): string[] {
  const problems: string[] = [];
  const seenIds = new Set<string>();

  for (const id of authoredLearningIds) {
    if (id.trim().length === 0) {
      problems.push("Authored learning IDs must be non-empty.");
    }
    if (seenIds.has(id)) {
      problems.push(`Duplicate authored learning ID: ${id}.`);
    }
    seenIds.add(id);
  }

  for (const entry of profile.exerciseMix) {
    if (!Object.hasOwn(supportedExerciseGenerators, entry.type)) {
      problems.push(`Unsupported profile exercise type: ${entry.type}.`);
      continue;
    }

    if (entry.type !== "matching") {
      continue;
    }

    const config = entry.config as Readonly<Record<string, unknown>>;
    for (const key of Object.keys(config)) {
      if (!supportedMatchingConfigKeys.has(key)) {
        problems.push(`Unsupported matching config key: ${key}.`);
      }
    }
    if (entry.config.pairCount > availablePracticeItemCount) {
      problems.push(
        `Matching pair count ${String(entry.config.pairCount)} exceeds the available practice item count ${String(availablePracticeItemCount)}.`,
      );
    }
  }

  if (!supportedSelectionStrategyIds.has(profile.selectionStrategyId)) {
    problems.push(
      `Unsupported profile selection strategy: ${profile.selectionStrategyId}.`,
    );
  }

  for (const id of requiredAudioIds) {
    if (getAudioAsset(id) === undefined) {
      problems.push(`Missing required audio asset for learning ID: ${id}.`);
    }
  }

  return problems;
}

describe("cross-package Kana content references", () => {
  it("keeps authored learning IDs unique and current practice references supported", () => {
    expect(
      findReferenceProblems({
        authoredLearningIds: authoredKanaIds,
        profile: kanaPracticeSessionProfiles.matching,
        requiredAudioIds: kanaBeginnerWords.map(({ id }) => id),
        availablePracticeItemCount: kanaBeginnerWords.length,
      }),
    ).toEqual([]);
  });

  it("supports both Kana game profiles and every chart pronunciation", () => {
    for (const profile of Object.values(kanaPracticeSessionProfiles)) {
      for (const chart of Object.values(kanaCharacterCharts)) {
        for (const section of chart.sections) {
          const tiles = section.rows.flatMap((row) =>
            row.filter((tile) => tile !== null),
          );
          expect(new Set(tiles.map(({ id }) => id)).size).toBe(tiles.length);
          expect(
            findReferenceProblems({
              authoredLearningIds: tiles.map(({ id }) => id),
              profile: {
                ...profile,
                exerciseMix: profile.exerciseMix.map((entry) =>
                  entry.type === "matching"
                    ? {
                        ...entry,
                        config: {
                          pairCount: Math.min(
                            entry.config.pairCount,
                            tiles.length,
                          ),
                        },
                      }
                    : entry,
                ),
              },
              requiredAudioIds: [],
              availablePracticeItemCount: tiles.length,
            }),
          ).toEqual([]);
          for (const tile of tiles)
            expect(getKanaChartAudioAsset(tile.id)).toEqual(expect.any(String));
        }
      }
    }
  });

  it("reports duplicate IDs, unsupported profile references, and missing audio", () => {
    const invalidProfile = {
      ...kanaPracticeSessionProfiles.matching,
      exerciseMix: [
        { type: "unsupported-exercise", count: 1 },
        {
          type: "matching",
          count: 1,
          config: { pairCount: 6, unknownOption: true },
        },
      ],
      selectionStrategyId: "selection.unsupported",
    } as unknown as SessionProfile;

    expect(
      findReferenceProblems({
        authoredLearningIds: ["kana.word.soto", "kana.word.soto", "  "],
        profile: invalidProfile,
        requiredAudioIds: ["kana.word.missing"],
        availablePracticeItemCount: 5,
      }),
    ).toEqual([
      "Duplicate authored learning ID: kana.word.soto.",
      "Authored learning IDs must be non-empty.",
      "Unsupported profile exercise type: unsupported-exercise.",
      "Unsupported matching config key: unknownOption.",
      "Matching pair count 6 exceeds the available practice item count 5.",
      "Unsupported profile selection strategy: selection.unsupported.",
      "Missing required audio asset for learning ID: kana.word.missing.",
    ]);
  });
});
