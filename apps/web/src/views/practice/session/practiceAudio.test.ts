import {
  getAudioAsset,
  getKanaChartAudioAsset,
} from "@opennihongo/audio-assets";
import type { TypedAnswerExercise } from "@opennihongo/core";
import { expect, it } from "vitest";
import {
  getPracticeAudioAsset,
  getPracticeAudioIds,
  getPracticePronunciationText,
} from "./practiceAudio";

it("resolves stable chart and canonical content IDs through their existing audio manifests", () => {
  expect(getPracticeAudioAsset("katakana.small-tsu.ッ+k")).toBe(
    getKanaChartAudioAsset("katakana.small-tsu.ッ+k"),
  );
  expect(getPracticeAudioAsset("kana.word.soto")).toBe(
    getAudioAsset("kana.word.soto"),
  );
  expect(getPracticeAudioAsset("kana.word.soto")).toEqual(expect.any(String));
  expect(getPracticeAudioAsset("unknown.item")).toBeUndefined();
});

it("keeps prompt text as the speech fallback for canonical content outside the chart", () => {
  const exercise: TypedAnswerExercise = {
    id: "reading.soto",
    type: "typed-answer",
    sourceItemIds: ["kana.word.soto"],
    prompt: { text: "そと" },
    acceptedAnswers: ["soto"],
  };
  expect(getPracticePronunciationText(exercise)).toBe("そと");
  expect(getPracticeAudioIds(exercise)).toEqual(["kana.word.soto"]);
});
