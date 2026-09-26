import type { KanaId, KanaWordId } from "@opennihongo/core";

export type AudioAssetId = KanaId | KanaWordId;

export const audioManifest = {
  "kana.hiragana.a": "./generated/kana.hiragana.a.wav",
  "kana.hiragana.e": "./generated/kana.hiragana.e.wav",
  "kana.hiragana.i": "./generated/kana.hiragana.i.wav",
  "kana.hiragana.o": "./generated/kana.hiragana.o.wav",
  "kana.hiragana.u": "./generated/kana.hiragana.u.wav",
  "kana.word.hato": "./generated/kana.word.hato.wav",
  "kana.word.mimi": "./generated/kana.word.mimi.wav",
  "kana.word.neko": "./generated/kana.word.neko.wav",
  "kana.word.sato": "./generated/kana.word.sato.wav",
  "kana.word.soto": "./generated/kana.word.soto.wav",
} as const satisfies Record<AudioAssetId, string>;

export function resolveAudioAsset(id: AudioAssetId): string {
  return new URL(audioManifest[id], import.meta.url).href;
}
