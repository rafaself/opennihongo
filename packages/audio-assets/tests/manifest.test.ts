import { existsSync, readFileSync } from "node:fs";
import {
  hiraganaSyllabary,
  kanaBeginnerWords,
  kanaExercises,
  katakanaSyllabary,
} from "@opennihongo/core";
import { describe, expect, it } from "vitest";
import { audioManifest, getAudioAsset } from "../manifest";

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
      ) as { text: string; reading: string };

      expect(metadata).toMatchObject({
        text: definition.text,
        reading: definition.reading,
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
  });
});
