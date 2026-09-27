import { existsSync, readFileSync } from "node:fs";
import {
  hiraganaSyllabary,
  kanaBeginnerWords,
  kanaExercises,
  katakanaSyllabary,
} from "@opennihongo/core";
import { describe, expect, it } from "vitest";
import {
  audioManifest,
  getAudioAsset,
  getKanaChartAudioAsset,
  kanaChartAudioManifest,
} from "../manifest";

describe("audio manifest", () => {
  const content = [
    ...hiraganaSyllabary.map(({ id, glyph }) => ({
      id,
      text: glyph,
      reading: glyph,
    })),
    ...katakanaSyllabary.map(({ id, glyph }) => ({
      id,
      text: glyph,
      reading: glyph,
    })),
    ...kanaBeginnerWords.map(({ id, hiragana }) => ({
      id,
      text: hiragana,
      reading: hiragana,
    })),
  ];
  const chartVoice10000Content = hiraganaSyllabary.slice(0, 15).map((kana) => ({
    id: kana.id,
    variantId: `kana.chart.hiragana.${kana.id.replace("kana.hiragana.", "")}.nemo-10000`,
    text: kana.glyph,
  }));

  it("maps every initial Japanese content identifier to its generated Opus path", () => {
    const audioIds = content.map(({ id }) => id);

    expect(Object.keys(audioManifest).sort()).toEqual([...audioIds].sort());

    for (const id of audioIds) {
      expect(audioManifest[id]).toBe(`./generated/${id}.opus`);
    }
  });

  it("keeps generated pronunciation metadata aligned with the content catalog", () => {
    for (const definition of content) {
      const metadata = JSON.parse(
        readFileSync(
          new URL(`../generated/${definition.id}.json`, import.meta.url),
          "utf-8",
        ),
      ) as {
        text: string;
        reading: string;
        speaker_name: string;
        style_id: number;
      };

      expect(metadata).toMatchObject({
        text: definition.text,
        reading: definition.reading,
        speaker_name: "女声1",
        style_id: 10005,
      });
    }
  });

  it("keeps the chart comparison voice on separate IDs and files", () => {
    expect(Object.keys(kanaChartAudioManifest)).toEqual(
      chartVoice10000Content.map(({ id }) => id),
    );

    for (const { id, variantId, text } of chartVoice10000Content) {
      const relativePath = `./generated/${variantId}.opus`;
      expect(kanaChartAudioManifest[id]).toBe(relativePath);
      expect(getKanaChartAudioAsset(id)).toEqual(expect.any(String));
      expect(
        existsSync(new URL(`../${relativePath}`, import.meta.url)),
      ).toBe(true);

      const metadata = JSON.parse(
        readFileSync(
          new URL(`../generated/${variantId}.json`, import.meta.url),
          "utf-8",
        ),
      ) as {
        text: string;
        reading: string;
        speaker_name: string;
        style_id: number;
        attribution: string;
      };
      expect(metadata).toMatchObject({
        text,
        reading: text,
        speaker_name: "男声2",
        style_id: 10000,
        attribution: "VOICEVOX Nemo",
      });
    }
  });

  it("keeps the VOICEVOX input aligned with both syllabaries", () => {
    const generatorInput = JSON.parse(
      readFileSync(
        new URL(
          "../../../tools/audio-generator/inputs/kana-syllabary.json",
          import.meta.url,
        ),
        "utf-8",
      ),
    ) as { id: string; text: string; reading: string }[];

    expect(generatorInput).toEqual(content.slice(0, 92));
  });

  it("keeps the separate chart voice input aligned with the 15 selected tiles", () => {
    const generatorInput = JSON.parse(
      readFileSync(
        new URL(
          "../../../tools/audio-generator/inputs/kana-chart-hiragana-voice10000.json",
          import.meta.url,
        ),
        "utf-8",
      ),
    ) as { id: string; text: string; reading: string }[];

    expect(generatorInput).toEqual(
      chartVoice10000Content.map(({ variantId, text }) => ({
        id: variantId,
        text,
        reading: text,
      })),
    );
  });

  it("resolves every audio identifier used by the practice exercises", () => {
    const audioIds = kanaExercises.flatMap(({ audioIds: ids }) => ids);

    expect(audioIds.length).toBeGreaterThan(0);
    for (const id of audioIds) {
      expect(audioManifest[id]).toBe(`./generated/${id}.opus`);
    }
  });

  it("bundles a generated URL for every supported audio identifier", () => {
    for (const id of Object.keys(audioManifest)) {
      const assetPath = audioManifest[id as keyof typeof audioManifest];
      const fileExists = existsSync(
        new URL(`../${assetPath}`, import.meta.url),
      );
      const audioAsset = getAudioAsset(id);

      expect(fileExists).toBe(true);
      expect(audioAsset).toEqual(expect.any(String));
    }
  });

  it("returns undefined for identifiers without a manifest entry", () => {
    expect(getAudioAsset("nihongo")).toBeUndefined();
    expect(getAudioAsset("toString")).toBeUndefined();
    expect(getKanaChartAudioAsset("kana.hiragana.ta")).toBeUndefined();
    expect(getKanaChartAudioAsset("kana.katakana.a")).toBeUndefined();
  });
});
