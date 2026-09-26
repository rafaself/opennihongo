import type { KanaId, KanaWordId } from "@opennihongo/core";

export type AudioAssetId = KanaId | KanaWordId;

export const audioManifest = {
  "kana.hiragana.a": "./generated/kana.hiragana.a.opus",
  "kana.hiragana.e": "./generated/kana.hiragana.e.opus",
  "kana.hiragana.i": "./generated/kana.hiragana.i.opus",
  "kana.hiragana.o": "./generated/kana.hiragana.o.opus",
  "kana.hiragana.u": "./generated/kana.hiragana.u.opus",
  "kana.word.hato": "./generated/kana.word.hato.opus",
  "kana.word.mimi": "./generated/kana.word.mimi.opus",
  "kana.word.neko": "./generated/kana.word.neko.opus",
  "kana.word.sato": "./generated/kana.word.sato.opus",
  "kana.word.soto": "./generated/kana.word.soto.opus",
} as const satisfies Record<AudioAssetId, string>;

export function resolveAudioAsset(id: AudioAssetId): string {
  return new URL(audioManifest[id], import.meta.url).href;
}
