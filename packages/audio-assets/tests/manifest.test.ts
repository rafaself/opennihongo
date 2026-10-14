import { existsSync, readFileSync } from "node:fs";
import {
  kanaCharacterCharts,
  beginnerKanji,
  hiraganaSyllabary,
  kanaBeginnerWords,
  katakanaSyllabary,
} from "@opennihongo/content";
import { describe, expect, it } from "vitest";
import {
  audioManifest,
  getAudioAsset,
  getKanaChartAudioAsset,
  kanaChartAudioManifest,
} from "../manifest";

describe("audio manifest", () => {
  const content = [
    ...beginnerKanji.map(({ example }) => ({
      id: example.pronunciation.audioId,
      text: example.text,
      reading: example.pronunciation.text,
    })),
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
  const hiraganaChartTiles = kanaCharacterCharts.hiragana.sections.flatMap(
    (section) =>
      section.rows.flatMap((row) => row.filter((tile) => tile !== null)),
  );
  const katakanaChartTileSlots = kanaCharacterCharts.katakana.sections.flatMap(
    (section) =>
      section.rows.flatMap((row, rowIndex) =>
        row.flatMap((tile, columnIndex) =>
          tile
            ? [
                {
                  slotKey: `${section.id}:${String(rowIndex)}:${String(columnIndex)}`,
                  tile,
                },
              ]
            : [],
        ),
      ),
  );
  const hiraganaChartTileIdsBySlot = new Map<string, string>(
    kanaCharacterCharts.hiragana.sections.flatMap((section) =>
      section.rows.flatMap((row, rowIndex) =>
        row.flatMap((tile, columnIndex) =>
          tile
            ? [
                [
                  `${section.id}:${String(rowIndex)}:${String(columnIndex)}`,
                  tile.id,
                ] as const,
              ]
            : [],
        ),
      ),
    ),
  );
  const chartVoice10000Content = hiraganaChartTiles.map((tile) => {
    const path = kanaChartAudioManifest[tile.id];
    if (!path) {
      throw new Error(`Missing chart audio path for ${tile.id}`);
    }

    return {
      tile,
      path,
      variantId:
        path
          .split("/")
          .at(-1)
          ?.replace(/\.opus$/, "") ?? "",
    };
  });

  it("maps every initial Japanese content identifier to its generated Opus path", () => {
    const audioIds = content.map(({ id }) => id);

    expect(Object.keys(audioManifest).sort()).toEqual([...audioIds].sort());

    for (const id of audioIds) {
      expect(audioManifest[id as keyof typeof audioManifest]).toBe(
        `./generated/${id}.opus`,
      );
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

  it("maps the Hiragana and Katakana charts to shared Nemo voice assets", () => {
    expect(chartVoice10000Content).toHaveLength(115);
    expect(katakanaChartTileSlots).toHaveLength(113);
    expect(Object.keys(kanaChartAudioManifest)).toEqual([
      ...hiraganaChartTiles.map(({ id }) => id),
      ...katakanaChartTileSlots.map(({ tile }) => tile.id),
    ]);

    const collectionManifest = JSON.parse(
      readFileSync(
        new URL(
          "../generated/kana-chart-hiragana-nemo-10000/.manifest.json",
          import.meta.url,
        ),
        "utf-8",
      ),
    ) as { assets: Record<string, unknown> };
    expect(Object.keys(collectionManifest.assets)).toHaveLength(115);

    for (const { tile, variantId, path } of chartVoice10000Content) {
      expect(path).toBe(
        `./generated/kana-chart-hiragana-nemo-10000/${variantId}.opus`,
      );
      expect(getKanaChartAudioAsset(tile.id)).toEqual(expect.any(String));
      expect(existsSync(new URL(`../${path}`, import.meta.url))).toBe(true);

      const metadata = JSON.parse(
        readFileSync(
          new URL(`../${path.replace(/\.opus$/, ".json")}`, import.meta.url),
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
        text: tile.speechText,
        reading: tile.speechText,
        speaker_name: "男声2",
        style_id: 10000,
        attribution: "VOICEVOX Nemo",
      });
    }

    for (const { slotKey, tile } of katakanaChartTileSlots) {
      const hiraganaTileId = hiraganaChartTileIdsBySlot.get(slotKey);
      expect(hiraganaTileId).toBeDefined();
      expect(kanaChartAudioManifest[tile.id]).toBe(
        kanaChartAudioManifest[hiraganaTileId ?? ""],
      );
      expect(getKanaChartAudioAsset(tile.id)).toBe(
        getKanaChartAudioAsset(hiraganaTileId ?? ""),
      );
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

    expect(generatorInput).toEqual(content.slice(30, 122));
  });

  it("keeps Kanji synthesis input aligned with contextual readings", () => {
    const input = JSON.parse(
      readFileSync(
        new URL(
          "../../../tools/audio-generator/inputs/kanji-beginner.json",
          import.meta.url,
        ),
        "utf-8",
      ),
    ) as { id: string; text: string; reading: string }[];
    expect(input).toEqual(content.slice(0, 30));
  });

  it("keeps the chart voice input aligned with every Hiragana chart tile", () => {
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
      chartVoice10000Content.map(({ variantId, tile }) => ({
        id: variantId,
        text: tile.speechText,
        reading: tile.speechText,
      })),
    );
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
    expect(getKanaChartAudioAsset("katakana.unknown.ア")).toBeUndefined();
  });
});
