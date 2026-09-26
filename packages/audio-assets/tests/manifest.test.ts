import { kanaBeginnerWords, hiraganaVowels } from "@opennihongo/core";
import { describe, expect, it } from "vitest";
import { audioManifest, resolveAudioAsset } from "../manifest";

describe("audio manifest", () => {
  it("resolves every seeded Kana identifier to its generated Opus path", () => {
    const audioIds = [
      ...hiraganaVowels.map(({ id }) => id),
      ...kanaBeginnerWords.map(({ id }) => id),
    ];

    expect(Object.keys(audioManifest).sort()).toEqual([...audioIds].sort());

    for (const id of audioIds) {
      const resolved = new URL(resolveAudioAsset(id));

      expect(resolved.pathname.endsWith(`/generated/${id}.opus`)).toBe(true);
    }
  });
});
