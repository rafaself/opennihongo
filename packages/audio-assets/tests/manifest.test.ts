import { existsSync } from "node:fs";
import { kanaBeginnerWords, hiraganaVowels } from "@opennihongo/core";
import { describe, expect, it } from "vitest";
import { audioManifest, getAudioAsset } from "../manifest";

describe("audio manifest", () => {
  it("maps every seeded Kana identifier to its generated Opus path", () => {
    const audioIds = [
      ...hiraganaVowels.map(({ id }) => id),
      ...kanaBeginnerWords.map(({ id }) => id),
    ];

    expect(Object.keys(audioManifest).sort()).toEqual([...audioIds].sort());

    for (const id of audioIds) {
      expect(audioManifest[id]).toBe(`./generated/${id}.opus`);
    }
  });

  it("returns a URL only when the generated asset exists", () => {
    for (const id of Object.keys(audioManifest)) {
      const assetPath = audioManifest[id as keyof typeof audioManifest];
      const fileExists = existsSync(
        new URL(`../${assetPath}`, import.meta.url),
      );
      const audioAsset = getAudioAsset(id);

      expect(audioAsset !== undefined).toBe(fileExists);
      if (fileExists) {
        expect(audioAsset).toEqual(expect.any(String));
      }
    }
  });

  it("returns undefined for identifiers without a manifest entry", () => {
    expect(getAudioAsset("nihongo")).toBeUndefined();
    expect(getAudioAsset("toString")).toBeUndefined();
  });
});
